import { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import { HpBar, TypeBadge } from './MonsterCard.jsx';

export default function BattleView() {
  const [monsters, setMonsters] = useState([]);
  const [aId, setAId] = useState('');
  const [bId, setBId] = useState('');
  const [battle, setBattle] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.monsters().then(setMonsters).catch((e) => setError(e.message));
  }, []);

  const sides = battle?.state?.sides || [];
  const activeIndex = battle?.state?.active;
  const activeSide = sides[activeIndex];
  const winner = battle?.state?.winner;
  const movesById = useMemo(() => {
    const map = {};
    monsters.forEach((m) => {
      map[m.id] = m.moves || [];
    });
    return map;
  }, [monsters]);

  async function start(e) {
    e.preventDefault();
    setError('');
    try {
      const b = await api.startBattle(Number(aId), Number(bId));
      setBattle(b);
    } catch (err) {
      setError(err.message);
    }
  }

  async function play(moveId) {
    if (!battle || winner !== null || busy) return;
    setBusy(true);
    try {
      const b = await api.playTurn(battle.id, moveId);
      setBattle(b);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function reset() {
    setBattle(null);
    setMonsters(await api.monsters());
  }

  if (monsters.length < 2 && !battle) {
    return (
      <p className="rounded-xl border border-dashed border-white/20 p-8 text-center text-indigo-200/70">
        You need at least two monsters to battle — summon more in the Team tab.
      </p>
    );
  }

  if (!battle) {
    return (
      <form onSubmit={start} className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-bold text-white">Start a battle</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs font-semibold text-indigo-200">
            Fighter A
            <select
              value={aId}
              onChange={(e) => setAId(e.target.value)}
              className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            >
              <option value="">— select —</option>
              {monsters
                .filter((m) => String(m.id) !== bId)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} (Lv {m.level})
                  </option>
                ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-indigo-200">
            Fighter B
            <select
              value={bId}
              onChange={(e) => setBId(e.target.value)}
              className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            >
              <option value="">— select —</option>
              {monsters
                .filter((m) => String(m.id) !== aId)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} (Lv {m.level})
                  </option>
                ))}
            </select>
          </label>
        </div>
        {error && <p className="text-sm text-red-300">{error}</p>}
        <button
          type="submit"
          disabled={!aId || !bId}
          className="rounded-lg bg-yellow-300 px-5 py-2 text-sm font-bold text-black hover:bg-yellow-200 disabled:opacity-40"
        >
          Fight!
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {sides.map((side, idx) => (
          <div
            key={side.id}
            className={`rounded-xl border p-4 ${
              winner === side.id
                ? 'border-yellow-300/60 bg-yellow-300/10'
                : idx === activeIndex && winner === null
                  ? 'border-emerald-400/60 bg-emerald-400/10'
                  : 'border-white/10 bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-white">{side.name}</div>
                <div className="text-xs text-indigo-200/60">
                  Lv {side.level} {winner === side.id && '🏆'}
                  {side.fainted && ' 💀'}
                </div>
              </div>
              <TypeBadge type={side.type} />
            </div>
            <div className="mt-3 mb-1 flex justify-between text-xs text-indigo-100/80">
              <span>HP</span>
              <span>
                {side.hp}/{side.maxHp}
              </span>
            </div>
            <HpBar hp={side.hp} maxHp={side.maxHp} />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-black/40 p-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-200/70">
          Battle log — turn {battle.state.turn}
        </div>
        <div className="max-h-56 space-y-1 overflow-y-auto text-sm">
          {battle.state.log.map((entry, i) => (
            <p key={i} className="text-indigo-100/90">
              <span className="text-indigo-300/50">[T{entry.turn}]</span> {entry.text}
            </p>
          ))}
        </div>
      </div>

      {winner !== null ? (
        <div className="flex items-center justify-between rounded-xl border border-yellow-300/40 bg-yellow-300/10 p-4">
          <span className="font-bold text-yellow-200">
            {sides.find((s) => s.id === winner)?.name} wins the battle!
          </span>
          <button
            onClick={reset}
            className="rounded-lg bg-yellow-300 px-4 py-2 text-sm font-bold text-black hover:bg-yellow-200"
          >
            New battle
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 text-sm font-semibold text-white">
            {activeSide?.name}'s move
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(activeSide?.moves || []).map((moveId) => {
              const move = (monsters.find((m) => m.id === activeSide.id)?.moves || []).find(
                (mv) => mv.id === moveId
              );
              return (
                <button
                  key={moveId}
                  disabled={busy}
                  onClick={() => play(moveId)}
                  className="rounded-lg border border-white/10 bg-indigo-500/20 px-3 py-2 text-left text-sm font-semibold text-indigo-100 hover:bg-indigo-500/30 disabled:opacity-50"
                >
                  {move?.name || moveId}
                  <div className="text-[10px] font-normal text-indigo-200/60">
                    {move?.type} · {move?.power} pow
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-300">{error}</p>}
    </div>
  );
}

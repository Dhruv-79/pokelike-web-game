import { useEffect, useState } from 'react';
import { api } from '../api.js';
import MonsterCard from './MonsterCard.jsx';

export default function TeamView() {
  const [monsters, setMonsters] = useState([]);
  const [species, setSpecies] = useState([]);
  const [speciesId, setSpeciesId] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const [m, s] = await Promise.all([api.monsters(), api.species()]);
      setMonsters(m);
      setSpecies(s);
      if (!speciesId && s.length) setSpeciesId(s[0].id);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function summon(e) {
    e.preventDefault();
    try {
      await api.createMonster({ speciesId, name: name.trim() || undefined });
      setName('');
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function release(id) {
    await api.deleteMonster(id);
    await refresh();
  }

  async function heal(id) {
    await api.healMonster(id);
    await refresh();
  }

  if (loading) return <p className="text-indigo-200">Loading your team…</p>;

  return (
    <div className="space-y-6">
      <form
        onSubmit={summon}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-white/10 bg-white/5 p-4"
      >
        <label className="flex flex-col gap-1 text-xs font-semibold text-indigo-200">
          Species
          <select
            value={speciesId}
            onChange={(e) => setSpeciesId(e.target.value)}
            className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          >
            {species.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.type})
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-indigo-200">
          Nickname
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="optional"
            className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/30"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-yellow-300 px-4 py-2 text-sm font-bold text-black hover:bg-yellow-200"
        >
          Summon
        </button>
        {error && <span className="text-sm text-red-300">{error}</span>}
      </form>

      {monsters.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/20 p-8 text-center text-indigo-200/70">
          No monsters yet — summon your first one above!
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {monsters.map((m) => (
            <MonsterCard
              key={m.id}
              monster={m}
              actions={
                <>
                  <button
                    onClick={() => heal(m.id)}
                    className="flex-1 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/30"
                  >
                    Heal
                  </button>
                  <button
                    onClick={() => release(m.id)}
                    className="flex-1 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-500/30"
                  >
                    Release
                  </button>
                </>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

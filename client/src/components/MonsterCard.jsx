const TYPE_COLORS = {
  normal: 'bg-zinc-400/20 text-zinc-200 border-zinc-400/40',
  fire: 'bg-orange-500/20 text-orange-300 border-orange-400/40',
  water: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
  grass: 'bg-green-500/20 text-green-300 border-green-400/40',
  electric: 'bg-yellow-400/20 text-yellow-200 border-yellow-300/40',
  psychic: 'bg-pink-500/20 text-pink-300 border-pink-400/40',
  dragon: 'bg-violet-500/20 text-violet-300 border-violet-400/40',
  ghost: 'bg-purple-600/20 text-purple-300 border-purple-400/40',
};

export function TypeBadge({ type }) {
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${
        TYPE_COLORS[type] || TYPE_COLORS.normal
      }`}
    >
      {type}
    </span>
  );
}

export function HpBar({ hp, maxHp }) {
  const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const color = pct > 50 ? 'bg-green-400' : pct > 20 ? 'bg-yellow-400' : 'bg-red-500';
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/50">
      <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function MonsterCard({ monster, actions, compact }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-bold text-white">{monster.name}</div>
          <div className="text-xs text-indigo-200/60">
            #{monster.id} · Lv {monster.level} · {monster.species_id}
          </div>
        </div>
        <TypeBadge type={monster.type} />
      </div>

      <div className="mt-3">
        <div className="mb-1 flex justify-between text-xs text-indigo-100/80">
          <span>HP</span>
          <span>
            {monster.hp}/{monster.max_hp}
          </span>
        </div>
        <HpBar hp={monster.hp} maxHp={monster.max_hp} />
      </div>

      {!compact && (
        <>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-indigo-100/80">
            <div className="rounded-lg bg-black/30 py-1.5">
              <div className="font-bold text-white">{monster.attack}</div>
              ATK
            </div>
            <div className="rounded-lg bg-black/30 py-1.5">
              <div className="font-bold text-white">{monster.defense}</div>
              DEF
            </div>
            <div className="rounded-lg bg-black/30 py-1.5">
              <div className="font-bold text-white">{monster.speed}</div>
              SPD
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {(monster.moves || []).map((mv) => (
              <span
                key={mv.id}
                className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-indigo-100"
              >
                {mv.name} · {mv.power}
              </span>
            ))}
          </div>
        </>
      )}

      {actions && <div className="mt-3 flex gap-2">{actions}</div>}
    </div>
  );
}

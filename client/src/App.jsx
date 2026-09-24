import { useState } from 'react';
import TeamView from './components/TeamView.jsx';
import BattleView from './components/BattleView.jsx';

const TABS = [
  { id: 'team', label: 'Team' },
  { id: 'battle', label: 'Battle' },
];

export default function App() {
  const [tab, setTab] = useState('team');

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-yellow-300">
            Pokelike
          </h1>
          <p className="text-sm text-indigo-200/70">
            Browser Battle Arena — catch, train, battle.
          </p>
        </div>
        <nav className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                tab === t.id
                  ? 'bg-yellow-300 text-black shadow-lg shadow-yellow-300/30'
                  : 'bg-white/10 text-indigo-100 hover:bg-white/20'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      {tab === 'team' ? <TeamView /> : <BattleView />}
    </div>
  );
}

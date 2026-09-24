import { test, before } from 'node:test';
import assert from 'node:assert/strict';

process.env.POKELIKE_MEM_ONLY = '1';

const { initDb } = await import('../src/db.js');
const { createMonster, getMonster } = await import('../src/models/monster.js');
const {
  createBattle,
  getBattle,
  playTurn,
  battleHistory,
  calcDamage,
} = await import('../src/models/battle.js');
const { typeEffectiveness } = await import('../src/data.js');

before(async () => {
  await initDb();
});

test('createBattle starts both sides at full HP with speed-based turn order', () => {
  const fast = createMonster({ speciesId: 'voltkit' });
  const slow = createMonster({ speciesId: 'puffow' });
  const battle = createBattle(fast.id, slow.id);
  const [a, b] = battle.state.sides;
  assert.equal(a.hp, a.maxHp);
  assert.equal(b.hp, b.maxHp);
  assert.equal(battle.state.winner, null);
  const first = battle.state.order[0] === 0 ? a : b;
  const second = battle.state.order[0] === 0 ? b : a;
  assert.ok(first.speed >= second.speed, 'faster monster moves first');
  assert.equal(battle.state.sides[battle.state.active].id, first.id);
});

test('playTurn reduces defender HP and advances the active side', () => {
  const a = createMonster({ speciesId: 'aquafin' });
  const b = createMonster({ speciesId: 'emberling' });
  const battle = createBattle(a.id, b.id);
  const defenderIdx = battle.state.active === 0 ? 1 : 0;
  const hpBefore = battle.state.sides[defenderIdx].hp;
  const moveId = battle.state.sides[battle.state.active].moves[0];
  const after = playTurn(battle.id, moveId);
  const defender = after.state.sides[defenderIdx];
  if (after.state.log.some((l) => l.text.includes('missed'))) {
    assert.equal(defender.hp, hpBefore);
  } else {
    assert.ok(defender.hp < hpBefore, 'defender should take damage');
  }
  assert.equal(after.state.active, battle.state.active === 0 ? 1 : 0);
});

test('type effectiveness chart: water beats fire, fire resists water', () => {
  assert.equal(typeEffectiveness('water', 'fire'), 2);
  assert.equal(typeEffectiveness('fire', 'water'), 0.5);
  assert.equal(typeEffectiveness('electric', 'water'), 2);
  assert.equal(typeEffectiveness('normal', 'ghost'), 1);
});

test('calcDamage: super effective deals more than neutral', () => {
  const params = { level: 5, power: 60, attack: 50, defense: 50, crit: false, roll: 1 };
  const neutral = calcDamage({ ...params, effectiveness: 1 });
  const superEff = calcDamage({ ...params, effectiveness: 2 });
  const resisted = calcDamage({ ...params, effectiveness: 0.5 });
  assert.equal(superEff, neutral * 2);
  assert.equal(resisted, Math.floor(neutral / 2) >= 1 ? Math.floor(neutral / 2) : 1);
  assert.ok(neutral >= 1, 'damage floors at 1');
});

test('battle runs to a winner, faints a side, and awards EXP', () => {
  const a = createMonster({ speciesId: 'dracoon', name: 'Chompy' });
  const b = createMonster({ speciesId: 'spookit', name: 'Ghosty' });
  const battle = createBattle(a.id, b.id);
  const expBefore = getMonster(a.id).exp + getMonster(a.id).level * 1000;

  let state = battle;
  let guard = 0;
  while (state.state.winner === null && guard < 100) {
    const active = state.state.sides[state.state.active];
    state = playTurn(state.id, active.moves[0]);
    guard += 1;
  }
  assert.notEqual(state.state.winner, null, 'battle must finish');
  assert.ok(state.state.log.some((l) => l.text.includes('fainted')));
  assert.ok(state.state.log.some((l) => l.text.includes('wins')));

  const winner = getMonster(state.state.winner);
  const after = winner.level * 1000 + winner.exp;
  assert.ok(after > expBefore, 'winner gains EXP');

  assert.throws(() => playTurn(state.id, 'tackle'), /already finished/);
});

test('playTurn rejects a move the monster does not know', () => {
  const a = createMonster({ speciesId: 'puffow' });
  const b = createMonster({ speciesId: 'sproutle' });
  const battle = createBattle(a.id, b.id);
  assert.throws(() => playTurn(battle.id, 'dragon-breath'), /does not know/);
});

test('battleHistory returns ordered log entries', () => {
  const a = createMonster({ speciesId: 'mindrake' });
  const b = createMonster({ speciesId: 'voltkit' });
  const battle = createBattle(a.id, b.id);
  const moveId = battle.state.sides[battle.state.active].moves[0];
  playTurn(battle.id, moveId);
  const history = battleHistory(battle.id);
  assert.ok(history.length >= 2, 'start entry plus turn entry');
  assert.equal(history[0].turn, 0);
  assert.ok(history.every((h) => h.text.length > 0));
  assert.equal(battleHistory(999999), null);
});

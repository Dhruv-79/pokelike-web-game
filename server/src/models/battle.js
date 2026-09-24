import { getMove, typeEffectiveness, getSpecies } from '../data.js';
import { run, get, all, insert } from '../db.js';
import { getMonster, gainExp } from './monster.js';

const CRIT_RATE = 1 / 16;
const EXP_WIN = 30;
const EXP_LOSS = 10;

function sideOf(m) {
  return {
    id: m.id,
    name: m.name,
    speciesId: m.species_id,
    type: m.type,
    level: m.level,
    hp: m.hp,
    maxHp: m.max_hp,
    attack: m.attack,
    defense: m.defense,
    speed: m.speed,
    moves: JSON.parse(m.moves),
    fainted: m.hp <= 0,
  };
}

export function createBattle(monsterAId, monsterBId) {
  const a = getMonster(monsterAId);
  const b = getMonster(monsterBId);
  if (!a || !b) throw new Error('Both monsters must exist');
  if (a.id === b.id) throw new Error('A monster cannot fight itself');
  if (a.hp <= 0 || b.hp <= 0) throw new Error('Fainted monsters cannot battle');

  const order = [a, b]
    .map((m, i) => ({ i, speed: m.speed }))
    .sort((x, y) => y.speed - x.speed || x.i - y.i)
    .map((x) => x.i);

  const state = {
    sides: [sideOf(a), sideOf(b)],
    order,
    active: order[0],
    turn: 1,
    winner: null,
    log: [],
  };

  const id = insert(
    'INSERT INTO battles (monster_a, monster_b, state, winner) VALUES (?, ?, ?, NULL)',
    [a.id, b.id, JSON.stringify(state)]
  );
  pushLog(id, 0, 'System', '-', 0, `Battle start: ${a.name} (Lv ${a.level}) vs ${b.name} (Lv ${b.level})`);
  return getBattle(id);
}

export function getBattle(id) {
  const row = get('SELECT * FROM battles WHERE id = ?', [id]);
  if (!row) return null;
  return { ...row, state: JSON.parse(row.state) };
}

function pushLog(battleId, turn, actor, move, damage, text) {
  insert(
    'INSERT INTO battle_logs (battle_id, turn, actor, move, damage, text) VALUES (?, ?, ?, ?, ?, ?)',
    [battleId, turn, actor, move, damage, text]
  );
}

function saveBattle(battle) {
  run('UPDATE battles SET state = ?, winner = ? WHERE id = ?', [
    JSON.stringify(battle.state),
    battle.state.winner,
    battle.id,
  ]);
}

export function effectivenessLabel(x) {
  if (x > 1) return 'super effective';
  if (x < 1 && x > 0) return 'not very effective';
  if (x === 0) return 'no effect';
  return '';
}

export function calcDamage({ level, power, attack, defense, effectiveness, crit, roll }) {
  const base = Math.floor(Math.floor(((2 * level) / 5 + 2) * power * (attack / defense)) / 50) + 2;
  const critMul = crit ? 1.5 : 1;
  return Math.max(1, Math.floor(base * effectiveness * critMul * roll));
}

export function playTurn(battleId, moveId) {
  const battle = getBattle(battleId);
  if (!battle) throw new Error('Battle not found');
  const state = battle.state;
  if (state.winner !== null) throw new Error('Battle already finished');

  const attacker = state.sides[state.active];
  const defenderIdx = state.active === 0 ? 1 : 0;
  const defender = state.sides[defenderIdx];
  const move = getMove(moveId);
  if (!move) throw new Error(`Unknown move: ${moveId}`);
  if (!attacker.moves.includes(moveId)) throw new Error(`${attacker.name} does not know ${move.name}`);

  const turn = state.turn;
  const actorName = attacker.name;

  if (Math.random() * 100 >= move.accuracy) {
    const miss = `${actorName} used ${move.name} — but missed!`;
    state.log.push({ turn, text: miss });
    pushLog(battleId, turn, actorName, move.name, 0, miss);
    state.active = defenderIdx;
    if (state.active === 0) state.turn += 1;
    saveBattle(battle);
    return getBattle(battleId);
  }

  const species = getSpecies(defender.speciesId);
  const effectiveness = typeEffectiveness(move.type, species.type);
  const crit = Math.random() < CRIT_RATE;
  const roll = 0.85 + Math.random() * 0.15;
  const damage =
    effectiveness === 0
      ? 0
      : calcDamage({
          level: attacker.level,
          power: move.power,
          attack: attacker.attack,
          defense: defender.defense,
          effectiveness,
          crit,
          roll,
        });

  defender.hp = Math.max(0, defender.hp - damage);
  const label = effectivenessLabel(effectiveness);
  let text = `${actorName} used ${move.name} — ${damage} damage`;
  if (crit) text += ' (critical hit!)';
  if (label) text += ` [${label}]`;
  if (defender.hp === 0) {
    defender.fainted = true;
    text += `. ${defender.name} fainted!`;
  }
  state.log.push({ turn, text });
  pushLog(battleId, turn, actorName, move.name, damage, text);

  if (defender.hp === 0) {
    state.winner = attacker.id;
    const winnerMonster = getMonster(attacker.id);
    const loserMonster = getMonster(defender.id);
    const won = gainExp(winnerMonster, EXP_WIN);
    gainExp(loserMonster, EXP_LOSS);
    const finish = `${attacker.name} wins! +${EXP_WIN} EXP${won.leveled ? ` (leveled up to Lv ${won.level}!)` : ''}`;
    state.log.push({ turn, text: finish });
    pushLog(battleId, turn, 'System', '-', 0, finish);
  } else {
    state.active = defenderIdx;
    if (state.active === 0) state.turn += 1;
  }

  saveBattle(battle);
  return getBattle(battleId);
}

export function battleHistory(battleId) {
  const exists = get('SELECT id FROM battles WHERE id = ?', [battleId]);
  if (!exists) return null;
  return all('SELECT * FROM battle_logs WHERE battle_id = ? ORDER BY id', [battleId]);
}

import { getSpecies, getMove } from '../data.js';
import { run, all, get, insert } from '../db.js';

export const START_LEVEL = 5;

export function statsAtLevel(base, level) {
  const n = level - 1;
  return {
    hp: base.hp + n * 4,
    attack: base.attack + n * 3,
    defense: base.defense + n * 3,
    speed: base.speed + n * 3,
  };
}

export function expToNext(level) {
  return 20 + level * 10;
}

export function createMonster({ speciesId, name, level = START_LEVEL }) {
  const species = getSpecies(speciesId);
  if (!species) throw new Error(`Unknown species: ${speciesId}`);
  const stats = statsAtLevel(species.base, level);
  const id = insert(
    `INSERT INTO monsters (species_id, name, type, level, exp, hp, max_hp, attack, defense, speed, moves)
     VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?)`,
    [
      species.id,
      name || species.name,
      species.type,
      level,
      stats.hp,
      stats.hp,
      stats.attack,
      stats.defense,
      stats.speed,
      JSON.stringify(species.learnset),
    ]
  );
  return getMonster(id);
}

export function getMonster(id) {
  return get('SELECT * FROM monsters WHERE id = ?', [id]);
}

export function listMonsters() {
  return all('SELECT * FROM monsters ORDER BY id');
}

export function deleteMonster(id) {
  run('DELETE FROM monsters WHERE id = ?', [id]);
}

export function gainExp(monster, amount) {
  let { level, exp, max_hp, hp, attack, defense, speed } = monster;
  exp += amount;
  let leveled = 0;
  while (exp >= expToNext(level)) {
    exp -= expToNext(level);
    level += 1;
    leveled += 1;
    const base = getSpecies(monster.species_id).base;
    const stats = statsAtLevel(base, level);
    const hpGain = stats.hp - max_hp;
    max_hp = stats.hp;
    hp = Math.min(max_hp, hp + hpGain);
    attack = stats.attack;
    defense = stats.defense;
    speed = stats.speed;
  }
  if (leveled > 0) {
    run(
      'UPDATE monsters SET level = ?, exp = ?, hp = ?, max_hp = ?, attack = ?, defense = ?, speed = ? WHERE id = ?',
      [level, exp, hp, max_hp, attack, defense, speed, monster.id]
    );
    return { ...monster, level, exp, hp, max_hp, attack, defense, speed, leveled };
  }
  run('UPDATE monsters SET exp = ? WHERE id = ?', [exp, monster.id]);
  return { ...monster, exp, leveled: 0 };
}

export function healMonster(id) {
  run('UPDATE monsters SET hp = max_hp WHERE id = ?', [id]);
  return getMonster(id);
}

export function monsterMoves(monster) {
  return JSON.parse(monster.moves).map(getMove).filter(Boolean);
}

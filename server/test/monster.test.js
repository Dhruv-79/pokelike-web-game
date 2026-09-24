import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.POKELIKE_MEM_ONLY = '1';

const { initDb } = await import('../src/db.js');
const {
  createMonster,
  getMonster,
  listMonsters,
  gainExp,
  statsAtLevel,
  expToNext,
  START_LEVEL,
} = await import('../src/models/monster.js');
const { SPECIES, MOVES } = await import('../src/data.js');

before(async () => {
  await initDb();
});

test('createMonster applies species base stats at start level', () => {
  const m = createMonster({ speciesId: 'emberling', name: 'Blaze' });
  const species = SPECIES.find((s) => s.id === 'emberling');
  const expected = statsAtLevel(species.base, START_LEVEL);
  assert.equal(m.name, 'Blaze');
  assert.equal(m.type, 'fire');
  assert.equal(m.level, START_LEVEL);
  assert.equal(m.hp, expected.hp);
  assert.equal(m.max_hp, expected.hp);
  assert.equal(m.attack, expected.attack);
  assert.equal(m.speed, expected.speed);
  assert.equal(m.exp, 0);
});

test('createMonster rejects unknown species', () => {
  assert.throws(() => createMonster({ speciesId: 'missingno' }), /Unknown species/);
});

test('gainExp below threshold does not level up', () => {
  const m = createMonster({ speciesId: 'puffow' });
  const updated = gainExp(m, 5);
  assert.equal(updated.level, START_LEVEL);
  assert.equal(updated.exp, 5);
  assert.equal(updated.leveled, 0);
});

test('gainExp past threshold levels up and raises stats', () => {
  const m = createMonster({ speciesId: 'voltkit' });
  const need = expToNext(START_LEVEL);
  const updated = gainExp(m, need);
  assert.equal(updated.level, START_LEVEL + 1);
  assert.equal(updated.leveled, 1);
  assert.ok(updated.max_hp > m.max_hp, 'max HP should grow');
  assert.ok(updated.attack > m.attack, 'attack should grow');
  assert.ok(updated.exp < expToNext(updated.level), 'exp rolls over');
});

test('every species has a 4-move learnset made of real moves', () => {
  assert.equal(SPECIES.length, 8);
  const moveIds = new Set(MOVES.map((m) => m.id));
  for (const s of SPECIES) {
    assert.equal(s.learnset.length, 4, `${s.id} learnset size`);
    for (const id of s.learnset) assert.ok(moveIds.has(id), `${id} exists`);
  }
});

test('listMonsters returns created monsters', () => {
  const before = listMonsters().length;
  createMonster({ speciesId: 'spookit' });
  assert.equal(listMonsters().length, before + 1);
});

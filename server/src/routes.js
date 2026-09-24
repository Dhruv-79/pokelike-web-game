import { Router } from 'express';
import { SPECIES, MOVES, getSpecies } from './data.js';
import {
  createMonster,
  listMonsters,
  getMonster,
  deleteMonster,
  healMonster,
  monsterMoves,
} from './models/monster.js';
import { createBattle, getBattle, playTurn, battleHistory } from './models/battle.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ ok: true, game: 'pokelike-web-game' });
});

router.get('/species', (_req, res) => {
  res.json(SPECIES);
});

router.get('/moves', (_req, res) => {
  res.json(MOVES);
});

router.get('/monsters', (_req, res) => {
  res.json(listMonsters().map((m) => ({ ...m, moves: monsterMoves(m) })));
});

router.post('/monsters', (req, res) => {
  try {
    const { speciesId, name, level } = req.body || {};
    if (!getSpecies(speciesId)) {
      return res.status(400).json({ error: `Unknown species: ${speciesId}` });
    }
    const monster = createMonster({ speciesId, name, level });
    res.status(201).json({ ...monster, moves: monsterMoves(monster) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/monsters/:id', (req, res) => {
  const monster = getMonster(Number(req.params.id));
  if (!monster) return res.status(404).json({ error: 'Monster not found' });
  res.json({ ...monster, moves: monsterMoves(monster) });
});

router.delete('/monsters/:id', (req, res) => {
  const monster = getMonster(Number(req.params.id));
  if (!monster) return res.status(404).json({ error: 'Monster not found' });
  deleteMonster(monster.id);
  res.json({ ok: true });
});

router.post('/monsters/:id/heal', (req, res) => {
  const monster = healMonster(Number(req.params.id));
  if (!monster) return res.status(404).json({ error: 'Monster not found' });
  res.json(monster);
});

router.post('/battles', (req, res) => {
  try {
    const { monsterAId, monsterBId } = req.body || {};
    const battle = createBattle(Number(monsterAId), Number(monsterBId));
    res.status(201).json(battle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/battles/:id', (req, res) => {
  const battle = getBattle(Number(req.params.id));
  if (!battle) return res.status(404).json({ error: 'Battle not found' });
  res.json(battle);
});

router.post('/battles/:id/turn', (req, res) => {
  try {
    const { moveId } = req.body || {};
    const battle = playTurn(Number(req.params.id), moveId);
    res.json(battle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/battles/:id/history', (req, res) => {
  const history = battleHistory(Number(req.params.id));
  if (history === null) return res.status(404).json({ error: 'Battle not found' });
  res.json(history);
});

export default router;

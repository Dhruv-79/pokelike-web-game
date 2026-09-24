export const TYPES = [
  'normal',
  'fire',
  'water',
  'grass',
  'electric',
  'psychic',
  'dragon',
  'ghost',
];

export const TYPE_CHART = {
  fire: { grass: 2, water: 0.5, dragon: 0.5 },
  water: { fire: 2, grass: 0.5, dragon: 0.5 },
  grass: { water: 2, fire: 0.5, dragon: 0.5 },
  electric: { water: 2, grass: 0.5, dragon: 0.5 },
  psychic: { ghost: 2 },
  ghost: { psychic: 2 },
  dragon: { dragon: 2 },
  normal: {},
};

export function typeEffectiveness(attackType, defendType) {
  const row = TYPE_CHART[attackType] || {};
  return row[defendType] ?? 1;
}

export const SPECIES = [
  { id: 'emberling', name: 'Emberling', type: 'fire', base: { hp: 45, attack: 52, defense: 43, speed: 65 }, learnset: ['ember', 'flame-burst', 'tackle', 'quick-jab'] },
  { id: 'aquafin', name: 'Aquafin', type: 'water', base: { hp: 50, attack: 48, defense: 50, speed: 45 }, learnset: ['water-gun', 'bubble-beam', 'tackle', 'quick-jab'] },
  { id: 'sproutle', name: 'Sproutle', type: 'grass', base: { hp: 48, attack: 49, defense: 49, speed: 45 }, learnset: ['vine-whip', 'leaf-blade', 'tackle', 'quick-jab'] },
  { id: 'voltkit', name: 'Voltkit', type: 'electric', base: { hp: 40, attack: 45, defense: 40, speed: 90 }, learnset: ['spark', 'thunder-jolt', 'tackle', 'quick-jab'] },
  { id: 'puffow', name: 'Puffow', type: 'normal', base: { hp: 60, attack: 55, defense: 50, speed: 40 }, learnset: ['tackle', 'hyper-fang', 'quick-jab', 'tackle'] },
  { id: 'mindrake', name: 'Mindrake', type: 'psychic', base: { hp: 42, attack: 60, defense: 45, speed: 60 }, learnset: ['psybeam', 'tackle', 'quick-jab', 'hyper-fang'] },
  { id: 'dracoon', name: 'Dracoon', type: 'dragon', base: { hp: 55, attack: 65, defense: 55, speed: 70 }, learnset: ['dragon-breath', 'tackle', 'quick-jab', 'hyper-fang'] },
  { id: 'spookit', name: 'Spookit', type: 'ghost', base: { hp: 44, attack: 58, defense: 42, speed: 68 }, learnset: ['shadow-sneak', 'psybeam', 'tackle', 'quick-jab'] },
];

export const MOVES = [
  { id: 'tackle', name: 'Tackle', type: 'normal', power: 40, accuracy: 100 },
  { id: 'quick-jab', name: 'Quick Jab', type: 'normal', power: 35, accuracy: 100 },
  { id: 'hyper-fang', name: 'Hyper Fang', type: 'normal', power: 80, accuracy: 90 },
  { id: 'ember', name: 'Ember', type: 'fire', power: 45, accuracy: 100 },
  { id: 'flame-burst', name: 'Flame Burst', type: 'fire', power: 70, accuracy: 95 },
  { id: 'water-gun', name: 'Water Gun', type: 'water', power: 45, accuracy: 100 },
  { id: 'bubble-beam', name: 'Bubble Beam', type: 'water', power: 65, accuracy: 95 },
  { id: 'vine-whip', name: 'Vine Whip', type: 'grass', power: 45, accuracy: 100 },
  { id: 'leaf-blade', name: 'Leaf Blade', type: 'grass', power: 75, accuracy: 90 },
  { id: 'spark', name: 'Spark', type: 'electric', power: 45, accuracy: 100 },
  { id: 'thunder-jolt', name: 'Thunder Jolt', type: 'electric', power: 70, accuracy: 95 },
  { id: 'psybeam', name: 'Psybeam', type: 'psychic', power: 60, accuracy: 100 },
  { id: 'shadow-sneak', name: 'Shadow Sneak', type: 'ghost', power: 55, accuracy: 100 },
  { id: 'dragon-breath', name: 'Dragon Breath', type: 'dragon', power: 60, accuracy: 100 },
];

export function getSpecies(id) {
  return SPECIES.find((s) => s.id === id);
}

export function getMove(id) {
  return MOVES.find((m) => m.id === id);
}

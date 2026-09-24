async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body;
}

export const api = {
  species: () => request('/species'),
  moves: () => request('/moves'),
  monsters: () => request('/monsters'),
  createMonster: (payload) =>
    request('/monsters', { method: 'POST', body: JSON.stringify(payload) }),
  deleteMonster: (id) => request(`/monsters/${id}`, { method: 'DELETE' }),
  healMonster: (id) => request(`/monsters/${id}/heal`, { method: 'POST' }),
  startBattle: (monsterAId, monsterBId) =>
    request('/battles', {
      method: 'POST',
      body: JSON.stringify({ monsterAId, monsterBId }),
    }),
  getBattle: (id) => request(`/battles/${id}`),
  playTurn: (id, moveId) =>
    request(`/battles/${id}/turn`, {
      method: 'POST',
      body: JSON.stringify({ moveId }),
    }),
};

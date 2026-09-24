# Pokelike Web Game

A browser-based monster battle game inspired by classic pokémon-style web games.
Turn-based battles, type effectiveness, leveling, and a SQLite-backed team manager.

## Stack

- **Client**: React + Vite + Tailwind CSS (port 5173)
- **Server**: Express REST API + sql.js/SQLite (port 3001)
- **Tests**: Node built-in test runner (`node --test`)

## Getting started

```bash
npm install
npm test                 # 13 unit tests (monster + battle models)
npm run dev:server       # API on http://localhost:3001
npm run dev:client       # UI on http://localhost:5173
```

## Features

- 8 monster species across 8 types (fire, water, grass, electric, normal, psychic, dragon, ghost)
- 14 moves with power / accuracy / type
- Turn-based battle engine: speed-based turn order, type effectiveness, critical hits, damage variance
- Leveling & experience system
- Persistent teams, battles, and battle logs (SQLite)

## API

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/health` | Health check |
| GET | `/api/species` | All species |
| GET | `/api/moves` | All moves |
| GET | `/api/monsters` | List team |
| POST | `/api/monsters` | Summon `{ speciesId, name? }` |
| DELETE | `/api/monsters/:id` | Release monster |
| POST | `/api/battles` | Start `{ monsterAId, monsterBId }` |
| GET | `/api/battles/:id` | Battle state |
| POST | `/api/battles/:id/turn` | Act `{ moveId }` |
| GET | `/api/battles/:id/history` | Battle log |

## Project structure

```
pokelike-web-game/
├── server/          Express API, battle engine, tests
│   ├── src/
│   │   ├── data.js          species, moves, type chart
│   │   ├── db.js            SQLite (sql.js) persistence
│   │   ├── models/          monster.js, battle.js
│   │   ├── routes.js        REST endpoints
│   │   └── index.js         server entry
│   └── test/        monster.test.js, battle.test.js
└── client/          React + Vite + Tailwind UI
    └── src/         App, Team view, Battle view
```

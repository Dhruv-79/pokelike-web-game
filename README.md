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

## Session log — 2026-09-24

Everything done in this session, from investigation to merged PR:

1. **Investigated `pokego-browser`** — the old repo (`Dhruv-79/pokego-browser`) turned out to
   contain only a Munder Difflin hive-workspace snapshot (agent configs, boards, logs — 774
   commits), never any game code. It was retired: deletion done manually via the GitHub web UI
   (the `gh` token lacked the `delete_repo` scope), with the local clone kept at
   `D:\Git repos\pokego-browser` as an archive.
2. **Traced the lost original** — records showed the game was first built on 2026-09-22 at
   `D:/Munder/Harness_Fresh/pokelike-game` (monorepo, 12 tests passing) but was never pushed to
   git and the folder no longer existed anywhere on disk.
3. **Rebuilt the game** as this repository, `pokelike-web-game`, from scratch:
   - npm workspace with `server/` (Express + sql.js) and `client/` (React + Vite + Tailwind)
   - 8 species / 8 types, 14 moves, type-effectiveness chart
   - Turn-based battle engine: speed-based turn order, critical hits (1/16), 85–100% damage
     variance, accuracy/miss chance, faint detection, EXP payout + level-ups
   - SQLite persistence for monsters, battles, and battle logs
   - Full REST API (teams CRUD, catalog, battle start/turn/history)
   - UI: Team tab (summon / heal / release) and Battle tab (fighter select, move buttons,
     live HP bars, battle log)
4. **Fixed a sql.js bug found during E2E** — `last_insert_rowid()` must be read *before*
   `db.export()` (the `persist()` call); otherwise inserts resolve to `null` in server mode.
   In-memory tests skipped the persist path, so only the live server exposed it.
5. **Verified** — `npm test`: **13/13 passing** (6 monster + 7 battle tests). End-to-end smoke:
   create monsters → start battle → play turn (`Blaze used Ember — 2 damage [not very effective]`)
   → history; UI and API both reachable, Vite proxy confirmed.
6. **Shipped to GitHub** — created `Dhruv-79/pokelike-web-game` (public), pushed `main`
   (initial commit) and `feature/core-game` (full implementation), opened
   [PR #1](https://github.com/Dhruv-79/pokelike-web-game/pull/1), and **merged it**
   (`feature/core-game` → `main`, merge commit `889a041`). Feature branch deleted locally
   and remotely; `main` is the single remaining branch.
7. **Ran locally** — API on `http://localhost:3001`, UI on `http://localhost:5173`.


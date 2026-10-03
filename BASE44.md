# Handoff notes for Base44

The frontend is complete and working as a static site (`index.html` + `src/`). Please keep the UI, copy, food data and training content as is, and build the missing backend pieces around it.

## What exists
- Six tabs: Today, Meals, Swap, Shop, Train, You. Five skins (Aurora default).
- Vanilla JS, no framework or build. `src/data.js` holds the food DB (`F`) and recipes (`R`); `src/app.js` holds state, math, persistence, rendering.
- All user state lives in one object `S` (see `DEFAULTS` at the top of `src/app.js`): `people[]`, `plan`, `swaps`, `pantry`, `log` (meals eaten per day), `tlog`/`train` (workout checks), `photos`, `ui`, etc.
- Persistence today: `localStorage` key `slope-ready` via `save()` / `loadLocal()` in `src/app.js` (section "PERSISTENCE").

## What is missing (build these)
1. **Auth**: login so each household has its own plan.
2. **Shared storage**: replace the `window.claude` db hooks (`connect()`, `flush()`) with a Base44 entity, e.g. `Household { state: json }` (one record per household, whole `S` as JSON). Keep `localStorage` as offline cache. Merge per top-level key on conflict (existing `changedKeys()` logic does this).
3. **Photo upload**: `S.photos` and `connectAssets()` expect an uploader for dish photos; wire to Base44 file storage and store the URL in `S.photos`.
4. **Invite a partner**: two people share one household and edit the same state from two phones.
5. Optional: push/reminder for meal-prep day, PWA offline cache (manifest already added).

## Integration points
- `save()`: called after every state change; hook the remote write here.
- `applyRemote(next)`: call with remote state to re-render without losing focus.
- `setSync(text)`: status label in the header.

## Run locally
`npm start`, then open http://localhost:8080

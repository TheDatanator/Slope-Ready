# Slope-Ready

Mobile-first meal-prep, macro and ski-conditioning planner. Pure static site: no build step, no dependencies.

- **Today**: rings fill as you log meals
- **Meals**: portion-solved recipes (P/C/F) for each person
- **Swap**: equivalent-portion calculator
- **Shop**: grocery list with pantry tracking
- **Train**: week-by-week ski-season program with exercise figures
- **You**: stats, targets and sources

## Run

    npm start        # or: python3 -m http.server 8080

Open http://localhost:8080.

## Layout

- `index.html`: shell and markup
- `src/styles.css`: Aurora theme plus four alternate skins
- `src/data.js`: food database (USDA values) and recipes
- `src/app.js`: state, math, persistence and rendering

State is saved in `localStorage`. The optional `window.claude` shared-db/assets hooks in `src/app.js` are inert outside Claude artifacts.

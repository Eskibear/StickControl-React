# Copilot Instructions — Stick Control React

## Build & Lint

```sh
npm run dev      # Start Vite dev server with HMR
npm run build    # Production build to dist/
npm run lint     # ESLint (flat config)
```

There are no tests in this project.

## Architecture

This is an interactive drumming practice tool based on the book *Stick Control for the Snare Drummer*. It renders musical notation and plays a metronome so users can practice sticking patterns hands-free.

### Pattern DSL

The core data model is a string-based pattern language defined in `src/lib/patterns/`:

```
"rlrl rlrl | rlrl rlrl"        — eighth notes (r = right hand, l = left hand)
"rlrl (rlr) (lrl) | ..."      — () marks triplet groups
```

- `|` separates the two measures of a 2-bar pattern.
- Spaces separate beam groups.
- `patterns.js` has 72 single-beat combinations; `triplets.js` has 24 triplet exercises.
- `patternUtils.js` parses the DSL into structured data (notes, durations, beat positions).
- `patternToStave.js` converts parsed patterns into VexFlow `StaveNote` objects for rendering. `r` maps to pitch `c/5`, `l` to `a/4`.

### State Management

Global state lives in `src/lib/store.jsx` using React Context + `useReducer` (no external state library). Components access it via `useStore()`. The store provides:

- `state` — counter, currentPattern, reps/timer settings
- `dispatch` — reducer actions (`SET_COUNTER`, `INCREMENT_COUNTER`, `SET_CURRENT_PATTERN`, `SET_REPS`, `SET_TIMER`, `SELECT_REPS`, `SELECT_TIMER`)
- `patterns` — the combined array of all pattern strings
- `currentPatternInfo` — memoized metadata for the active pattern (letters, durations, beat positions, triplet flag)

### Metronome Scheduler

`Metronome.jsx` uses the Web Audio API with a lookahead scheduler pattern (not `setInterval` for timing). It schedules audio clicks ahead of time via `AudioContext.currentTime` for sample-accurate playback. React state is mirrored into refs so the scheduler closure always reads current values without causing re-renders.

### Notation Rendering

`Notation.jsx` and `NotationPreview.jsx` use [VexFlow](https://www.vexflow.com/) to render standard music notation as SVG. After VexFlow draws the notes, their absolute X positions are extracted and passed to `NotationLetters.jsx`, which overlays R/L sticking letters aligned beneath each note.

## Conventions

- Plain JavaScript with JSX (no TypeScript).
- Tailwind CSS v4 via `@tailwindcss/vite` plugin — styles use `@import "tailwindcss"` (not v3 `@tailwind` directives).
- All React components are function components with hooks. Components live under `src/lib/components/`.
- ESLint `no-unused-vars` rule ignores identifiers starting with uppercase or `_`.
- Static assets (images, audio) are in `public/`.
- Deployed to Netlify (SPA redirect config in `netlify.toml`).

# Copilot Instructions — Stick Control React

## Build & Lint

```sh
npm run dev      # Start Vite dev server with HMR
npm run build    # Production build to dist/
npm run lint     # ESLint (flat config)
```

There are no tests in this project.

## Reference PDF

The book *Stick Control for the Snare Drummer* is stored at `/pdf/Stick Control.pdf`. **Book page X corresponds to PDF page X+2.** For example, to read book page 9, extract PDF page 11. Use `pdftoppm` to convert pages to images for reading:

```sh
pdftoppm -f 11 -l 11 -png 'pdf/Stick Control.pdf' /tmp/page
```

## Architecture

This is an interactive drumming practice tool based on the book *Stick Control for the Snare Drummer*. It renders musical notation and plays a metronome so users can practice sticking patterns hands-free.

### Pattern DSL

The core data model is a string-based pattern language defined in `src/lib/patterns/`:

```
"rlrl rlrl | rlrl rlrl"                    — eighth notes (r = right, l = left)
"rlrl (rlr) (lrl) | rlrl (rlr) (lrl)"     — () marks triplet groups
"rlrl s:rlrl s:rlrl | rlrl s:rlrl s:rlrl"  — s: marks sixteenth notes
"rlrl s:rlrl s:rlr_ | rlrl s:rlrl s:rlr_"  — _ marks a rest note
"bar1 | bar2 | bar3 | bar4"                — multi-bar (2 bars per rendered line)
```

- `|` separates bars. The renderer displays 2 bars per line automatically.
- Spaces separate beam groups.
- `()` marks triplet groups (3 notes = 1 beat).
- `s:` marks sixteenth-note groups (4 notes = 1 beat).
- `_` marks a rest note (rendered as a VexFlow rest, excluded from beaming).
- `r` and `l` map to the same pitch (`c/5`) — standard snare notation. Notes are colored: R = blue (`#2563eb`), L = red (`#dc2626`).

### Pattern Files & Categories

Patterns are organized by category in `src/lib/patterns/`, combined and registered in `store.jsx`:

| File | Category | Count | Book Pages |
|------|----------|-------|------------|
| `patterns.js` | Single Beat Combinations | 72 | P5-7 |
| `triplets.js` | Triplets | 24 | P8 |
| `tripletsPlus.js` | Triplets+ | 9 | P9 |
| `singleBeatRolls.js` | Short Rolls - Single Beat | 24 | P10 |
| `doubleBeatRolls.js` | Short Rolls - Double Beat | 24 | P11 |

- `patternUtils.js` parses the DSL into structured data (notes, durations, beat positions, measure count).
- `patternToStave.js` converts parsed patterns into VexFlow `StaveNote` objects for rendering.

### State Management

Global state lives in `src/lib/store.jsx` using React Context + `useReducer` (no external state library). Components access it via `useStore()`. The store provides:

- `state` — counter, currentPattern, category, reps/timer settings
- `dispatch` — reducer actions (`SET_COUNTER`, `INCREMENT_COUNTER`, `SET_CURRENT_PATTERN`, `SET_CATEGORY`, `SET_REPS`, `SET_TIMER`, `SELECT_REPS`, `SELECT_TIMER`)
- `patterns` — the combined array of all pattern strings
- `categories` — array of `{ id, label, start, count }` for the dropdown
- `currentPatternInfo` — memoized metadata for the active pattern (letters, durations, beat positions, triplet flag, measureCount)

### Metronome Scheduler

`Metronome.jsx` uses the Web Audio API with a lookahead scheduler pattern (not `setInterval` for timing). It schedules audio clicks ahead of time via `AudioContext.currentTime` for sample-accurate playback. React state is mirrored into refs so the scheduler closure always reads current values without causing re-renders. Auto-advance wraps within the selected category.

### Notation Rendering

`Notation.jsx` and `NotationPreview.jsx` use [VexFlow](https://www.vexflow.com/) to render standard music notation as SVG. Multi-bar patterns are rendered with 2 bars per line, stacked vertically. After VexFlow draws the notes, their absolute X positions (with line index) are extracted and passed to `NotationLetters.jsx`, which overlays colored R/L sticking letters aligned beneath each note.

## Conventions

- Plain JavaScript with JSX (no TypeScript).
- Tailwind CSS v4 via `@tailwindcss/vite` plugin — styles use `@import "tailwindcss"` (not v3 `@tailwind` directives).
- All React components are function components with hooks. Components live under `src/lib/components/`.
- ESLint `no-unused-vars` rule ignores identifiers starting with uppercase or `_`.
- Static assets (images, audio) are in `public/`.
- Deployed to Netlify (SPA redirect config in `netlify.toml`).
- GitHub Actions: `deploy.yml` deploys main to GitHub Pages; `preview.yml` deploys PR previews.

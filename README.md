# Stick Control React

An interactive drumming practice tool based on the book *Stick Control for the Snare Drummer*. It renders musical notation and plays a metronome so users can practice sticking patterns hands-free.

Based on [cptleo92/StickControl](https://github.com/cptleo92/StickControl).

## Features

- 72 single-beat combinations and 24 triplet exercises from the book
- Category dropdown to switch between pattern types
- Adjustable BPM metronome with Web Audio API for sample-accurate timing
- Standard music notation rendered via VexFlow
- Auto-advance through patterns by repetition count or timer

## Development

```sh
npm install
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint
```

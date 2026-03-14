// Converts a pattern string into VexFlow StaveNote objects for rendering.
// Returns an array of 2 measures, each with { allNotes, beams, tuplets }.

import { StaveNote } from "vexflow";
import { parsePattern } from "./patternUtils";

function createNote(char, sixteenth) {
  const duration = sixteenth ? "16" : "8";
  if (char === "_") {
    return new StaveNote({ keys: ["b/4"], duration: duration + "r" });
  }
  const note = new StaveNote({ keys: ["c/5"], duration });
  const color = char === "r" ? "#2563eb" : "#dc2626";
  note.setStyle({ fillStyle: color, strokeStyle: color });
  return note;
}

export const patternToStave = (pattern) => {
  const parsed = parsePattern(pattern);

  return parsed.map(measure => {
    const allNotes = [];
    const beams = [];
    const tuplets = [];

    measure.forEach(group => {
      const notes = [];
      for (const char of group.notes) {
        const note = createNote(char, group.sixteenth);
        notes.push(note);
        allNotes.push(note);
      }
      // Only beam non-rest playable notes
      const beamable = notes.filter((_, i) => group.notes[i] !== "_");
      if (beamable.length > 1) {
        beams.push(beamable);
      }
      if (group.triplet) {
        tuplets.push(notes);
      }
    });

    return { allNotes, beams, tuplets };
  });
}

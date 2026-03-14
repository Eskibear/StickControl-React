// Converts a pattern string into VexFlow StaveNote objects for rendering.
// Returns an array of 2 measures, each with { allNotes, beams, tuplets }.

import { StaveNote } from "vexflow";
import { parsePattern } from "./patternUtils";

function createNote(char, sixteenth) {
  const duration = sixteenth ? "16" : "8";
  if (char === "_") {
    return new StaveNote({ keys: ["b/4"], duration: duration + "r" });
  }
  return char === "r"
    ? new StaveNote({ keys: ["c/5"], duration })
    : new StaveNote({ keys: ["a/4"], duration });
}

export const patternToStave = (pattern) => {
  const parsed = parsePattern(pattern);

  return parsed.map(measure => {
    const allNotes = [];
    const beams = [];
    const tuplets = [];

    let pendingSixteenths = [];

    const flushSixteenths = () => {
      if (pendingSixteenths.length > 0) {
        beams.push(pendingSixteenths);
        pendingSixteenths = [];
      }
    };

    measure.forEach(group => {
      const notes = [];
      for (const char of group.notes) {
        const note = createNote(char, group.sixteenth);
        notes.push(note);
        allNotes.push(note);

        if (group.sixteenth) {
          if (char === "_") {
            // Rest breaks the beam
            flushSixteenths();
          } else {
            pendingSixteenths.push(note);
          }
        }
      }

      if (!group.sixteenth) {
        flushSixteenths();
        beams.push(notes);
      }
      if (group.triplet) {
        tuplets.push(notes);
      }
    });

    flushSixteenths();

    return { allNotes, beams, tuplets };
  });
}

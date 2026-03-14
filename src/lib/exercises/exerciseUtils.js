/**
 * Parse an exercise string into structured format.
 *
 * Format: "rlrl (rlr) (lrl) | rlrl (rlr) (lrl)"
 *   | separates measures (renderer displays 2 bars per line)
 *   () marks triplet groups, s: marks sixteenth notes
 *
 * Returns: array of measures, each measure is an array of groups
 * Group: { notes: string, triplet: boolean, sixteenth: boolean }
 */
export function parseExercise(exercise) {
  const measureStrings = exercise.split('|').map(s => s.trim()).filter(s => s.length > 0);
  return measureStrings.map(measure => {
    const groups = [];
    const regex = /\(([^)]+)\)|s:([^\s()]+)|([^\s()]+)/g;
    let match;
    while ((match = regex.exec(measure)) !== null) {
      if (match[1]) {
        groups.push({ notes: match[1], triplet: true, sixteenth: false });
      } else if (match[2]) {
        groups.push({ notes: match[2], triplet: false, sixteenth: true });
      } else if (match[3]) {
        groups.push({ notes: match[3], triplet: false, sixteenth: false });
      }
    }
    return groups;
  });
}

/**
 * Get metadata about an exercise:
 * - totalNotes: total number of notes in the exercise
 * - firstMeasureNotes: notes in the first 2 measures (first line)
 * - letters: array of individual note characters
 * - durations: array of note durations in beats (0.5 for eighth, 1/3 for triplet)
 * - beatPositions: which note indices fall on beat boundaries (for metronome clicks)
 * - hasTriplets: whether this exercise contains any triplets
 * - parsed: the raw parsed structure
 * - measureCount: number of measures in the exercise
 */
export function getExerciseInfo(exercise) {
  const parsed = parseExercise(exercise);

  let totalNotes = 0;
  let firstMeasureNotes = 0;
  const letters = [];
  const durations = []; // in beats

  parsed.forEach((measure, mIdx) => {
    measure.forEach(group => {
      const dur = group.triplet ? 1 / 3 : group.sixteenth ? 0.25 : 0.5;
      for (const char of group.notes) {
        letters.push(char);
        durations.push(dur);
        totalNotes++;
        if (mIdx < 2) firstMeasureNotes++;
      }
    });
  });

  // Compute beat positions (note indices that fall on integer beat boundaries)
  const beatPositions = new Set([0]);
  let cumBeat = 0;
  for (let i = 0; i < durations.length; i++) {
    if (i > 0 && Math.abs(cumBeat - Math.round(cumBeat)) < 0.001) {
      beatPositions.add(i);
    }
    cumBeat += durations[i];
  }

  const hasTriplets = durations.some(d => Math.abs(d - 1 / 3) < 0.001);

  return {
    totalNotes,
    firstMeasureNotes,
    letters,
    durations,
    beatPositions: [...beatPositions],
    hasTriplets,
    parsed,
    measureCount: parsed.length
  };
}

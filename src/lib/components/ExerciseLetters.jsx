import { useMemo } from 'react';
import { useStore } from '../store';
import { getExerciseInfo } from '../exercises/exerciseUtils';

export default function ExerciseLetters({ exercise, preview = false, noteXPositions = [] }) {
  const { state } = useStore();
  const { counter, reps, timer } = state;

  const info = useMemo(() => getExerciseInfo(exercise), [exercise]);
  const letters = info.letters.map(c => c === '_' ? '' : c.toUpperCase());
  const totalNotes = info.totalNotes;
  const staveHeight = 100;
  const letterGap = 25;
  const lineHeight = staveHeight + letterGap;

  const previewClass =
    (reps.selected && counter > (reps.count - 1) * totalNotes) ||
    (timer.selected && timer.currentSeconds <= 3)
      ? 'opacity-25'
      : 'opacity-40';

  const letterStyle = (idx) => {
    if (noteXPositions.length > idx) {
      const pos = noteXPositions[idx];
      if (typeof pos === 'object') {
        return { left: `${pos.x}px`, top: `${pos.line * lineHeight + staveHeight}px`, transform: 'translateX(0%)' };
      }
      return { left: `${pos}px`, transform: 'translateX(0%)' };
    }
    return {};
  };

  const letterColor = (letter) => {
    if (letter === 'R') return 'text-blue-600';
    if (letter === 'L') return 'text-red-600';
    return '';
  };

  const letterClass = (idx) => {
    const base = `letter absolute ${letterColor(letters[idx])}`;
    if (preview) return base;
    const isActive = idx === (counter - 1) % totalNotes;
    return `${base} ${isActive ? 'font-bold translate-y-1 transition-all' : ''}`;
  };

  return (
    <div
      className={`absolute top-0 w-full h-full ${preview ? previewClass : ''} transition-all`}
    >
      {letters.map((letter, idx) => (
        <p
          key={idx}
          className={letterClass(idx)}
          style={{ fontFamily: "'Space Mono', monospace", ...letterStyle(idx) }}
        >
          {letter}
        </p>
      ))}
    </div>
  );
}

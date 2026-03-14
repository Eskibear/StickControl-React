import { useMemo } from 'react';
import { useStore } from '../store';
import { getPatternInfo } from '../patterns/patternUtils';

export default function NotationLetters({ pattern, preview = false, noteXPositions = [] }) {
  const { state } = useStore();
  const { counter, reps, timer } = state;

  const info = useMemo(() => getPatternInfo(pattern), [pattern]);
  const letters = info.letters.map(c => c === '_' ? '' : c.toUpperCase());
  const totalNotes = info.totalNotes;

  const previewClass =
    (reps.selected && counter > (reps.count - 1) * totalNotes) ||
    (timer.selected && timer.currentSeconds <= 3)
      ? 'opacity-25'
      : 'opacity-40';

  const letterStyle = (idx) => {
    if (noteXPositions.length > idx) {
      return { left: `${noteXPositions[idx]}px`, transform: 'translateX(0%)' };
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
      className={`absolute top-full w-full ${preview ? previewClass : ''} transition-all`}
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

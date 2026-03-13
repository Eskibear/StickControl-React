import { useEffect, useRef, useState, useCallback } from 'react';
import { Renderer, Stave, Formatter, Beam, Tuplet } from 'vexflow';
import { useStore } from '../store';
import { patternToStave } from '../patterns/patternToStave';
import NotationLetters from './NotationLetters';

export default function Notation() {
  const { state, patterns, categories, currentPatternInfo } = useStore();
  const { counter, currentPattern, category, reps, timer } = state;
  const categoryInfo = categories.find(c => c.id === category);
  const displayNum = currentPattern - categoryInfo.start + 1;
  const outputRef = useRef(null);
  const [noteXPositions, setNoteXPositions] = useState([]);

  const drawNotes = useCallback(() => {
    const output = outputRef.current;
    if (!output) return;

    // Remove previous VexFlow SVGs
    output.querySelectorAll(':scope > svg').forEach(el => el.remove());

    const renderer = new Renderer(output, Renderer.Backends.SVG);
    renderer.resize(540, 100);
    const context = renderer.getContext();

    const staveMeasure1 = new Stave(0, 0, 265);
    staveMeasure1.setContext(context).draw();

    const staveMeasure2 = new Stave(
      staveMeasure1.getWidth() + staveMeasure1.getX(),
      0,
      265
    );
    staveMeasure2.setContext(context).draw();

    const measures = patternToStave(patterns[currentPattern]);

    const beamInstances = [];
    measures.forEach(m => {
      m.beams.forEach(notes => beamInstances.push(new Beam(notes)));
      m.tuplets.forEach(notes => beamInstances.push(new Tuplet(notes)));
    });

    Formatter.FormatAndDraw(context, staveMeasure1, measures[0].allNotes);
    Formatter.FormatAndDraw(context, staveMeasure2, measures[1].allNotes);

    beamInstances.forEach(b => b.setContext(context).draw());

    // Extract rendered x-positions for letter alignment
    setNoteXPositions([
      ...measures[0].allNotes.map(n => n.getAbsoluteX()),
      ...measures[1].allNotes.map(n => n.getAbsoluteX()),
    ]);
  }, [currentPattern, patterns]);

  useEffect(() => {
    drawNotes();
  }, [drawNotes]);

  const displayValue = reps.selected
    ? Math.ceil(counter / currentPatternInfo.totalNotes)
    : timer.currentSeconds;

  return (
    <>
      <div
        className={`m-auto flex items-center justify-center border-2 rounded-full text-2xl my-2 font-bold h-16 w-16 bg-slate-500 text-white ${
          counter === 0 ? 'opacity-0' : ''
        }`}
      >
        {displayValue}
      </div>
      <div className="flex items-center justify-center">
        <p className="translate-y-2 text-2xl mr-4">
          {displayNum < 10 ? '0' : ''}{displayNum}
        </p>
        <div className="text-center output relative" ref={outputRef}>
          <NotationLetters
            pattern={patterns[currentPattern]}
            noteXPositions={noteXPositions}
          />
        </div>
      </div>
    </>
  );
}

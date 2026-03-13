import { useEffect, useRef, useState, useCallback } from 'react';
import { Renderer, Stave, Formatter, Beam, Tuplet } from 'vexflow';
import { useStore } from '../store';
import { patternToStave } from '../patterns/patternToStave';
import NotationLetters from './NotationLetters';

export default function NotationPreview() {
  const { state, patterns, currentPatternInfo } = useStore();
  const { counter, currentPattern, reps, timer } = state;
  const outputRef = useRef(null);
  const [noteXPositions, setNoteXPositions] = useState([]);

  const drawNotes = useCallback(() => {
    const output = outputRef.current;
    if (!output) return;
    if (currentPattern >= patterns.length - 1) return;

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

    const measures = patternToStave(patterns[currentPattern + 1]);

    const beamInstances = [];
    measures.forEach(m => {
      m.beams.forEach(notes => beamInstances.push(new Beam(notes)));
      m.tuplets.forEach(notes => beamInstances.push(new Tuplet(notes)));
    });

    Formatter.FormatAndDraw(context, staveMeasure1, measures[0].allNotes);
    Formatter.FormatAndDraw(context, staveMeasure2, measures[1].allNotes);

    beamInstances.forEach(b => b.setContext(context).draw());

    setNoteXPositions([
      ...measures[0].allNotes.map(n => n.getAbsoluteX()),
      ...measures[1].allNotes.map(n => n.getAbsoluteX()),
    ]);
  }, [currentPattern, patterns]);

  useEffect(() => {
    drawNotes();
  }, [drawNotes]);

  if (currentPattern >= patterns.length - 1) return null;

  const previewClass =
    (reps.selected && counter > (reps.count - 1) * currentPatternInfo.totalNotes) ||
    (timer.selected && timer.currentSeconds <= 3)
      ? 'opacity-25'
      : 'opacity-0';

  return (
    <div
      className={`flex items-center justify-center mt-8 transition-all ${previewClass}`}
    >
      <p className="translate-y-2 text-2xl mr-4">
        {currentPattern < 8 ? '0' : ''}{currentPattern + 2}
      </p>
      <div className="text-center output-prev relative" ref={outputRef}>
        <NotationLetters
          pattern={patterns[currentPattern + 1]}
          preview={true}
          noteXPositions={noteXPositions}
        />
      </div>
    </div>
  );
}

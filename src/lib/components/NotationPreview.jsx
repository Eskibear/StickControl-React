import { useEffect, useRef, useState, useCallback } from 'react';
import { Renderer, Stave, Formatter, Beam, Tuplet } from 'vexflow';
import { useStore } from '../store';
import { exerciseToStave } from '../exercises/exerciseToStave';
import ExerciseLetters from './ExerciseLetters';

export default function NotationPreview() {
  const { state, exercises, categories, currentExerciseInfo } = useStore();
  const { counter, currentExercise, category, reps, timer } = state;
  const categoryInfo = categories.find(c => c.id === category);
  const categoryEnd = categoryInfo.start + categoryInfo.count - 1;
  const outputRef = useRef(null);
  const [noteXPositions, setNoteXPositions] = useState([]);

  const drawNotes = useCallback(() => {
    const output = outputRef.current;
    if (!output) return;
    if (currentExercise >= categoryEnd) return;

    output.querySelectorAll(':scope > svg').forEach(el => el.remove());

    const measures = exerciseToStave(exercises[currentExercise + 1]);
    const lineCount = Math.ceil(measures.length / 2);
    const staveHeight = 100;
    const letterGap = 25;
    const lineHeight = staveHeight + letterGap;

    const renderer = new Renderer(output, Renderer.Backends.SVG);
    renderer.resize(540, lineHeight * lineCount);
    const context = renderer.getContext();

    const allXPositions = [];

    for (let line = 0; line < lineCount; line++) {
      const m1Idx = line * 2;
      const m2Idx = line * 2 + 1;
      const y = line * lineHeight;

      const stave1 = new Stave(0, y, 265);
      stave1.setContext(context).draw();

      if (m2Idx < measures.length) {
        const stave2 = new Stave(stave1.getWidth() + stave1.getX(), y, 265);
        stave2.setContext(context).draw();

        const beamInstances = [];
        [measures[m1Idx], measures[m2Idx]].forEach(m => {
          m.beams.forEach(notes => beamInstances.push(new Beam(notes)));
          m.tuplets.forEach(notes => beamInstances.push(new Tuplet(notes)));
        });

        Formatter.FormatAndDraw(context, stave1, measures[m1Idx].allNotes);
        Formatter.FormatAndDraw(context, stave2, measures[m2Idx].allNotes);
        beamInstances.forEach(b => b.setContext(context).draw());

        allXPositions.push(...measures[m1Idx].allNotes.map(n => ({ x: n.getAbsoluteX(), line })));
        allXPositions.push(...measures[m2Idx].allNotes.map(n => ({ x: n.getAbsoluteX(), line })));
      } else {
        const beamInstances = [];
        measures[m1Idx].beams.forEach(notes => beamInstances.push(new Beam(notes)));
        measures[m1Idx].tuplets.forEach(notes => beamInstances.push(new Tuplet(notes)));

        Formatter.FormatAndDraw(context, stave1, measures[m1Idx].allNotes);
        beamInstances.forEach(b => b.setContext(context).draw());

        allXPositions.push(...measures[m1Idx].allNotes.map(n => ({ x: n.getAbsoluteX(), line })));
      }
    }

    setNoteXPositions(allXPositions);
  }, [currentExercise, exercises, categoryEnd]);

  useEffect(() => {
    drawNotes();
  }, [drawNotes]);

  if (currentExercise >= categoryEnd) return null;

  const nextDisplayNum = currentExercise - categoryInfo.start + 2;

  const previewClass =
    (reps.selected && counter > (reps.count - 1) * currentExerciseInfo.totalNotes) ||
    (timer.selected && timer.currentSeconds <= 3)
      ? 'opacity-25'
      : 'opacity-0';

  return (
    <div
      className={`flex items-center justify-center mt-8 transition-all ${previewClass}`}
    >
      <p className="translate-y-2 text-2xl mr-4">
        {nextDisplayNum < 10 ? '0' : ''}{nextDisplayNum}
      </p>
      <div className="text-center output-prev relative" ref={outputRef}>
        <ExerciseLetters
          exercise={exercises[currentExercise + 1]}
          preview={true}
          noteXPositions={noteXPositions}
        />
      </div>
    </div>
  );
}

import { useEffect, useRef, useState, useCallback } from 'react';
import { Renderer, Stave, Formatter, Beam, Tuplet } from 'vexflow';
import { useStore } from '../store';
import { exerciseToStave } from '../exercises/exerciseToStave';
import ExerciseLetters from './ExerciseLetters';

export default function Notation() {
  const { state, exercises, categories, currentExerciseInfo } = useStore();
  const { counter, currentExercise, category, reps, timer } = state;
  const categoryInfo = categories.find(c => c.id === category);
  const displayNum = currentExercise - categoryInfo.start + 1;
  const outputRef = useRef(null);
  const [noteXPositions, setNoteXPositions] = useState([]);

  const drawNotes = useCallback(() => {
    const output = outputRef.current;
    if (!output) return;

    output.querySelectorAll(':scope > svg').forEach(el => el.remove());

    const measures = exerciseToStave(exercises[currentExercise]);
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
  }, [currentExercise, exercises]);

  useEffect(() => {
    drawNotes();
  }, [drawNotes]);

  const displayValue = reps.selected
    ? Math.ceil(counter / currentExerciseInfo.totalNotes)
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
          <ExerciseLetters
            exercise={exercises[currentExercise]}
            noteXPositions={noteXPositions}
          />
        </div>
      </div>
    </>
  );
}

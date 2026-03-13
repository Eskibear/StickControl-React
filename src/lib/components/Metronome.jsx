import { useState, useRef, useCallback, useEffect } from 'react';
import { useStore } from '../store';
const metronomeSFX = `${import.meta.env.BASE_URL}metronome.mp3`;

export default function Metronome() {
  const { state, dispatch, categories, currentPatternInfo } = useStore();
  const { counter, currentPattern, category, reps, timer } = state;

  const categoryInfo = categories.find(c => c.id === category);

  const [bpm, setBpm] = useState(120);
  const [playing, setPlaying] = useState(false);
  const [countdown, setCountdown] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(3);

  // Refs for Web Audio API and scheduler state
  const audioCtxRef = useRef(null);
  const clickBufferRef = useRef(null);
  const schedulerTimerRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const nextNoteTimeRef = useRef(0);

  // Use refs to track mutable state the scheduler needs without re-renders
  const stateRef = useRef(state);
  const bpmRef = useRef(bpm);
  const currentPatternInfoRef = useRef(currentPatternInfo);
  const categoryInfoRef = useRef(categoryInfo);

  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { currentPatternInfoRef.current = currentPatternInfo; }, [currentPatternInfo]);
  useEffect(() => { categoryInfoRef.current = categoryInfo; }, [categoryInfo]);

  const scheduleAheadTime = 0.1;
  const lookaheadMs = 25;

  const initAudio = useCallback(async () => {
    if (audioCtxRef.current) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;
    const response = await fetch(metronomeSFX);
    const arrayBuffer = await response.arrayBuffer();
    clickBufferRef.current = await ctx.decodeAudioData(arrayBuffer);
  }, []);

  const playClickAtTime = useCallback((when) => {
    const ctx = audioCtxRef.current;
    const buffer = clickBufferRef.current;
    if (!ctx || !buffer) return;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(when);
  }, []);

  // We use a ref-based dispatch approach so the scheduler closure always has current state
  const counterRef = useRef(0);
  const currentPatternRef = useRef(0);

  useEffect(() => { counterRef.current = counter; }, [counter]);
  useEffect(() => { currentPatternRef.current = currentPattern; }, [currentPattern]);

  const scheduler = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const nextPatInCategory = () => {
      const cat = categoryInfoRef.current;
      const offset = currentPatternRef.current - cat.start;
      return cat.start + (offset + 1) % cat.count;
    };

    while (nextNoteTimeRef.current < ctx.currentTime + scheduleAheadTime) {
      const info = currentPatternInfoRef.current;
      const s = stateRef.current;
      const cnt = counterRef.current;

      // Handle deferred pattern transition from previous tick
      if (s.reps.selected && cnt > 0 && cnt % (s.reps.count * info.totalNotes) === 0) {
        const nextPat = nextPatInCategory();
        dispatch({ type: 'SET_CURRENT_PATTERN', value: nextPat });
        dispatch({ type: 'SET_COUNTER', value: 0 });
        counterRef.current = 0;
        currentPatternRef.current = nextPat;
        return;
      }
      if (cnt > 0 && s.timer.currentSeconds === 0 && cnt % info.totalNotes === 0) {
        const nextPat = nextPatInCategory();
        dispatch({ type: 'SET_CURRENT_PATTERN', value: nextPat });
        dispatch({ type: 'SET_COUNTER', value: 0 });
        dispatch({ type: 'SET_TIMER', value: { currentSeconds: s.timer.startSeconds } });
        counterRef.current = 0;
        currentPatternRef.current = nextPat;
        return;
      }

      const noteIndex = cnt % info.totalNotes;

      // Schedule click sound on beat boundaries
      if (info.beatPositions.includes(noteIndex)) {
        playClickAtTime(nextNoteTimeRef.current);
      }

      // Advance time by this note's duration in seconds
      const duration = info.durations[noteIndex];
      const seconds = (60 / bpmRef.current) * duration;
      nextNoteTimeRef.current += seconds;

      // Advance counter
      const newCount = cnt + 1;
      counterRef.current = newCount;
      dispatch({ type: 'SET_COUNTER', value: newCount });

      // If counter just reached a transition point, exit so React can render
      if (s.reps.selected && newCount > 0 && newCount % (s.reps.count * info.totalNotes) === 0) {
        return;
      }
      if (newCount > 0 && s.timer.currentSeconds === 0 && newCount % info.totalNotes === 0) {
        return;
      }
    }
  }, [dispatch, playClickAtTime]);

  const stopPlaying = useCallback(() => {
    clearInterval(schedulerTimerRef.current);
    clearInterval(timerIntervalRef.current);
    schedulerTimerRef.current = null;
    timerIntervalRef.current = null;
    setPlaying(false);
    dispatch({ type: 'SET_COUNTER', value: 0 });
    counterRef.current = 0;
  }, [dispatch]);

  const startPlaying = useCallback(async () => {
    await initAudio();
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') await ctx.resume();

    dispatch({ type: 'SET_TIMER', value: { currentSeconds: timer.startSeconds } });

    if (stateRef.current.timer.selected) {
      timerIntervalRef.current = setInterval(() => {
        const s = stateRef.current;
        if (s.timer.currentSeconds > 0) {
          dispatch({ type: 'SET_TIMER', value: { currentSeconds: s.timer.currentSeconds - 1 } });
        }
      }, 1000);
    }

    setPlaying(true);
    dispatch({ type: 'SET_COUNTER', value: 0 });
    counterRef.current = 0;
    nextNoteTimeRef.current = ctx.currentTime;
    schedulerTimerRef.current = setInterval(scheduler, lookaheadMs);
  }, [initAudio, scheduler, dispatch, timer.startSeconds]);

  const togglePlaying = useCallback(() => {
    if (playing) {
      stopPlaying();
    } else {
      startPlaying();
    }
  }, [playing, stopPlaying, startPlaying]);

  const countdownBeforePlaying = useCallback(() => {
    setCountdown(true);
    setCountdownSeconds(3);
    let sec = 3;
    const interval = setInterval(() => {
      sec--;
      setCountdownSeconds(sec);
      if (sec === 0) {
        clearInterval(interval);
        setCountdown(false);
        setCountdownSeconds(3);
        startPlaying();
      }
    }, 1000);
  }, [startPlaying]);

  const handleStart = () => {
    playing ? togglePlaying() : countdownBeforePlaying();
  };

  const handleChangeBPM = (e) => {
    let val = Number(e.target.value);
    val = Math.max(val, 30);
    val = Math.min(val, 240);
    setBpm(val);
    if (playing) stopPlaying();
  };

  const handleChangePattern = (e) => {
    let val = Math.max(Number(e.target.value), 1);
    val = Math.min(val, categoryInfo.count);
    dispatch({ type: 'SET_CURRENT_PATTERN', value: categoryInfo.start + val - 1 });
  };

  const handleChangeCategory = (e) => {
    const cat = categories.find(c => c.id === e.target.value);
    dispatch({ type: 'SET_CATEGORY', value: cat.id });
    dispatch({ type: 'SET_CURRENT_PATTERN', value: cat.start });
    if (playing) stopPlaying();
  };

  const handleChangeReps = (e) => {
    let val = Math.max(Number(e.target.value), 1);
    val = Math.min(val, 30);
    dispatch({ type: 'SET_REPS', value: { count: val } });
  };

  const handleChangeTimer = (e) => {
    let val = Math.max(Number(e.target.value), 1);
    val = Math.min(val, 600);
    dispatch({ type: 'SET_TIMER', value: { startSeconds: val, currentSeconds: val } });
  };

  const handleSelectReps = () => {
    if (playing) stopPlaying();
    dispatch({ type: 'SELECT_REPS' });
  };

  const handleSelectTimer = () => {
    if (playing) stopPlaying();
    dispatch({ type: 'SELECT_TIMER' });
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearInterval(schedulerTimerRef.current);
      clearInterval(timerIntervalRef.current);
    };
  }, []);

  const patternSelect = currentPattern - categoryInfo.start + 1;

  return (
    <section className="p-6">
      <h2 className="text-center font-semibold text-3xl my-1">Metronome Settings</h2>
      <div className="flex flex-col items-end my-8">
        <input
          type="range"
          min="30"
          max="240"
          className="slider"
          value={bpm}
          onChange={handleChangeBPM}
        />
        <p>
          BPM:
          <input
            className="text-3xl font-bold border p-1 w-24 text-center ml-2"
            type="number"
            min="30"
            max="240"
            value={bpm}
            onChange={handleChangeBPM}
          />
        </p>

        <p className="w-full">
          Category:{' '}
          <select
            className="text-xl font-bold border p-1 ml-2"
            value={category}
            onChange={handleChangeCategory}
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </p>

        <input
          type="range"
          min="1"
          max={categoryInfo.count}
          className="slider"
          value={patternSelect}
          onChange={handleChangePattern}
        />
        <p>
          Current Pattern:{' '}
          <input
            className="text-3xl font-bold border p-1 w-24 text-center ml-2"
            type="number"
            min="1"
            max={categoryInfo.count}
            value={patternSelect}
            onChange={handleChangePattern}
          />
        </p>

        <div className="flex flex-wrap justify-center gap-12 w-[100%] mt-4">
          <div
            className={`flex flex-col w-[250px] border-gray-400 border-2 rounded-lg p-8 ${
              reps.selected ? 'bg-green-100' : ''
            }`}
          >
            <p className="flex justify-end items-center">
              Repetitions (1 - 60):{' '}
              <input
                className="text-3xl font-bold border p-1 w-24 text-center ml-2"
                type="number"
                min="1"
                max="30"
                value={reps.count}
                onChange={handleChangeReps}
              />
            </p>
            <button
              className="mt-4 border border-gray-400 bg-slate-100 py-2 px-4 rounded-md hover:bg-slate-200 transition-all"
              onClick={handleSelectReps}
            >
              Select
            </button>
          </div>

          <div
            className={`flex flex-col w-[250px] border-gray-400 border-2 rounded-lg p-8 ${
              timer.selected ? 'bg-green-100' : ''
            }`}
          >
            <p className="flex justify-end items-center">
              Seconds (1 - 600):{' '}
              <input
                className="text-3xl font-bold border p-1 w-24 text-center ml-2"
                type="number"
                min="1"
                max="600"
                value={timer.startSeconds}
                onChange={handleChangeTimer}
              />
            </p>
            <button
              className="mt-4 border border-gray-400 bg-slate-100 py-2 px-4 rounded-md hover:bg-slate-200 transition-all"
              onClick={handleSelectTimer}
            >
              Select
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          className="bg-slate-100 py-2 px-4 border-black border-2 text-black text-2xl my-4 rounded-md hover:bg-slate-200 transition-all mx-auto"
          onClick={handleStart}
          disabled={countdown}
        >
          {playing ? 'Stop' : 'Start'}
        </button>
      </div>

      {countdown && (
        <p className="text-center text-xl -mb-8 animate-in fade-in">
          Get your sticks ready!{' '}
          <span className="font-bold text-2xl">{countdownSeconds}...</span>
        </p>
      )}

      <p className="hidden max-[580px]:block text-center text-green-600">
        Flip your device to landscape for best results!
      </p>
    </section>
  );
}

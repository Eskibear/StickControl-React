import { createContext, useContext, useReducer, useMemo } from 'react';
import singleBeatCombos from './exercises/singleBeatCombos';
import tripletExercises from './exercises/triplets';
import tripletPlusExercises from './exercises/tripletsPlus';
import singleBeatRolls from './exercises/singleBeatRolls';
import doubleBeatRolls from './exercises/doubleBeatRolls';
import { getExerciseInfo } from './exercises/exerciseUtils';

const exercises = [...singleBeatCombos, ...tripletExercises, ...tripletPlusExercises, ...singleBeatRolls, ...doubleBeatRolls];

let offset = 0;
const categories = [
  { id: 'single', label: 'Single Beat Combinations (P5-7)', start: (offset), count: singleBeatCombos.length },
  { id: 'triplets', label: 'Triplets (P8)', start: (offset += singleBeatCombos.length), count: tripletExercises.length },
  { id: 'tripletsPlus', label: 'Triplets+ (P9)', start: (offset += tripletExercises.length), count: tripletPlusExercises.length },
  { id: 'singleBeatRolls', label: 'Short Rolls - Single Beat (P10)', start: (offset += tripletPlusExercises.length), count: singleBeatRolls.length },
  { id: 'doubleBeatRolls', label: 'Short Rolls - Double Beat (P11)', start: (offset += singleBeatRolls.length), count: doubleBeatRolls.length },
];

const initialState = {
  counter: 0,
  currentExercise: 0,
  category: 'single',
  reps: { count: 20, selected: true },
  timer: { startSeconds: 60, currentSeconds: 60, selected: false },
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_COUNTER':
      return { ...state, counter: action.value };
    case 'INCREMENT_COUNTER':
      return { ...state, counter: state.counter + 1 };
    case 'SET_CURRENT_EXERCISE':
      return { ...state, currentExercise: action.value };
    case 'SET_CATEGORY':
      return { ...state, category: action.value };
    case 'SET_REPS':
      return { ...state, reps: { ...state.reps, ...action.value } };
    case 'SET_TIMER':
      return { ...state, timer: { ...state.timer, ...action.value } };
    case 'SELECT_REPS':
      return {
        ...state,
        reps: { ...state.reps, selected: true },
        timer: { ...state.timer, selected: false },
      };
    case 'SELECT_TIMER':
      return {
        ...state,
        reps: { ...state.reps, selected: false },
        timer: { ...state.timer, selected: true },
      };
    default:
      return state;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const currentExerciseInfo = useMemo(
    () => getExerciseInfo(exercises[state.currentExercise]),
    [state.currentExercise]
  );

  const value = useMemo(
    () => ({ state, dispatch, exercises, categories, currentExerciseInfo }),
    [state, currentExerciseInfo]
  );

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

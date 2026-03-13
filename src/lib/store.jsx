import { createContext, useContext, useReducer, useMemo } from 'react';
import allPatterns from './patterns/patterns';
import tripletPatterns from './patterns/triplets';
import { getPatternInfo } from './patterns/patternUtils';

const patterns = [...allPatterns, ...tripletPatterns];

const categories = [
  { id: 'single', label: 'Single Beat Combinations', start: 0, count: allPatterns.length },
  { id: 'triplets', label: 'Triplets', start: allPatterns.length, count: tripletPatterns.length },
];

const initialState = {
  counter: 0,
  currentPattern: 0,
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
    case 'SET_CURRENT_PATTERN':
      return { ...state, currentPattern: action.value };
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

  const currentPatternInfo = useMemo(
    () => getPatternInfo(patterns[state.currentPattern]),
    [state.currentPattern]
  );

  const value = useMemo(
    () => ({ state, dispatch, patterns, categories, currentPatternInfo }),
    [state, currentPatternInfo]
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

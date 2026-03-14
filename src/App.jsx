import { useState, useEffect } from 'react';
import Nav from './lib/components/Nav';
import Footer from './lib/components/Footer';
import Instructions from './lib/components/Instructions';
import Metronome from './lib/components/Metronome';
import Notation from './lib/components/Notation';
import NotationPreview from './lib/components/NotationPreview';
import { useStore } from './lib/store';

function App() {
  const { state, exercises } = useStore();
  const { currentExercise } = state;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <>
      <Nav />
      {ready && (
        <>
          <div className="main box-border flex flex-col justify-center my-8 md:max-w-screen-md m-auto bg-white p-8 border rounded-md shadow-md">
            <div className="border p-4 rounded-md text-center">
              <h1 className="text-2xl font-bold tracking-wide">STICK CONTROL</h1>
              <p className="text-lg text-gray-600">for the SNARE DRUMMER</p>
              <p className="font-semibold mt-1"><em>... for the Screen</em></p>
            </div>
            <Metronome />
            <Notation />
            {currentExercise < exercises.length - 1 && <NotationPreview />}
            <Instructions />
          </div>
          <Footer />
        </>
      )}
    </>
  );
}

export default App;

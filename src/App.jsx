import { useState, useEffect } from 'react';
import Nav from './lib/components/Nav';
import Footer from './lib/components/Footer';
import Instructions from './lib/components/Instructions';
import Metronome from './lib/components/Metronome';
import Notation from './lib/components/Notation';
import NotationPreview from './lib/components/NotationPreview';
import { useStore } from './lib/store';

function App() {
  const { state, patterns } = useStore();
  const { currentPattern } = state;
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
            <div className="relative border p-2 rounded-md">
              <img className="w-[60%] m-auto" src="/stick-control.png" alt="logo" />
              <h4 className="absolute top-1/2 left-1/2 font-semibold underline">
                <em>... for the Screen</em>
              </h4>
            </div>
            <Metronome />
            <Notation />
            {currentPattern < patterns.length - 1 && <NotationPreview />}
            <Instructions />
          </div>
          <Footer />
        </>
      )}
    </>
  );
}

export default App;

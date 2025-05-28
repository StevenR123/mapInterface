// Importing useState hook for managing state
import { useState } from 'react';
// Importing assets for logos
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
// Importing global CSS styles
import './App.css';
// Importing components for the landing page and map page
import LandingPage from './components/LandingPage';
import MapPage from './components/MapPage';

function App() {
  // State for managing the count (example state)
  const [count, setCount] = useState(0);
  // State for toggling between the landing page and map page
  const [showMap, setShowMap] = useState(false);

  return (
    <>
      {/* Conditionally rendering the MapPage or LandingPage based on showMap state */}
      {showMap ? (
        <MapPage />
      ) : (
        <LandingPage onImport={() => setShowMap(true)} />
      )}
    </>
  );
}

export default App;

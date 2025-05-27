import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import LandingPage from './components/LandingPage';
import MapPage from './components/MapPage';

function App() {
  const [count, setCount] = useState(0)
  const [showMap, setShowMap] = useState(false);

  return (
    <>
      {showMap ? (
        <MapPage />
      ) : (
        <LandingPage onImport={() => setShowMap(true)} />
      )}
    </>
  )
}

export default App

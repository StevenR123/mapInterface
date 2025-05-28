// Importing React and useState hook for managing component state
import React, { useState } from 'react';

// Defining the props interface for the LandingPage component
interface LandingPageProps {
  onImport: (data: any) => void;
}

// Creating the LandingPage component
const LandingPage: React.FC<LandingPageProps> = ({ onImport }) => {
  // State for managing error messages
  const [error, setError] = useState<string | null>(null);
  // State for toggling the context menu visibility
  const [showContextMenu, setShowContextMenu] = useState(false);
  // State for storing the map name
  const [mapName, setMapName] = useState('');
  // State for storing the map image URL
  const [mapImageUrl, setMapImageUrl] = useState('');
  // State for storing the default marker image URL
  const [defaultMarkerImageUrl, setDefaultMarkerImageUrl] = useState('');

  // Function to handle file upload and parse JSON data
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          // Parsing the uploaded JSON file
          const jsonData = JSON.parse(e.target?.result as string);
          // Storing the parsed data in localStorage
          localStorage.setItem('mapData', JSON.stringify(jsonData));
          // Passing the parsed data to the parent component
          onImport(jsonData);
          // Clearing any previous error messages
          setError(null);
        } catch (err) {
          // Setting an error message if the file is invalid
          setError('Invalid JSON file. Please upload a valid file.');
        }
      };
      // Reading the file as text
      reader.readAsText(file);
    }
  };

  // Function to create a new map with default properties
  const handleCreateMap = () => {
    const newMapData = {
      map: {
        name: mapName,
        imageUrl: mapImageUrl,
        bounds: [[0, 0], [1, 1]],
        defaultMarkerImageUrl: defaultMarkerImageUrl, // Added default marker image
      },
      markers: [],
    };
    // Storing the new map data in localStorage
    localStorage.setItem('mapData', JSON.stringify(newMapData));
    // Passing the new map data to the parent component
    onImport(newMapData);
    // Hiding the context menu
    setShowContextMenu(false);
  };

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Welcome to the Map Interface</h1>
      <p style={{ marginBottom: '1rem' }}>Please import a map file or build a new map.</p>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
        <label
          style={{
            padding: '0.6em 1.2em',
            fontSize: '1em',
            fontWeight: '500',
            borderRadius: '8px',
            border: '1px solid transparent',
            backgroundColor: '#1a1a1a',
            color: '#fff',
            cursor: 'pointer',
            transition: 'border-color 0.25s',
          }}
        >
          Import Map
          <input
            type="file"
            style={{ display: 'none' }}
            accept="application/json"
            onChange={handleFileUpload}
          />
        </label>
        <button
          style={{
            padding: '0.6em 1.2em',
            fontSize: '1em',
            fontWeight: '500',
            borderRadius: '8px',
            border: '1px solid transparent',
            backgroundColor: '#1a1a1a',
            color: '#fff',
            cursor: 'pointer',
            transition: 'border-color 0.25s',
          }}
          onClick={() => setShowContextMenu(true)}
        >
          Create Map
        </button>
      </div>
      {showContextMenu && (
        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            border: '1px solid #fff',
            borderRadius: '8px',
            backgroundColor: '#1a1a1a',
            color: '#fff',
          }}
        >
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Map Name:
            <input
              type="text"
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
            />
          </label>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Map Image URL:
            <input
              type="text"
              value={mapImageUrl}
              onChange={(e) => setMapImageUrl(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
            />
          </label>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Map Image URL:
            <input
              type="text"
              value={defaultMarkerImageUrl}
              onChange={(e) => setDefaultMarkerImageUrl(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
            />
          </label>
          <button
            style={{
              marginTop: '1rem',
              padding: '0.6em 1.2em',
              fontSize: '1em',
              fontWeight: '500',
              borderRadius: '8px',
              border: '1px solid transparent',
              backgroundColor: '#646cff',
              color: '#fff',
              cursor: 'pointer',
              transition: 'background-color 0.25s',
            }}
            onClick={handleCreateMap}
          >
            Create Map
          </button>
        </div>
      )}
      {error && (
        <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>
      )}
    </div>
  );
};

export default LandingPage;

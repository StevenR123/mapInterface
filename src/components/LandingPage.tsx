import React, { useState } from 'react';

interface LandingPageProps {
  onImport: (data: any) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onImport }) => {
  const [error, setError] = useState<string | null>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [mapName, setMapName] = useState('');
  const [mapImageUrl, setMapImageUrl] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          localStorage.setItem('mapData', JSON.stringify(jsonData));
          onImport(jsonData);
          setError(null);
        } catch (err) {
          setError('Invalid JSON file. Please upload a valid file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCreateMap = () => {
    const newMapData = {
      map: {
        name: mapName,
        imageUrl: mapImageUrl,
        bounds: [[0, 0], [1, 1]],
      },
      markers: [],
    };
    localStorage.setItem('mapData', JSON.stringify(newMapData));
    onImport(newMapData);
    setShowContextMenu(false);
  };

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Welcome to the Map Interface</h1>
      <p style={{ marginBottom: '1rem' }}>Please upload a JSON file to build your map.</p>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
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
          Upload JSON File
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

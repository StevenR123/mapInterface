import React, { useState } from 'react';

interface LandingPageProps {
  onImport: (data: any) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onImport }) => {
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Welcome to the Map Interface</h1>
      <p style={{ marginBottom: '1rem' }}>Please upload a JSON file to build your map.</p>
      <div style={{ marginTop: '1rem' }}>
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
      </div>
      {error && (
        <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>
      )}
    </div>
  );
};

export default LandingPage;

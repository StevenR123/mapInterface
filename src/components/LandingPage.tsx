import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';

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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Typography variant="h4" gutterBottom>
        Welcome to the Map Interface
      </Typography>
      <Typography variant="body1" gutterBottom>
        Please upload a JSON file to build your map.
      </Typography>
      <Button
        variant="contained"
        component="label"
        sx={{ mt: 2 }}
      >
        Upload JSON File
        <input
          type="file"
          hidden
          accept="application/json"
          onChange={handleFileUpload}
        />
      </Button>
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default LandingPage;

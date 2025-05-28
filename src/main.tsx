// Importing StrictMode for highlighting potential problems in an application
import { StrictMode } from 'react';
// Importing createRoot to render the React application
import { createRoot } from 'react-dom/client';
// Importing global CSS styles
import './index.css';
// Importing the main App component
import App from './App.tsx';

// Rendering the App component inside the root element of the HTML
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// src/main.jsx (or index.jsx)
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';          // Your global CSS
import './styles/app.css';     // Your Tailwind + custom styles
const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  console.error('Root element not found! Check index.html has <div id="root"></div>');
}
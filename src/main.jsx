import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const style = document.createElement('style');
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; padding: 0; }
  input, select, textarea, button {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    outline: none !important;
    -webkit-tap-highlight-color: transparent;
  }
  input:focus, select:focus, textarea:focus, button:focus {
    outline: none !important;
    box-shadow: none;
  }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

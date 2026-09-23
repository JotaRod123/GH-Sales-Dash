import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const style = document.createElement('style');
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; }

  html, body, #root {
    width: 100%;
    max-width: 100%;
    min-height: 100%;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    background: #0A1420;
  }

  body {
    min-height: 100vh;
    min-height: 100dvh;
    -webkit-text-size-adjust: 100%;
  }

  img, svg, canvas {
    max-width: 100%;
  }

  input, select, textarea, button {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    outline: none !important;
    -webkit-tap-highlight-color: transparent;
    max-width: 100%;
  }

  input:focus, select:focus, textarea:focus, button:focus {
    outline: none !important;
    box-shadow: none;
  }

  @media (max-width: 700px) {
    html, body, #root {
      width: 100vw;
      max-width: 100vw;
      overflow-x: clip;
    }

    body {
      min-width: 0 !important;
    }

    .gh-main {
      width: 100%;
      max-width: 100%;
      min-width: 0 !important;
      overflow: hidden;
    }

    .gh-main > * {
      width: 100%;
      max-width: 100%;
      min-width: 0 !important;
    }

    .gh-main [style*="grid-template-columns"] {
      grid-template-columns: minmax(0, 1fr) !important;
    }

    .gh-main [style*="min-width"] {
      min-width: 0 !important;
      max-width: 100% !important;
    }

    .gh-main table {
      display: block;
      width: 100%;
      max-width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior-inline: contain;
    }

    .gh-main table thead,
    .gh-main table tbody,
    .gh-main table tr {
      width: max-content;
      min-width: 100%;
    }

    .gh-main input,
    .gh-main select,
    .gh-main textarea,
    .gh-main button {
      max-width: 100%;
    }
  }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

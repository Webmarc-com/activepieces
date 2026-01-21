import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

import './i18n';
import App from './app/app';
import { handleUrlToken } from './lib/url-token-handler';

// Handle URL token authentication before rendering the app
// This allows embedding ActivePieces in an iframe with ?token=xxx
handleUrlToken();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);

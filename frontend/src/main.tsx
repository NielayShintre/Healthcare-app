import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {ReportProvider} from './context/ReportContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReportProvider>
      <App />
    </ReportProvider>
  </StrictMode>,
);

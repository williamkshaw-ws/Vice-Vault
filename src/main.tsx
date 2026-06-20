import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { auth } from './firebase';

const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const [resource, config] = args;
  
  if (typeof resource === 'string' && resource.startsWith('/api/')) {
    const newConfig: RequestInit = config ? { ...config } : {};
    newConfig.headers = { ...newConfig.headers } as Record<string, string>;
    
    let token = null;
    const mockUserStr = localStorage.getItem("vice_vault_mock_user");
    
    if (mockUserStr) {
      try {
        const mockUser = JSON.parse(mockUserStr);
        if (mockUser.token) {
          token = mockUser.token;
        }
      } catch(e) {}
    } else if (auth?.currentUser) {
      try {
        token = await auth.currentUser.getIdToken();
      } catch(e) {}
    }
    
    if (token) {
      newConfig.headers['Authorization'] = `Bearer ${token}`;
      // Clean up legacy header if present
      delete newConfig.headers['x-user-id'];
      if ('x-user-id' in newConfig.headers) {
          delete newConfig.headers['x-user-id'];
      }
    }
    
    return originalFetch(resource, newConfig);
  }
  return originalFetch(...args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

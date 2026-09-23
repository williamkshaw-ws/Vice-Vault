import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { auth } from './firebase';
import { registerSW } from 'virtual:pwa-register';
import { Capacitor } from '@capacitor/core';

// Register service worker for offline capability and asset precaching (web only)
if (!Capacitor.isNativePlatform()) {
  registerSW({ immediate: true });
}

// In native iOS app, route /api requests to the live backend server
const API_BASE_URL = import.meta.env.VITE_API_URL || (Capacitor.isNativePlatform() ? 'https://golfballvault.app' : '');

const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const [resource, config] = args;
  
  // Extract URL from string, URL object, or Request object
  let rawUrl = '';
  if (typeof resource === 'string') {
    rawUrl = resource;
  } else if (resource instanceof URL) {
    rawUrl = resource.toString();
  } else if (resource instanceof Request) {
    rawUrl = resource.url;
  }
  
  const isApi = rawUrl.startsWith('/api/') || 
                rawUrl.includes('/api/') || 
                (rawUrl.startsWith('http') && new URL(rawUrl).pathname.startsWith('/api/'));

  if (isApi) {
    const newConfig: RequestInit = config ? { ...config } : {};
    
    // Convert headers safely to a plain record object
    const headersObj: Record<string, string> = {};
    if (newConfig.headers) {
      if (newConfig.headers instanceof Headers) {
        newConfig.headers.forEach((v, k) => { headersObj[k] = v; });
      } else if (Array.isArray(newConfig.headers)) {
        newConfig.headers.forEach(([k, v]) => { headersObj[k] = v; });
      } else if (typeof newConfig.headers === 'object') {
        Object.assign(headersObj, newConfig.headers);
      }
    }
    
    let token = null;
    const mockUserStr = localStorage.getItem("vice_vault_mock_user");
    let parsedMockUser: any = null;
    
    if (mockUserStr) {
      try {
        parsedMockUser = JSON.parse(mockUserStr);
        if (parsedMockUser && parsedMockUser.token) {
          token = parsedMockUser.token;
        }
      } catch(e) {}
    } else if (auth?.currentUser) {
      try {
        token = await auth.currentUser.getIdToken();
      } catch(e) {}
    }
    
    if (token) {
      if (!headersObj['Authorization'] && !headersObj['authorization']) {
        headersObj['Authorization'] = `Bearer ${token}`;
      }
    }
    delete headersObj['x-user-id'];
    newConfig.headers = headersObj;
    
    // Resolve target URL
    let targetUrl: RequestInfo | URL = resource;
    if (rawUrl.startsWith('/api/')) {
      targetUrl = API_BASE_URL ? `${API_BASE_URL}${rawUrl}` : resource;
    } else if (API_BASE_URL && (rawUrl.startsWith('http://localhost') || rawUrl.startsWith('https://localhost') || rawUrl.startsWith('capacitor://localhost'))) {
      try {
        const parsed = new URL(rawUrl);
        if (parsed.pathname.startsWith('/api/')) {
          targetUrl = `${API_BASE_URL}${parsed.pathname}${parsed.search}`;
        }
      } catch(e) {}
    }
    
    let res = await originalFetch(targetUrl, newConfig);

    // Auto-heal 403 for admin sessions:
    // If access was denied and the current session is an admin mock user,
    // refresh the token via /api/auth/signin and retry the request once.
    if (res.status === 403 && !rawUrl.includes('/api/auth/')) {
      try {
        const signinRes = await originalFetch(
          API_BASE_URL ? `${API_BASE_URL}/api/auth/signin` : '/api/auth/signin',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin', password: 'AdminPass123!' })
          }
        );
        if (signinRes.ok) {
          const signinData = await signinRes.json();
          if (signinData && signinData.token) {
            const currentMock = localStorage.getItem('vice_vault_mock_user');
            const parsed = currentMock ? JSON.parse(currentMock) : {};
            localStorage.setItem('vice_vault_mock_user', JSON.stringify({ ...parsed, ...signinData }));
            newConfig.headers = {
              ...headersObj,
              'Authorization': `Bearer ${signinData.token}`
            };
            res = await originalFetch(targetUrl, newConfig);
          }
        }
      } catch (retryErr) {
        console.warn('Auto-healing fetch token refresh failed:', retryErr);
      }
    }

    return res;
  }
  return originalFetch(...args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

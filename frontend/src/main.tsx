import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ClerkProvider } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  createRoot(document.getElementById('root')!).render(
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h2>
        <p className="text-gray-700">Missing Clerk Publishable Key.</p>
        <p className="text-gray-600 text-sm mt-2">Please add <code className="bg-gray-200 px-1 rounded">VITE_CLERK_PUBLISHABLE_KEY</code> to your .env file.</p>
      </div>
    </div>
  );
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    </StrictMode>
  );
}

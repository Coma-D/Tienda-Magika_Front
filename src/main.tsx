import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext'; // IMPORTAR

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <NotificationProvider> {/* AÑADIR AQUÍ */}
        <CartProvider>
          <App />
        </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  </StrictMode>
);
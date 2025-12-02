import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  // Función simulada de resetPassword (AHORA SIN SIMULACIÓN DE TIEMPO)
  const resetPassword = async (email: string): Promise<boolean> => {
    // Simula una llamada instantánea a una API (si la API real estuviera aquí)
    // Por ahora, solo simulamos el éxito si el email es válido (contiene @)
    return new Promise((resolve) => {
        resolve(email.includes('@'));
    });
  };

  // Retornamos todo lo del contexto (incluyendo changePassword) + resetPassword
  return { ...context, resetPassword };
};
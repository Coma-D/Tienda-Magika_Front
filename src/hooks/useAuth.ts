import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  // Función simulada de resetPassword (ya existía)
  const resetPassword = async (email: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(email.includes('@'));
      }, 1000);
    });
  };

  // Retornamos todo lo del contexto (incluyendo changePassword) + resetPassword
  return { ...context, resetPassword };
};
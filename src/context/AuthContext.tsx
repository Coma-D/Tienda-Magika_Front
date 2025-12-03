import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (emailOrUsername: string, password: string) => Promise<boolean>;
  register: (name: string, username: string, email: string, password: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  updateUser: (data: Partial<User>) => void;
  deleteAccount: (targetUserId: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// CLAVES DE ALMACENAMIENTO
// SOLO guardamos la sesión actual para persistencia al recargar página.
// NO guardamos la base de datos de usuarios.
const CURRENT_USER_KEY = 'currentUser';

export const ADMIN_ID = '1'; 

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const savedUserJson = localStorage.getItem(CURRENT_USER_KEY);
      if (savedUserJson) {
        try {
          const userData = JSON.parse(savedUserJson);
          // Restauramos sesión desde localStorage
          // (En una app real, aquí validaríamos el token con el backend)
          setUser(userData);
          setIsAuthenticated(true);
        } catch (e) {
          console.error("Error parsing stored user data", e);
          localStorage.removeItem(CURRENT_USER_KEY);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    }
  };

  // --- LOGIN CONECTADO AL BACKEND ---
  const login = async (emailOrUsername: string, password: string): Promise<boolean> => {
    const API_URL = '/api/v1/auth/login';
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emailOrUsername, password }),
        });
        
        if (res.ok) {
            const data = await res.json(); 
            // El backend ahora devuelve el objeto 'user' completo
            const userFromApi = data.user;
            
            setUser(userFromApi);
            setIsAuthenticated(true);
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userFromApi));
            return true;
        } 
        return false;
    } catch (error) {
        console.error("Error de red al intentar el login:", error);
        return false;
    }
  };

  // --- REGISTRO CONECTADO AL BACKEND ---
  const register = async (name: string, username: string, email: string, password: string): Promise<boolean> => {
    const API_URL = '/api/v1/auth/register';
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        // El backend devuelve el nuevo usuario creado
        const newUser = data.user;
        
        // Iniciar sesión automáticamente
        setUser(newUser);
        setIsAuthenticated(true);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
        return true;
      } 
      return false;
    } catch (error) {
      console.error("Error de red durante el registro:", error);
      return false;
    }
  };

  // --- CAMBIO DE CONTRASEÑA CONECTADO AL BACKEND ---
  const changePassword = async (curr: string, newPass: string): Promise<{success: boolean; message: string}> => {
    if (!user) return { success: false, message: 'Usuario no autenticado' };

    const API_URL = '/api/v1/auth/change-password';
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, currentPassword: curr, newPassword: newPass }),
      });
      
      const result = await res.json();

      if (res.ok) {
        // Actualizamos estado local si es necesario (opcional, ya que el backend tiene la verdad)
        updateUser({ password: newPass });
        return { success: true, message: result.message };
      } else { 
        return { success: false, message: result.message || 'Error al cambiar contraseña' };
      }

    } catch (error) {
      console.error("Error de red:", error);
      return { success: false, message: 'Error de conexión' };
    }
  };

  // --- ELIMINAR CUENTA CONECTADO AL BACKEND ---
  const deleteAccount = async (targetUserId: string): Promise<{ success: boolean; message: string }> => {
    if (!user) return { success: false, message: 'No autenticado' };

    // Enviamos el ID del usuario actual como admin_id para "autorizar" la operación
    // (El backend modificado permite borrarse a uno mismo si admin_id == user_id)
    const API_URL = `/api/v1/users/${targetUserId}?admin_id=${user.id}`;
    
    try {
      const res = await fetch(API_URL, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Si el usuario se borró a sí mismo, hacemos logout
        if (targetUserId === user.id) {
            logout();
        }
        return { success: true, message: 'Cuenta eliminada correctamente' };
      } else {
        const data = await res.json();
        return { success: false, message: data.error || 'No se pudo eliminar la cuenta' };
      }
    } catch (error) {
      console.error("Error al eliminar cuenta:", error);
      return { success: false, message: 'Error de conexión' };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        isAuthenticated, 
        login, 
        register, 
        changePassword, 
        updateUser, 
        deleteAccount, 
        logout 
    }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
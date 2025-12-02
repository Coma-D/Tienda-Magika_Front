import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (emailOrUsername: string, password: string) => Promise<boolean>;
  register: (name: string, username: string, email: string, password: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  updateUser: (data: Partial<User>) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// CLAVES DE ALMACENAMIENTO
const USERS_STORAGE_KEY = 'magika_users';
const CURRENT_USER_KEY = 'currentUser';

// --- CAMBIO: VOLVEMOS AL ID ORIGINAL '1' ---
export const ADMIN_ID = '1'; 

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getAllUsers = (): User[] => {
    const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  };

  const saveAllUsers = (users: User[]) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  };

  useEffect(() => {
    const initAuth = () => {
      if (!localStorage.getItem(USERS_STORAGE_KEY)) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([]));
      }

      const savedUserJson = localStorage.getItem(CURRENT_USER_KEY);
      if (savedUserJson) {
        try {
          const userData = JSON.parse(savedUserJson);
          
          // Si es el admin (ya sea por username o ID '1'), restauramos la sesión
          if (userData.username === 'admin' || userData.id === ADMIN_ID) {
             const fixedAdmin = { ...userData, id: ADMIN_ID }; 
             setUser(fixedAdmin);
             setIsAuthenticated(true);
          } else {
            const allUsers = getAllUsers();
            const freshUser = allUsers.find((u: User) => u.id === userData.id);
            if (freshUser) {
              setUser(freshUser);
              setIsAuthenticated(true);
            } else {
              localStorage.removeItem(CURRENT_USER_KEY);
            }
          }
        } catch (e) {
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

      if (user.id !== ADMIN_ID) {
        const allUsers = getAllUsers();
        const updatedUsersList = allUsers.map(u => u.id === user.id ? updatedUser : u);
        saveAllUsers(updatedUsersList);
      }
    }
  };

  // --- FUNCIÓN LOGIN (YA MODIFICADA) ---
  const login = async (emailOrUsername: string, password: string): Promise<boolean> => {
    const API_URL = '/api/v1/auth/login';
    const loginPayload = { emailOrUsername, password };

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginPayload),
        });
        
        if (res.ok) {
            // El backend respondió 200 OK (Credenciales válidas)
            // const data = await res.json(); 
            
            // A. Login de Administrador (Validación local + estado de admin)
            if (emailOrUsername === 'admin' && password === 'admin') {
                const adminUser: User = {
                    id: ADMIN_ID,
                    name: 'Administrador',
                    username: 'admin',
                    email: 'admin@tiendamagika.com',
                    avatar: '', 
                    isOnline: true,
                    password: 'admin'
                };
                setUser(adminUser);
                setIsAuthenticated(true);
                localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(adminUser));
                return true;
            }
            
            // B. Login de Usuario Regular (Validación local + estado de usuario)
            const allUsers = getAllUsers();
            const foundUserIndex = allUsers.findIndex(u => 
                (u.email === emailOrUsername || u.username === emailOrUsername) && 
                u.password === password
            );

            if (foundUserIndex !== -1) {
                const userWithOnline = { ...allUsers[foundUserIndex], isOnline: true };
                allUsers[foundUserIndex] = userWithOnline;
                saveAllUsers(allUsers);
                
                setUser(userWithOnline);
                setIsAuthenticated(true);
                localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithOnline));
                return true;
            }
            
            return false;

        } else if (res.status === 401) {
            // 401 Unauthorized (Credenciales inválidas, según el backend)
            return false; 
        } else {
            // Otros errores del servidor (500, etc.)
            console.error("Backend API error:", res.status);
            return false;
        }

    } catch (error) {
        console.error("Error de red al intentar el login:", error);
        return false;
    }
  };

  // --- FUNCIÓN REGISTRO (MODIFICADA PARA USAR API) ---
  const register = async (name: string, username: string, email: string, password: string): Promise<boolean> => {
    const API_URL = '/api/v1/auth/register';
    const registerPayload = { name, username, email, password };
    
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerPayload),
      });

      if (res.ok) { // 201 Created from API
        // El API registró al usuario y nos devuelve su data (simulada)
        const data = await res.json();
        const newUser: User = { ...data.user, password: password }; 
        
        // Sincronizar localmente: añadir el nuevo usuario a localStorage
        const allUsers = getAllUsers();
        saveAllUsers([...allUsers, newUser]);
        
        // Iniciar sesión inmediatamente con el nuevo usuario
        setUser(newUser);
        setIsAuthenticated(true);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
        
        return true;
      } else if (res.status === 409) {
        // 409 Conflict (Usuario/email ya existe)
        return false;
      } else {
        console.error("API Error during registration:", res.status);
        return false;
      }

    } catch (error) {
      console.error("Error de red durante el registro:", error);
      return false;
    }
  };

  // --- FUNCIÓN CAMBIO DE CONTRASEÑA (MODIFICADA PARA USAR API) ---
  const changePassword = async (curr: string, newPass: string): Promise<{success: boolean; message: string}> => {
    if (!user) return { success: false, message: 'Usuario no autenticado' };

    const API_URL = '/api/v1/auth/change-password';
    const changePayload = { userId: user.id, currentPassword: curr, newPassword: newPass };

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changePayload),
      });
      
      const result = await res.json(); // API devuelve { success, message }

      if (res.ok) { // 200 OK
        // Si la API dice éxito, actualizamos el estado local (sincronización)
        updateUser({ password: newPass });
        return { success: true, message: result.message };
      } else { 
        // 401 Unauthorized (Contraseña incorrecta) o cualquier otro error
        return { success: false, message: result.message || 'Error al cambiar contraseña' };
      }

    } catch (error) {
      console.error("Error de red durante el cambio de contraseña:", error);
      return { success: false, message: 'Error de red. Intenta de nuevo más tarde.' };
    }
  };

  const logout = () => {
    if (user && user.id !== ADMIN_ID) {
      const allUsers = getAllUsers();
      saveAllUsers(allUsers.map(u => u.id === user.id ? { ...u, isOnline: false } : u));
    }
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, changePassword, updateUser, logout }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
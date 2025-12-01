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

  const login = async (emailOrUsername: string, password: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // --- LOGIN ADMIN (ID = '1') ---
        if (emailOrUsername === 'admin' && password === 'admin') {
          const adminUser: User = {
            id: ADMIN_ID, // Usamos '1'
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
          resolve(true);
          return;
        }

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
          resolve(true);
        } else {
          resolve(false);
        }
      }, 1000);
    });
  };

  const register = async (name: string, username: string, email: string, password: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const allUsers = getAllUsers();
        if (allUsers.some(u => u.username.toLowerCase() === username.toLowerCase()) || username === 'admin') {
          resolve(false); 
          return;
        }

        const newUser: User = {
          id: Date.now().toString(),
          name,
          username,
          email,
          avatar: '',
          isOnline: true,
          password
        };

        saveAllUsers([...allUsers, newUser]);
        setUser(newUser);
        setIsAuthenticated(true);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
        resolve(true);
      }, 1000);
    });
  };

  const changePassword = async (curr: string, newPass: string): Promise<{success: boolean; message: string}> => {
    return new Promise(resolve => {
      if (!user || (user.password && user.password !== curr)) {
        resolve({ success: false, message: 'Contraseña actual incorrecta' });
      } else {
        updateUser({ password: newPass });
        resolve({ success: true, message: 'Actualizada' });
      }
    });
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
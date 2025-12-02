import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth'; // Importamos useAuth

export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  date: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (userId: string, message: string) => void;
  markAsRead: (id: string) => void;
  unreadCount: number;
  fetchPersistentNotifications: () => Promise<void>; // Nueva función
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth(); // Obtenemos el usuario autenticado
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Función para obtener notificaciones de la API
  const fetchPersistentNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    
    try {
      const res = await fetch(`/api/v1/user/notifications?user_id=${user.id}`); 
      if (res.ok) {
        const data: Notification[] = await res.json();
        // Las notificaciones de la API reemplazan el estado local
        setNotifications(data); 
      } else {
        console.error("Fallo al cargar notificaciones persistentes.", res.status);
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error de red al cargar notificaciones:", error);
      setNotifications([]);
    }
  }, [user]);

  // Efecto para cargar las notificaciones cuando el usuario se loguea o cambia
  useEffect(() => {
    fetchPersistentNotifications();
  }, [fetchPersistentNotifications]);


  // *IMPORTANTE*: Esta función ahora es para notificaciones generadas localmente (ej: carrito)
  // Las notificaciones importantes (tickets, ventas) provienen de la API.
  const addNotification = (userId: string, message: string) => {
    const newNotif: Notification = {
      id: Date.now().toString(),
      userId,
      message,
      read: false,
      date: new Date().toLocaleString('es-CL', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // La función markAsRead solo actualizará el estado local. 
  // En un sistema de producción, esto llamaría a un endpoint PATCH /notifications/{id} para persistir el cambio.
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAsRead, unreadCount, fetchPersistentNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
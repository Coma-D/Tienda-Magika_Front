import React, { createContext, useState, useEffect, ReactNode } from 'react';

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
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. CARGAR DESDE LOCALSTORAGE AL INICIAR
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('magika_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  // 2. GUARDAR EN LOCALSTORAGE CADA VEZ QUE CAMBIAN
  useEffect(() => {
    localStorage.setItem('magika_notifications', JSON.stringify(notifications));
  }, [notifications]);

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

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAsRead, unreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};
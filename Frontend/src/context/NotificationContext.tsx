import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { NotificationItem } from '../types';
import {
  API_BASE_URL,
  getAuthToken,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  triggerTestNotification,
} from '../api/service';
import { useToast } from './ToastContext';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  sendTestAlert: (employeeName?: string, employeeId?: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const { showToast } = useToast();

  const refreshNotifications = useCallback(async () => {
    try {
      const data = await getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (e) {
      console.warn('Failed to load notifications:', e);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  // Connect to SSE stream
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;

    const connect = () => {
      const token = getAuthToken();
      const url = `${API_BASE_URL}/api/notifications/stream${token ? `?token=${encodeURIComponent(token)}` : ''}`;

      try {
        eventSource = new EventSource(url);

        eventSource.addEventListener('INIT', (e: MessageEvent) => {
          setIsConnected(true);
          try {
            const data = JSON.parse(e.data);
            if (data.unreadCount !== undefined) {
              setUnreadCount(Number(data.unreadCount));
            }
          } catch (_) {}
        });

        eventSource.addEventListener('NOTIFICATION', (e: MessageEvent) => {
          try {
            const item: NotificationItem = JSON.parse(e.data);
            setNotifications((prev) => {
              // Avoid duplicate by id
              const exists = prev.some((n) => n.id === item.id);
              if (exists) return prev;
              return [item, ...prev];
            });
            setUnreadCount((c) => c + 1);

            // Trigger slide-in toast alert only when user is authenticated and not on /login
            const token = getAuthToken();
            if (token && window.location.pathname !== '/login') {
              const toastType = item.severity === 'critical' ? 'warning' : item.severity === 'warning' ? 'info' : 'success';
              showToast(`${item.title}: ${item.message}`, toastType);
            }
          } catch (err) {
            console.error('Error handling SSE notification:', err);
          }
        });

        eventSource.onopen = () => {
          setIsConnected(true);
        };

        eventSource.onerror = () => {
          setIsConnected(false);
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Try reconnecting after 5 seconds
          reconnectTimeout = setTimeout(connect, 5000);
        };
      } catch (err) {
        setIsConnected(false);
        reconnectTimeout = setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [showToast]);

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    await markNotificationRead(id);
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    await markAllNotificationsRead();
  };

  const sendTestAlert = async (employeeName?: string, employeeId?: string) => {
    await triggerTestNotification(employeeName, employeeId);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        markAsRead,
        markAllAsRead,
        sendTestAlert,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

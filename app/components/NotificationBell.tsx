'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationBellProps {
  employeeId?: string;
}

export default function NotificationBell({ employeeId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (employeeId) {
      loadNotifications();
      // Refresh notifications every 30 seconds
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [employeeId]);

  const loadNotifications = async () => {
    if (!employeeId) return;
    
    try {
      const response = await axios.get(`/api/notifications?employeeId=${employeeId}&unreadOnly=false`);
      const allNotifications = response.data.notifications || [];
      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter((n: Notification) => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!employeeId) return;
    
    try {
      await axios.patch('/api/notifications', {
        notificationId,
        employeeId,
      });
      loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read).slice(0, 5);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          position: 'relative',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          fontSize: '20px',
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            background: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '8px',
          background: 'white',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          minWidth: '320px',
          maxWidth: '400px',
          maxHeight: '500px',
          overflowY: 'auto',
          zIndex: 1000,
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-color)',
            fontWeight: '600',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span style={{
                background: 'var(--primary-color)',
                color: 'white',
                borderRadius: '12px',
                padding: '2px 8px',
                fontSize: '12px',
              }}>
                {unreadCount} new
              </span>
            )}
          </div>

          {unreadNotifications.length === 0 && readNotifications.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No notifications
            </div>
          ) : (
            <>
              {unreadNotifications.length > 0 && (
                <>
                  {unreadNotifications.map((notification) => (
                    <div
                      key={notification._id}
                      onClick={() => markAsRead(notification._id)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        background: '#f0f9ff',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#e0f2fe';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f0f9ff';
                      }}
                    >
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                        {notification.title}
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        {notification.message}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                  {readNotifications.length > 0 && (
                    <div style={{
                      padding: '8px 16px',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      borderBottom: '1px solid var(--border-color)',
                      background: '#f9fafb',
                    }}>
                      Older
                    </div>
                  )}
                </>
              )}
              
              {readNotifications.map((notification) => (
                <div
                  key={notification._id}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-color)',
                    opacity: 0.7,
                  }}
                >
                  <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                    {notification.title}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {notification.message}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {new Date(notification.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </>
          )}

          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border-color)',
            textAlign: 'center',
          }}>
            <Link href="/notifications" style={{
              color: 'var(--primary-color)',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
            }}>
              View All Notifications
            </Link>
          </div>
        </div>
      )}

      {showDropdown && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}


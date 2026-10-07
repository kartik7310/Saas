"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Clock, Info, UserPlus, Home, Mail, Video, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'SIGNUP' | 'PROPERTY_LISTED' | 'PROPERTY_APPROVED' | 'USER_APPROVED' | 'NEW_INQUIRY' | 'INFO' | 'MEETING_REQUEST' | 'MEETING_STATUS' | 'MEETING_EXPIRED' | 'MEETING_REJECTED';
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
}

export default function NotificationBell() {
  const router = useRouter();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      if (!user) return;
      const res = await api('/notifications');
      if (res.success) {
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      // Use warn to prevent Next.js from throwing a full-screen error overlay on Dev environments during normal network drops
      console.warn('Network issue fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(prev => prev.filter(n => n._id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await api(`/notifications/${id}/read`, { method: 'PUT' });
    } catch (err) {
      console.error('Error marking as read:', err);
      // Optional: fetch again if failed to sync correctly, but usually fine
    }
  };

  const markAllAsRead = async () => {
    setNotifications([]);
    setUnreadCount(0);
    try {
      await api('/notifications/read-all', { method: 'PUT' });
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Dismiss immediately
    markAsRead(notification._id);
    setIsOpen(false);

    const role = user?.role?.toUpperCase();
    const rolePrefix = (role === 'SUPER_ADMIN' || role === 'ADMIN') ? '/admin-dashboard' :
      role === 'BUILDER' ? '/builder-dashboard' :
        role === 'SELLER' ? '/seller' :
          role === 'BROKER' ? '/broker' : '/';

    switch (notification.type) {
      case 'SIGNUP':
        if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
          router.push(`${rolePrefix}/builders?status=pending`);
        }
        break;
      case 'PROPERTY_LISTED':
        if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
          router.push(`${rolePrefix}/property-audit?id=${notification.relatedId || ''}`);
        } else {
          router.push(`${rolePrefix}/projects?status=pending`);
        }
        break;
      case 'PROPERTY_APPROVED':
        router.push(`${rolePrefix}/projects?status=published`);
        break;
      case 'USER_APPROVED':
        router.push(`${rolePrefix}/users`);
        break;
      case 'NEW_INQUIRY':
        router.push(`${rolePrefix}/leads`);
        break;
      case 'MEETING_REQUEST':
      case 'MEETING_STATUS':
        if (role === 'BUYER') {
          // Robust check: Even if type is MEETING_STATUS, if the message says 'rejected', redirect to book-vc
          const isRejected = notification.message?.toLowerCase().includes('rejected');
          
          if (isRejected) {
            router.push(`/book-vc?rescheduleId=${notification.relatedId}`);
          } else {
            router.push(`/my-meetings`);
          }
        } else {
          router.push(`${rolePrefix}/meetings`);
        }
        break;
      case 'MEETING_REJECTED':
        if (role === 'BUYER') {
          router.push(`/book-vc?rescheduleId=${notification.relatedId}`);
        } else {
          router.push(`${rolePrefix}/meetings`);
        }
        break;
      case 'MEETING_EXPIRED':
        if (role === 'BUYER') {
          router.push(`/book-vc/reschedule/${notification.relatedId}`);
        }
        break;
      default:
        router.push(`${rolePrefix}`);
        break;
    }
  };


  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SIGNUP': return <UserPlus size={16} className="text-blue-500" />;
      case 'PROPERTY_LISTED': return <Home size={16} className="text-purple-500" />;
      case 'PROPERTY_APPROVED': return <Check size={16} className="text-green-500" />;
      case 'USER_APPROVED': return <Check size={16} className="text-green-500" />;
      case 'NEW_INQUIRY': return <Mail size={16} className="text-blue-500" />;
      case 'MEETING_REQUEST': return <Video size={16} className="text-indigo-500" />;
      case 'MEETING_STATUS': return <Video size={16} className="text-blue-500" />;
      case 'MEETING_REJECTED': return <X size={16} className="text-red-500" />;
      default: return <Info size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors outline-none"
      >
        <Bell size={20} className="text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[60] animate-in fade-in zoom-in duration-200 origin-top-right">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <h3 className="font-bold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => {
                const isUserApproved = notification.type === 'USER_APPROVED';
                return (
                  <div
                    key={notification._id}
                    onClick={() => !isUserApproved && handleNotificationClick(notification)}
                    className={cn(
                      "group relative flex gap-3 px-4 py-4 transition-colors border-b border-gray-50 last:border-0",
                      !isUserApproved && "hover:bg-gray-50 cursor-pointer",
                      !notification.isRead && "bg-purple-50/40 hover:bg-purple-50/60"
                    )}
                  >
                  <div className="mt-0.5 h-8 w-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-sm">
                    {getTypeIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className={cn("text-sm font-bold truncate", !notification.isRead ? "text-gray-900" : "text-gray-700")}>
                        {notification.title}
                      </p>
                      <span className="text-[10px] whitespace-nowrap text-gray-400 font-medium flex items-center gap-1">
                        <Clock size={10} />
                        {notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }).replace('about ', '') : 'just now'}
                      </span>
                    </div>
                    <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2">
                      {notification.message}
                    </p>
                  </div>

                  {!notification.isRead && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="h-2 w-2 rounded-full bg-purple-600 ring-4 ring-purple-100" />
                    </div>
                  )}
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                  <Bell size={24} className="text-gray-300" />
                </div>
                <p className="text-sm font-bold text-gray-400">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-1">We'll let you know when something important happens.</p>
              </div>
            )}
          </div>

          <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-50 flex justify-center">
            <button className="text-[11px] font-bold text-gray-400 hover:text-purple-600 transition-colors uppercase tracking-wider">
              View All History
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


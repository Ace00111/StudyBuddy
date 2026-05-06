"use client";

import { Trash2, Bell, Shield, Zap, Info, CheckCircle, XCircle } from "lucide-react";

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type?: "success" | "info" | "security";
}

interface NotificationsViewProps {
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
}

export default function NotificationsView({ notifications, setNotifications }: NotificationsViewProps) {
  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const dismissNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const addTestNotification = () => {
    const newNotif: Notification = {
      id: Date.now(),
      title: "File Sync Complete",
      message: "Your study materials have been successfully backed up to your secure library.",
      time: "Just now",
      type: "success",
      isRead: false
    };
    setNotifications([newNotif, ...notifications]);
  };

  const clearAll = () => {
    if (confirm("Clear all notifications?")) {
      setNotifications([]);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return CheckCircle;
      case "info": return Info;
      case "security": return Shield;
      default: return Bell;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "success": return "text-green-500 bg-green-50 dark:bg-green-500/10";
      case "info": return "text-blue-500 bg-blue-50 dark:bg-blue-500/10";
      case "security": return "text-purple-500 bg-purple-50 dark:bg-purple-500/10";
      default: return "text-slate-500 bg-slate-50 dark:bg-slate-500/10";
    }
  };

  return (
    <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">Notifications</h1>
          <p className="text-muted text-sm font-medium">Keep track of your study library updates.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={markAllRead}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Mark all as read
          </button>
          <button 
            onClick={clearAll}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
            title="Clear All"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notif) => {
            const Icon = getIcon(notif.type || "");
            const color = getColor(notif.type || "");
            
            return (
              <div 
                key={notif.id} 
                className={`group p-6 bg-card border border-border rounded-3xl flex gap-5 hover:shadow-lg transition-all relative ${!notif.isRead ? 'border-primary/20' : ''}`}
              >
                {!notif.isRead && (
                  <div className="absolute top-6 left-6 w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
                <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-foreground truncate pr-4">{notif.title}</h3>
                    <span className="text-xs text-muted font-medium shrink-0">{notif.time}</span>
                  </div>
                  <p className="text-sm text-muted leading-relaxed mb-4">
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-4">
                    {!notif.isRead && (
                      <button 
                        onClick={() => markAsRead(notif.id)}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        Mark as read
                      </button>
                    )}
                    <button 
                      onClick={() => dismissNotification(notif.id)}
                      className="text-xs font-bold text-muted hover:text-red-500 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center">
            <Bell className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500">No new notifications</p>
          </div>
        )}
      </div>
    </div>
  );
}

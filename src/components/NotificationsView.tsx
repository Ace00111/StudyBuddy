"use client";

import { Bell, Check, Trash2, Clock, Info, Shield, Zap } from "lucide-react";

export default function NotificationsView() {
  const notifications = [
    {
      id: 1,
      title: "File Successfully Synced",
      message: "Your 'Quantum Physics Lecture.pdf' has been successfully backed up to the Shelby Protocol network.",
      time: "10 minutes ago",
      type: "success",
      icon: Zap,
      color: "text-amber-500 bg-amber-50 dark:bg-amber-500/10"
    },
    {
      id: 2,
      title: "New Peer Connected",
      message: "A new study node from your university has joined the decentralized network.",
      time: "1 hour ago",
      type: "info",
      icon: Info,
      color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10"
    },
    {
      id: 3,
      title: "Security Update",
      message: "Your protocol keys were verified. Access to decentralized storage is secure.",
      time: "Yesterday",
      type: "security",
      icon: Shield,
      color: "text-purple-500 bg-purple-50 dark:bg-purple-500/10"
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      <div className="px-4 md:px-8 pt-8 pb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Notifications</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Stay updated with your network activity.</p>
          </div>
          <button className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Mark all as read
          </button>
        </div>
      </div>

      <div className="px-4 md:px-8 pb-8 max-w-3xl">
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div key={notif.id} className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex gap-4 hover:shadow-sm transition-all">
              <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center ${notif.color}`}>
                <notif.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">{notif.title}</h3>
                  <span className="text-xs text-slate-400 font-medium">{notif.time}</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                  {notif.message}
                </p>
                <div className="flex items-center gap-3">
                  <button className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:bg-blue-50 dark:hover:bg-blue-500/10 px-2 py-1 rounded-lg transition-colors">
                    <Check className="w-3.5 h-3.5" />
                    Accept
                  </button>
                  <button className="text-xs font-bold text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <Bell className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold mb-1">All caught up!</h2>
            <p className="text-slate-500">No new notifications at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}

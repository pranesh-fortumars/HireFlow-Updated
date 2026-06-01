"use client";

import React, { useState } from 'react';
import { Bell, Check, Trash2, CheckCircle2 } from 'lucide-react';
import { useHireFlowStore } from '@/lib/store';
import { useAuth } from '@/components/auth-context';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export function NotificationBell() {
  const { user } = useAuth();
  const { notifications, markNotificationRead } = useHireFlowStore();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const myNotifications = notifications.filter(n => n.userId === user.id || n.userId === 'ALL' || (n.userId === 'HR' && user.role === 'HR') || (n.userId === 'ADMIN' && user.role === 'ADMIN'));
  const unreadCount = myNotifications.filter(n => !n.read).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10">
          <Bell className="w-5 h-5 text-indigo-300" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute top-0 right-0 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-[0_0_10px_rgba(244,63,94,0.5)]"
              >
                {unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0 bg-[#0f111a]/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-indigo-900/20" align="end">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h4 className="font-headline font-semibold text-lg flex items-center gap-2">
            Notifications <Badge className="bg-indigo-500/20 text-indigo-400">{unreadCount} New</Badge>
          </h4>
        </div>
        <div className="max-h-[400px] overflow-y-auto scrollbar-hide flex flex-col">
          {myNotifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-10 h-10 mx-auto opacity-20 mb-3" />
              <p>You have no notifications.</p>
            </div>
          ) : (
            myNotifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-4 border-b border-white/5 flex gap-4 transition-colors ${notif.read ? 'opacity-60 bg-transparent' : 'bg-indigo-500/5 hover:bg-indigo-500/10'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notif.read ? 'bg-white/5' : 'bg-indigo-500/20 text-indigo-400'}`}>
                  {notif.read ? <CheckCircle2 className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${notif.read ? 'text-muted-foreground' : 'text-white font-medium'}`}>
                    {notif.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                  </p>
                </div>
                {!notif.read && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-8 h-8 shrink-0 hover:bg-emerald-500/20 hover:text-emerald-400"
                    onClick={() => markNotificationRead(notif.id)}
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

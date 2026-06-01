
"use client";

import React from 'react';
import { Sidebar } from './sidebar';
import { useAuth } from './auth-context';
import { motion } from 'framer-motion';
import { NotificationBell } from './notification-center';

export const DashboardShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading, user } = useAuth();

  if (isLoading) return null;

  return (
    <div className="flex min-h-screen bg-[#0B0C14] text-foreground gradient-bg relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="blob w-[500px] h-[500px] bg-indigo-600 top-[-10%] left-[-10%]" />
      <div className="blob w-[400px] h-[400px] bg-purple-600 bottom-[-5%] right-[-5%] animation-delay-2000" />
      <div className="blob w-[300px] h-[300px] bg-cyan-600 top-[20%] right-[10%] animate-float-slower" />

      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col relative z-10 min-h-screen">
        {/* Top Header Bar */}
        <header className="h-20 border-b border-white/5 bg-[#0B0C14]/50 backdrop-blur-xl px-8 flex items-center justify-between sticky top-0 z-50">
          <div>
            <h1 className="text-xl font-headline font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              HireFlow Workspace
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold shadow-lg shadow-indigo-500/20 border border-white/10">
              {user?.name.charAt(0)}
            </div>
          </div>
        </header>

        <div className="p-8 flex-1">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

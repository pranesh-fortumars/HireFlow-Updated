"use client";

import React, { useState, useEffect } from 'react';
import { Sidebar } from './sidebar';
import { useAuth } from './auth-context';
import { motion } from 'framer-motion';
import { NotificationBell } from './notification-center';
import { Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTitle } from './ui/sheet';

export const DashboardShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading, user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Initialize strictly from localStorage to remember user preference
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check if mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Load saved preference
    const saved = localStorage.getItem('hireflow_sidebar_collapsed');
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    } else if (window.innerWidth >= 768 && window.innerWidth < 1024) {
      // Default tablet to collapsed if no preference saved
      setIsCollapsed(true);
    }
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(true);
    } else {
      const newState = !isCollapsed;
      setIsCollapsed(newState);
      localStorage.setItem('hireflow_sidebar_collapsed', JSON.stringify(newState));
    }
  };

  if (isLoading || !isMounted) return null;

  return (
    <div className="flex min-h-screen bg-[#0B0C14] text-foreground gradient-bg relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="blob w-[500px] h-[500px] bg-indigo-600 top-[-10%] left-[-10%]" />
      <div className="blob w-[400px] h-[400px] bg-purple-600 bottom-[-5%] right-[-5%] animation-delay-2000" />
      <div className="blob w-[300px] h-[300px] bg-cyan-600 top-[20%] right-[10%] animate-float-slower" />

      {/* Desktop / Tablet Static Sidebar */}
      {!isMobile && (
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={undefined} /> // Do not pass setter to prevent hover toggle
      )}

      {/* Mobile Slide-Out Drawer */}
      {isMobile && (
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetContent side="left" className="p-0 w-[260px] bg-[#0B0C14] border-r border-white/10">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <Sidebar isCollapsed={false} setIsMobileOpen={setIsMobileOpen} />
          </SheetContent>
        </Sheet>
      )}
      
      <motion.main 
        className="flex-1 flex flex-col relative z-10 min-h-screen"
        animate={{ marginLeft: isMobile ? 0 : (isCollapsed ? 72 : 260) }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Top Header Bar */}
        <header className="h-16 border-b border-white/5 bg-[#0B0C14]/50 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className="text-muted-foreground hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-headline font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              HireFlow Workspace
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold shadow-lg shadow-indigo-500/20 border border-white/10 text-sm">
              {user?.name.charAt(0)}
            </div>
          </div>
        </header>

        <div className="p-4 flex-1 overflow-x-hidden">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
};

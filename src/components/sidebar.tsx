"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './auth-context';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Users, Calendar, Settings, LogOut, 
  UserPlus, PieChart, ClipboardList, ShieldAlert, FileEdit
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Sidebar = ({ 
  isCollapsed, 
  setIsCollapsed,
  setIsMobileOpen
}: { 
  isCollapsed: boolean, 
  setIsCollapsed?: (v: boolean) => void,
  setIsMobileOpen?: (v: boolean) => void
}) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'HR', 'INTERVIEWER'] },
    { label: 'Applicants Pipeline', href: '/dashboard/applications', icon: Users, roles: ['ADMIN', 'HR'] },
    { label: 'Candidate Tracking', href: '/dashboard/candidates', icon: ClipboardList, roles: ['ADMIN', 'HR'] },
    { label: 'My Interviews', href: '/dashboard/my-interviews', icon: Calendar, roles: ['INTERVIEWER'] },
    { label: 'Add Candidate', href: '/dashboard/applications/new', icon: UserPlus, roles: ['HR'] },
    { label: 'Draft Candidates', href: '/dashboard/drafts', icon: FileEdit, roles: ['HR'] },
    { label: 'Analytics', href: '/dashboard/analytics', icon: PieChart, roles: ['ADMIN'] },
    { label: 'Audit Logs', href: '/dashboard/audit', icon: ShieldAlert, roles: ['ADMIN'] },
    { label: 'User Management', href: '/dashboard/users', icon: Users, roles: ['ADMIN'] },
    { label: 'Interviews', href: '/dashboard/interviews', icon: Calendar, roles: ['ADMIN', 'HR'] },
    { label: 'Company Profile', href: '/dashboard/settings', icon: Settings, roles: ['ADMIN'] },
  ].filter(item => item.roles.includes(user?.role || ''));

  return (
    <motion.div 
      className="flex flex-col h-full md:h-screen md:border-r border-white/10 bg-[#0B0C14]/90 backdrop-blur-2xl md:fixed left-0 top-0 z-40 overflow-hidden w-full"
      initial={false}
      animate={{ width: isCollapsed ? 72 : 260 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="h-16 flex items-center px-4 shrink-0 border-b border-white/5">
        <motion.div 
          className="flex items-center gap-3 overflow-hidden whitespace-nowrap"
          animate={{ opacity: isCollapsed ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0" />
          <h1 className="text-xl font-headline font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            HireFlow Glass
          </h1>
        </motion.div>
        {isCollapsed && (
          <div className="absolute left-6 w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-purple-500" />
        )}
      </div>

      <TooltipProvider delayDuration={0}>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/dashboard' 
              ? pathname === '/dashboard' 
              : pathname === item.href || pathname.startsWith(item.href + '/');
            
            const navLink = (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen && setIsMobileOpen(false)}>
                <div className={cn(
                  "flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                  isActive 
                    ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 shadow-[inset_0_0_15px_rgba(99,102,241,0.1)]" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}>
                  <Icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-indigo-400" : "group-hover:text-white")} />
                  
                  <motion.span 
                    className="font-medium ml-3 whitespace-nowrap"
                    animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto' }}
                  >
                    {item.label}
                  </motion.span>
                  
                  {isActive && !isCollapsed && (
                    <motion.div layoutId="active-nav-indicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full" />
                  )}
                </div>
              </Link>
            );

            return isCollapsed ? (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{navLink}</TooltipTrigger>
                <TooltipContent side="right" className="bg-[#1e1b4b] border-white/10 text-white font-medium ml-2">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            ) : navLink;
          })}
        </nav>
      </TooltipProvider>

      <div className="p-3 border-t border-white/10 shrink-0">
        <div className={cn("flex items-center gap-3 p-2 rounded-xl mb-2 transition-all", isCollapsed ? "justify-center" : "bg-white/5")}>
          <img src={user?.avatar} alt={user?.name} className="w-8 h-8 rounded-full border border-white/20 shrink-0" />
          
          <motion.div 
            className="flex-1 overflow-hidden"
            animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto', display: isCollapsed ? 'none' : 'block' }}
          >
            <p className="text-sm font-semibold truncate text-white">{user?.name}</p>
            <p className="text-[10px] text-muted-foreground truncate uppercase tracking-wider">{user?.role}</p>
          </motion.div>
        </div>
        
        {isCollapsed ? (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="w-full text-muted-foreground hover:text-white hover:bg-rose-500/10 hover:text-rose-400" onClick={logout}>
                  <LogOut className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-rose-500 text-white font-medium ml-2">
                Log Out
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-white hover:bg-rose-500/10 hover:text-rose-400"
            onClick={logout}
          >
            <LogOut className="w-5 h-5 mr-3 shrink-0" />
            <span className="whitespace-nowrap">Log Out</span>
          </Button>
        )}
      </div>
    </motion.div>
  );
};

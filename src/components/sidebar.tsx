
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './auth-context';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings, 
  LogOut, 
  Briefcase,
  UserPlus,
  PieChart,
  ClipboardList,
  ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { 
      label: 'Dashboard', 
      href: '/dashboard', 
      icon: LayoutDashboard,
      roles: ['ADMIN', 'HR', 'INTERVIEWER']
    },
    { 
      label: 'Applicants', 
      href: '/dashboard/applications', 
      icon: Users,
      roles: ['ADMIN', 'HR']
    },
    { 
      label: 'My Interviews', 
      href: '/dashboard/my-interviews', 
      icon: ClipboardList,
      roles: ['INTERVIEWER']
    },
    { 
      label: 'Add Candidate', 
      href: '/dashboard/applications/new', 
      icon: UserPlus,
      roles: ['HR']
    },
    { 
      label: 'Analytics', 
      href: '/dashboard/analytics', 
      icon: PieChart,
      roles: ['ADMIN']
    },
    { 
      label: 'Audit Logs', 
      href: '/dashboard/audit', 
      icon: ShieldAlert,
      roles: ['ADMIN']
    },
    { 
      label: 'User Management', 
      href: '/dashboard/users', 
      icon: Users,
      roles: ['ADMIN']
    },
    { 
      label: 'Interviews', 
      href: '/dashboard/interviews', 
      icon: Calendar,
      roles: ['ADMIN', 'HR']
    },
    { 
      label: 'Company Profile', 
      href: '/dashboard/settings', 
      icon: Settings,
      roles: ['ADMIN']
    },
  ].filter(item => item.roles.includes(user?.role || ''));

  return (
    <div className="w-64 flex flex-col h-screen border-r border-white/10 bg-[#0B0C14]/80 backdrop-blur-xl fixed left-0 top-0 z-40">
      <div className="p-6">
        <h1 className="text-2xl font-headline font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          HireFlow Glass
        </h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/10" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              )}>
                <Icon className={cn("w-5 h-5", isActive ? "text-indigo-400" : "group-hover:text-white")} />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-white/5">
          <img src={user?.avatar} alt={user?.name} className="w-10 h-10 rounded-full border border-white/20" />
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate capitalize">{user?.role.toLowerCase()}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-white hover:bg-white/5"
          onClick={logout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Log Out
        </Button>
      </div>
    </div>
  );
};

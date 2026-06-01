
"use client";

import React from 'react';
import { useAuth } from '@/components/auth-context';
import { useHireFlowStore } from '@/lib/store';
import { GlassCard } from '@/components/glass-card';
import { 
  Users, Clock, CalendarCheck, TrendingUp, ExternalLink, ChevronRight, Briefcase, UserCheck
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const { applications, allUsers } = useHireFlowStore();

  const isInterviewer = user?.role === 'INTERVIEWER';
  const isHR = user?.role === 'HR';
  const isAdmin = user?.role === 'ADMIN';

  const myInterviews = applications.filter(a => a.assignedInterviewerId === user?.id);

  const getStats = () => {
    if (isInterviewer) {
      return [
        { label: 'Assigned Interviews', value: myInterviews.length, icon: Users, color: 'text-indigo-400' },
        { label: 'Pending Feedback', value: myInterviews.filter(a => a.status === 'Scheduled' || a.status === 'SCHEDULED' || (!a.feedback)).length, icon: Clock, color: 'text-amber-400' },
        { label: 'Completed', value: myInterviews.filter(a => !!a.feedback).length, icon: CalendarCheck, color: 'text-emerald-400' },
      ];
    }
    return [
      { label: 'Total Candidates', value: applications.length, icon: Users, color: 'text-indigo-400' },
      { label: 'In Pipeline', value: applications.filter(a => !['Joined', 'Rejected', 'REJECTED'].includes(a.status)).length, icon: Clock, color: 'text-amber-400' },
      { label: 'Interviews Scheduled', value: applications.filter(a => a.status.toLowerCase().includes('scheduled')).length, icon: CalendarCheck, color: 'text-cyan-400' },
      { label: 'Offers Released', value: applications.filter(a => a.status === 'Offer Released' || a.status === 'SELECTED').length, icon: TrendingUp, color: 'text-emerald-400' },
    ];
  };

  const stats = getStats();

  const chartData = [
    { name: 'Mon', apps: 4 },
    { name: 'Tue', apps: 7 },
    { name: 'Wed', apps: 5 },
    { name: 'Thu', apps: 12 },
    { name: 'Fri', apps: 8 },
    { name: 'Sat', apps: 3 },
    { name: 'Sun', apps: 2 },
  ];

  const recentApps = isInterviewer ? myInterviews.slice(0, 5) : applications.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-headline font-bold mb-2">Welcome back, {user?.name}</h2>
        <p className="text-muted-foreground">
          {isInterviewer ? "Here is your upcoming interview schedule." : "Here's what's happening with your recruitment funnel today."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <GlassCard key={i} className="flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold font-headline">{stat.value}</p>
            </div>
          </GlassCard>
        ))}
        {isAdmin && (
          <GlassCard className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white/5 text-purple-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active System Users</p>
              <p className="text-2xl font-bold font-headline">{allUsers.length}</p>
            </div>
          </GlassCard>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {(!isInterviewer) && (
          <GlassCard className="lg:col-span-2" noHover>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-headline font-semibold">Application Trends</h3>
              <Badge variant="outline" className="border-indigo-500/30 text-indigo-400">Weekly View</Badge>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #312e81', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="apps" stroke="#6366f1" fillOpacity={1} fill="url(#colorApps)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        )}

        <GlassCard noHover className={isInterviewer ? 'lg:col-span-3' : ''}>
          <h3 className="text-xl font-headline font-semibold mb-6">Recent Activities</h3>
          <div className="space-y-6">
            {recentApps.map((app, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold">{app.candidateName.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{app.candidateName}</p>
                  <p className="text-xs text-muted-foreground truncate">{app.position}</p>
                </div>
                <Badge className={
                  app.status === 'SELECTED' || app.status === 'Offer Released' ? 'bg-emerald-500/10 text-emerald-400' :
                  app.status === 'REJECTED' || app.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400' :
                  'bg-indigo-500/10 text-indigo-400'
                }>
                  {app.status.toLowerCase()}
                </Badge>
              </div>
            ))}
            {recentApps.length === 0 && (
              <p className="text-center text-muted-foreground">No recent activity.</p>
            )}
          </div>
          <Link href={isInterviewer ? "/dashboard/my-interviews" : "/dashboard/applications"} className="mt-8 block text-center text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            View All <ChevronRight className="inline w-4 h-4 ml-1" />
          </Link>
        </GlassCard>
      </div>
    </div>
  );
}

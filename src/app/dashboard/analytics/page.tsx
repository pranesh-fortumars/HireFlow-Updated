
"use client";

import React from 'react';
import { GlassCard } from '@/components/glass-card';
import { useHireFlowStore } from '@/lib/store';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
import { 
  Users, CheckCircle, XCircle, Clock, TrendingUp, Target, Activity
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AnalyticsPage() {
  const { applications } = useHireFlowStore();

  const total = applications.length;
  
  const hiredCount = applications.filter(a => ['Offer Released', 'Joined', 'SELECTED'].includes(a.status)).length;
  const rejectedCount = applications.filter(a => ['Rejected', 'REJECTED', 'Rejected 1st Round', 'Rejected 2nd Round'].includes(a.status)).length;
  const inProgressCount = total - hiredCount - rejectedCount;

  // Pipeline Funnel computation
  const round1Count = applications.filter(a => ['Attended 1st Round', 'Selected 1st Round', 'Scheduled 2nd Round', 'Attended 2nd Round', 'Selected 2nd Round', 'HR Discussion', 'Document Verification', 'Background Verification', 'Offer Released', 'Joined', 'SELECTED'].includes(a.status)).length;
  const round2Count = applications.filter(a => ['Attended 2nd Round', 'Selected 2nd Round', 'HR Discussion', 'Document Verification', 'Background Verification', 'Offer Released', 'Joined', 'SELECTED'].includes(a.status)).length;
  const hrCount = applications.filter(a => ['HR Discussion', 'Document Verification', 'Background Verification', 'Offer Released', 'Joined', 'SELECTED'].includes(a.status)).length;

  const funnelData = [
    { name: 'Applied', value: total, color: '#6366f1' },
    { name: '1st Round', value: round1Count, color: '#8b5cf6' },
    { name: '2nd Round', value: round2Count, color: '#a855f7' },
    { name: 'HR/Verification', value: hrCount, color: '#d946ef' },
    { name: 'Offers/Joined', value: hiredCount, color: '#10b981' },
  ];

  const statusData = [
    { name: 'Hired/Offered', value: hiredCount, color: '#10b981' },
    { name: 'Rejected', value: rejectedCount, color: '#f43f5e' },
    { name: 'In Progress', value: inProgressCount, color: '#6366f1' },
  ];

  // Dynamic department/position count
  const posCount: Record<string, number> = {};
  applications.forEach(a => {
    const pos = a.position || 'Other';
    posCount[pos] = (posCount[pos] || 0) + 1;
  });
  const departmentData = Object.entries(posCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, apps]) => ({ name, apps }));

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-3xl font-headline font-bold">Executive Analytics</h2>
        <p className="text-muted-foreground">Comprehensive insights into your recruitment pipeline performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="border-indigo-500/20">
          <p className="text-sm text-muted-foreground mb-1">Total Candidates</p>
          <div className="flex items-center justify-between">
            <h4 className="text-3xl font-bold font-headline">{total}</h4>
            <Users className="text-indigo-400" />
          </div>
          <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Active tracking
          </p>
        </GlassCard>
        <GlassCard className="border-emerald-500/20">
          <p className="text-sm text-muted-foreground mb-1">Offer Rate</p>
          <div className="flex items-center justify-between">
            <h4 className="text-3xl font-bold font-headline">{total > 0 ? ((hiredCount/total)*100).toFixed(1) : 0}%</h4>
            <CheckCircle className="text-emerald-400" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Offered vs Total Applications</p>
        </GlassCard>
        <GlassCard className="border-rose-500/20">
          <p className="text-sm text-muted-foreground mb-1">Rejection Rate</p>
          <div className="flex items-center justify-between">
            <h4 className="text-3xl font-bold font-headline">{total > 0 ? ((rejectedCount/total)*100).toFixed(1) : 0}%</h4>
            <XCircle className="text-rose-400" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Overall rejection rate</p>
        </GlassCard>
        <GlassCard className="border-amber-500/20">
          <p className="text-sm text-muted-foreground mb-1">In Progress</p>
          <div className="flex items-center justify-between">
            <h4 className="text-3xl font-bold font-headline">{inProgressCount}</h4>
            <Activity className="text-amber-400" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Currently moving in pipeline</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard noHover>
          <h3 className="text-xl font-headline font-semibold mb-8 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-400" /> Pipeline Funnel
          </h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={100} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #312e81', borderRadius: '8px' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard noHover>
          <h3 className="text-xl font-headline font-semibold mb-8">Overall Distribution</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #312e81', borderRadius: '8px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard noHover>
          <h3 className="text-xl font-headline font-semibold mb-6">Top Roles Hiring</h3>
          <div className="space-y-4">
            {departmentData.map((dept, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center font-bold text-indigo-400">
                    {i + 1}
                  </div>
                  <p className="font-semibold">{dept.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">{dept.apps}</p>
                  <p className="text-xs text-muted-foreground">Applications</p>
                </div>
              </div>
            ))}
            {departmentData.length === 0 && <p className="text-muted-foreground text-center">No applications yet.</p>}
          </div>
        </GlassCard>

        <GlassCard noHover>
          <h3 className="text-xl font-headline font-semibold mb-6">Top Performers (Interviewer Ratings)</h3>
          <div className="space-y-4">
            {applications.filter(a => a.feedback).sort((a, b) => (b.feedback?.technicalRating || 0) - (a.feedback?.technicalRating || 0)).slice(0, 5).map((app, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center font-bold text-emerald-400">
                    #{i + 1}
                  </div>
                  <div>
                    <p className="font-semibold">{app.candidateName}</p>
                    <p className="text-xs text-muted-foreground">{app.position}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-400">{app.feedback?.technicalRating}/10</p>
                  <p className="text-xs text-muted-foreground">Avg Technical Score</p>
                </div>
              </div>
            ))}
            {applications.filter(a => a.feedback).length === 0 && <p className="text-muted-foreground text-center">No feedback submitted yet.</p>}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}


"use client";

import React from 'react';
import { useAuth } from '@/components/auth-context';
import { useHireFlowStore } from '@/lib/store';
import { GlassCard } from '@/components/glass-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Video, User, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function MyInterviewsPage() {
  const { user } = useAuth();
  const { applications } = useHireFlowStore();

  const myInterviews = applications.filter(app => app.assignedInterviewerId === user?.id);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-headline font-bold">My Interview Assignments</h2>
        <p className="text-muted-foreground">Candidates you are scheduled to evaluate.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {myInterviews.length > 0 ? (
          myInterviews.map((app) => (
            <GlassCard key={app.id} noHover>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center font-bold text-indigo-400">
                    {app.candidateName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-xl">{app.candidateName}</h4>
                    <p className="text-muted-foreground">{app.position}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 items-center">
                  <div className="text-sm">
                    <p className="text-muted-foreground mb-1">Schedule</p>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-medium text-white">{app.interviewDate}</span>
                      <span className="flex items-center gap-1 font-medium"><Clock className="w-4 h-4 text-indigo-400" /> {app.interviewTime}</span>
                      <span className="flex items-center gap-1 font-medium"><Video className="w-4 h-4 text-cyan-400" /> {app.interviewMode}</span>
                    </div>
                    {app.interviewMode === 'ONLINE' && app.googleMeetLink && (
                      <div className="mt-2">
                        <a href={app.googleMeetLink} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline text-xs flex items-center gap-1">
                          Join Meeting
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="text-sm">
                    <p className="text-muted-foreground mb-1">Status</p>
                    <Badge variant={app.status === 'COMPLETED' ? 'secondary' : 'default'} className={app.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-600'}>
                      {app.status}
                    </Badge>
                  </div>

                  <Link href={`/dashboard/applications/${app.id}`}>
                    <Button className={app.status === 'COMPLETED' ? 'bg-white/10 hover:bg-white/20' : 'bg-indigo-600 hover:bg-indigo-700'}>
                      {app.status === 'COMPLETED' ? 'Review Feedback' : 'Start Assessment'}
                    </Button>
                  </Link>
                </div>
              </div>
            </GlassCard>
          ))
        ) : (
          <GlassCard className="text-center py-20" noHover>
            <User className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-xl font-headline font-semibold">All caught up!</h3>
            <p className="text-muted-foreground">You don't have any interviews assigned at the moment.</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}

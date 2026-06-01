
"use client";

import React, { useState } from 'react';
import { useHireFlowStore } from '@/lib/store';
import { GlassCard } from '@/components/glass-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  User, 
  ChevronRight, 
  Search, 
  Filter,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function InterviewsPage() {
  const { applications, interviewers } = useHireFlowStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const scheduledInterviews = applications.filter(app => {
    const matchesStatus = app.status === 'SCHEDULED' || app.status === 'COMPLETED';
    if (!matchesStatus) return false;

    const matchesSearch = 
      app.candidateName.toLowerCase().includes(search.toLowerCase()) ||
      app.position.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = statusFilter === 'ALL' || app.status === statusFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-headline font-bold">Interview Schedule</h2>
        <p className="text-muted-foreground">Manage all upcoming and past interview sessions.</p>
      </div>

      <GlassCard noHover className="p-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by candidate or position..." 
              className="pl-10 bg-white/5 border-white/10 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px] bg-white/5 border-white/10">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-[#1e1b4b] border-white/10 text-white">
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 gap-6">
        {scheduledInterviews.length > 0 ? (
          scheduledInterviews.map((interview) => {
            const interviewer = interviewers.find(i => i.id === interview.assignedInterviewerId);
            return (
              <GlassCard key={interview.id} className="p-0 overflow-hidden" noHover>
                <div className="flex flex-col md:flex-row">
                  <div className="p-6 md:w-1/4 bg-indigo-600/10 border-r border-white/10 flex flex-col items-center justify-center text-center">
                    <p className="text-xs uppercase tracking-widest text-indigo-400 font-bold mb-1">Date</p>
                    <p className="text-2xl font-headline font-bold">
                      {interview.interviewDate ? format(new Date(interview.interviewDate), 'MMM dd') : 'TBD'}
                    </p>
                    <p className="text-muted-foreground">{interview.interviewDate ? format(new Date(interview.interviewDate), 'yyyy') : ''}</p>
                    <div className="mt-4 flex items-center gap-2 text-indigo-300">
                      <Clock className="w-4 h-4" />
                      <span className="font-semibold">{interview.interviewTime}</span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{interview.candidateName}</h4>
                          <p className="text-sm text-muted-foreground">{interview.position}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          {interview.interviewMode === 'ONLINE' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                          <span>{interview.interviewMode} Session</span>
                        </div>
                        {interview.interviewMode === 'ONLINE' && interview.googleMeetLink && (
                          <div className="flex items-center gap-2 text-muted-foreground border-l border-white/10 pl-4">
                            <a href={interview.googleMeetLink} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline flex items-center gap-1">
                              Join Meeting
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground border-l border-white/10 pl-4">
                          <span className="font-medium text-white">Interviewer:</span>
                          <span>{interviewer?.name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge className={
                        interview.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-cyan-500/10 text-cyan-400'
                      }>
                        {interview.status.toLowerCase()}
                      </Badge>
                      <Link href={`/dashboard/applications/${interview.id}`}>
                        <Button variant="ghost" size="sm" className="group">
                          View Details <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            {search || statusFilter !== 'ALL' ? (
              <>
                <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-xl font-headline font-semibold">No results found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
                <Button 
                  variant="link" 
                  className="mt-4 text-indigo-400"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('ALL');
                  }}
                >
                  Clear all filters
                </Button>
              </>
            ) : (
              <>
                <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-xl font-headline font-semibold">No interviews scheduled</h3>
                <p className="text-muted-foreground">New interviews will appear here once assigned by HR.</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

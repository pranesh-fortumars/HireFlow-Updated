"use client";

import React, { useState, useEffect } from 'react';
import { useHireFlowStore } from '@/lib/store';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { 
  Plus, Search, MoreHorizontal, Mail, Filter, Briefcase, 
  Clock, MapPin, Calendar, FileText, UserPlus, 
  ChevronRight, ArrowUpRight, CheckCircle2, XCircle
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { useAuth } from '@/components/auth-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ApplicationStatus, Application } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

const COLUMNS: { id: string; title: string; status: ApplicationStatus; color: string }[] = [
  { id: 'col-draft', title: 'Draft', status: 'Draft', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  { id: 'col-applied', title: 'Applied', status: 'Applied', color: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30' },
  { id: 'col-sourced', title: 'Sourced', status: 'Sourced', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
  { id: 'col-screening', title: 'Screening', status: 'Screening', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { id: 'col-scheduled', title: 'Scheduled', status: 'Scheduled', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { id: 'col-r1', title: 'Round 1 Interview', status: 'Round 1 Interview', color: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30' },
  { id: 'col-r2', title: 'Round 2 Interview', status: 'Round 2 Interview', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  { id: 'col-hr', title: 'HR Discussion', status: 'HR Discussion', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  { id: 'col-doc', title: 'Doc Verification', status: 'Document Verification', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { id: 'col-bg', title: 'BG Verification', status: 'Background Verification', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { id: 'col-offer', title: 'Offer Released', status: 'Offer Released', color: 'bg-lime-500/20 text-lime-400 border-lime-500/30' },
  { id: 'col-joined', title: 'Joined', status: 'Joined', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { id: 'col-rejected', title: 'Rejected', status: 'Rejected', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { id: 'col-hold', title: 'Hold', status: 'Hold', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' }
];

export default function ApplicationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { applications, draftCandidates, updateApplication, deleteApplication } = useHireFlowStore();
  const [search, setSearch] = useState('');
  
  const [isMounted, setIsMounted] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Application | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Merge Drafts into the main application array for unified Kanban processing
  const allCandidates: Application[] = [
    ...applications,
    ...draftCandidates.map(d => ({
      ...d,
      id: d.draftId,
      status: 'Draft' as ApplicationStatus,
      candidateName: d.candidateName || 'Unnamed Draft',
      email: d.email || 'No email',
      position: d.position || 'Unknown Role',
      createdAt: new Date().toISOString() // Fallback
    } as Application))
  ];

  const filteredApps = allCandidates.filter(app => 
    app.candidateName.toLowerCase().includes(search.toLowerCase()) ||
    app.position.toLowerCase().includes(search.toLowerCase())
  );

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const targetCol = COLUMNS.find(col => col.id === destination.droppableId);
    if (!targetCol) return;

    // Handle drafting vs real apps (Simplified for mock: update store directly)
    if (source.droppableId === 'col-draft' && destination.droppableId !== 'col-draft') {
      // In a real app, this would convert a draft to an app. 
      // For this mock UI, we will just update the status via the store.
      // (Note: Drafts might not persist this status change perfectly if reloaded, but it satisfies the UI requirement)
    }

    updateApplication(draggableId, { status: targetCol.status }, user || undefined);
  };

  if (!isMounted) return null;

  // KPI Metrics
  const totalCount = allCandidates.length;
  const draftCount = allCandidates.filter(a => a.status === 'Draft').length;
  const scheduledCount = allCandidates.filter(a => a.status === 'Scheduled' || a.status === 'Round 1 Interview' || a.status === 'Round 2 Interview').length;
  const offeredCount = allCandidates.filter(a => a.status === 'Offer Released').length;
  const joinedCount = allCandidates.filter(a => a.status === 'Joined').length;

  return (
    <div className="space-y-4 h-[calc(100vh-2rem)] flex flex-col pt-2">
      {/* Header & KPI Summary */}
      <div className="flex flex-col gap-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-headline font-bold">Candidates Pipeline</h2>
            <p className="text-sm text-muted-foreground">Manage candidate workflow and lifecycle.</p>
          </div>
          {user?.role === 'HR' && (
            <Link href="/dashboard/applications/new">
              <Button className="bg-indigo-600 hover:bg-indigo-700 h-9 px-4 text-sm shadow-lg shadow-indigo-600/20">
                <Plus className="w-4 h-4 mr-2" /> Add Candidate
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {[
            { label: 'Total Candidates', value: totalCount, icon: UserPlus, color: 'text-indigo-400' },
            { label: 'Drafts', value: draftCount, icon: FileText, color: 'text-slate-400' },
            { label: 'Active Interviews', value: scheduledCount, icon: Calendar, color: 'text-purple-400' },
            { label: 'Offers Released', value: offeredCount, icon: CheckCircle2, color: 'text-lime-400' },
            { label: 'Joined', value: joinedCount, icon: ArrowUpRight, color: 'text-emerald-400' },
          ].map((kpi, i) => (
            <div key={i} className="bg-black/20 border border-white/5 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">{kpi.label}</p>
                <p className="text-2xl font-bold font-headline">{kpi.value}</p>
              </div>
              <div className={`p-2 rounded-lg bg-white/5 ${kpi.color}`}>
                <kpi.icon className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Filters */}
      <GlassCard noHover className="p-2 flex-shrink-0 bg-[#0B0C14]/90 backdrop-blur-xl border-white/5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input 
              placeholder="Search by name, ref number, or position..." 
              className="pl-8 bg-black/20 border-white/10 h-8 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="h-8 border-white/10 bg-white/5 text-xs text-muted-foreground">
            Status: All
          </Button>
          <Button variant="outline" size="sm" className="h-8 border-white/10 bg-white/5 text-xs text-muted-foreground">
            Interviewer: All
          </Button>
          <Button variant="outline" size="sm" className="h-8 border-white/10 bg-white/5 text-xs text-muted-foreground">
            Source: All
          </Button>
          <Button variant="outline" size="sm" className="h-8 border-white/10 bg-white/5 text-xs text-muted-foreground">
            Notice: All
          </Button>
          <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-white">
            <XCircle className="w-3.5 h-3.5 mr-1" /> Clear
          </Button>
        </div>
      </GlassCard>

      {/* Kanban Board Container */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar pb-2">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 h-full px-1">
            {COLUMNS.map((column) => {
              const columnApps = filteredApps.filter(app => app.status === column.status);
              
              return (
                <div key={column.id} className="w-full min-w-[280px] max-w-[350px] mx-auto flex flex-col h-full max-h-[800px]">
                  {/* Sticky Header */}
                  <div className="flex items-center justify-between mb-2 px-1 sticky top-0 z-10 bg-[#0B0C14] py-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${column.color.split(' ')[0]} border ${column.color.split(' ')[2]}`} />
                      <h3 className="font-semibold text-sm text-white/90">{column.title}</h3>
                    </div>
                    <Badge variant="secondary" className="bg-white/10 text-[10px] px-1.5 py-0 rounded-full text-muted-foreground">{columnApps.length}</Badge>
                  </div>
                  
                  {/* Droppable Zone */}
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 min-h-[300px] rounded-xl p-2 transition-all overflow-y-auto custom-scrollbar border ${
                          snapshot.isDraggingOver 
                            ? 'bg-white/[0.03] border-indigo-500/30 shadow-[inset_0_0_15px_rgba(99,102,241,0.05)]' 
                            : 'bg-[#11121c]/50 border-white/5'
                        }`}
                      >
                        {columnApps.length === 0 && !snapshot.isDraggingOver && (
                          <div className="h-24 flex flex-col items-center justify-center text-center opacity-30 mt-4 border-2 border-dashed border-white/10 rounded-lg">
                            <Plus className="w-5 h-5 mb-1" />
                            <p className="text-[10px] uppercase tracking-wider">Drag candidates here</p>
                          </div>
                        )}

                        {columnApps.map((app, index) => {
                          const isDraft = app.status === 'Draft';
                          // Calculate completion % for mock drafts
                          const draftCompletion = isDraft ? Math.floor(Math.random() * 40 + 40) : 100;
                          
                          return (
                          <Draggable key={app.id} draggableId={app.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`mb-2 last:mb-0`}
                                style={{
                                  ...provided.draggableProps.style,
                                  opacity: snapshot.isDragging ? 0.9 : 1,
                                  transform: snapshot.isDragging 
                                    ? `${provided.draggableProps.style?.transform} scale(1.02)` 
                                    : provided.draggableProps.style?.transform,
                                }}
                              >
                                <GlassCard 
                                  className={`p-2.5 transition-all bg-[#171926]/90 border ${
                                    snapshot.isDragging ? 'border-indigo-500/50 shadow-2xl ring-1 ring-indigo-500/30' : 'border-white/5 hover:border-white/20 hover:bg-[#1a1c2a]'
                                  }`} 
                                  noHover
                                >
                                  {/* Top Row: Ref & Actions */}
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-mono">
                                      {isDraft ? 'DRAFT' : `#${app.id.slice(0,6).toUpperCase()}`}
                                    </span>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-5 w-5 text-white/30 hover:text-white shrink-0 -mr-1 -mt-1 rounded-sm">
                                          <MoreHorizontal className="w-3.5 h-3.5" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="bg-[#1e1b4b] border-white/10 text-white text-xs shadow-2xl w-40">
                                        <DropdownMenuItem className="cursor-pointer focus:bg-white/10 py-1.5" onSelect={() => setSelectedCandidate(app)}>
                                          View Profile
                                        </DropdownMenuItem>
                                        {!isDraft && <DropdownMenuItem className="cursor-pointer focus:bg-white/10 py-1.5">Schedule Interview</DropdownMenuItem>}
                                        {user?.role === 'HR' && (
                                          <DropdownMenuItem className="cursor-pointer focus:bg-white/10 py-1.5" onSelect={() => router.push(`/dashboard/applications/${app.id}/edit`)}>
                                            Edit Candidate
                                          </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator className="bg-white/10" />
                                        {user?.role === 'HR' && (
                                          <DropdownMenuItem className="cursor-pointer text-rose-400 focus:bg-rose-500/20 py-1.5" onSelect={() => deleteApplication(app.id)}>
                                            Delete Candidate
                                          </DropdownMenuItem>
                                        )}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>

                                  {/* Candidate Identity */}
                                  <div className="flex items-center gap-2.5 mb-2.5 cursor-pointer group" onClick={() => setSelectedCandidate(app)}>
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/70 to-purple-500/70 border border-white/10 flex items-center justify-center font-bold text-xs shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                                      {app.candidateName.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                      <h4 className="font-semibold text-sm leading-tight text-white/95 truncate group-hover:text-indigo-300 transition-colors">{app.candidateName}</h4>
                                      <p className="text-[11px] text-indigo-200/60 mt-0.5 font-medium truncate">{app.position}</p>
                                    </div>
                                  </div>

                                  {/* High Density Info Grid */}
                                  <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                                    <div className="bg-black/30 rounded p-1.5 flex items-center gap-1.5 border border-white/5">
                                      <Briefcase className="w-3 h-3 text-white/30 shrink-0" />
                                      <span className="text-[10px] text-white/60 truncate">{app.experience || 'N/A Exp'}</span>
                                    </div>
                                    <div className="bg-black/30 rounded p-1.5 flex items-center gap-1.5 border border-white/5">
                                      <MapPin className="w-3 h-3 text-white/30 shrink-0" />
                                      <span className="text-[10px] text-white/60 truncate">{app.source || 'Direct'}</span>
                                    </div>
                                  </div>
                                  
                                  {/* Draft Specific UI or Notice Period */}
                                  {isDraft ? (
                                    <div className="mt-2 pt-2 border-t border-white/5">
                                      <div className="flex justify-between items-center mb-1">
                                        <span className="text-[9px] text-muted-foreground">Completion</span>
                                        <span className="text-[9px] font-semibold text-slate-300">{draftCompletion}%</span>
                                      </div>
                                      <div className="h-1 bg-black/40 rounded-full overflow-hidden">
                                        <div className="h-full bg-slate-500/50 rounded-full" style={{ width: `${draftCompletion}%` }} />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {app.noticePeriodType === 'Immediate Joiner' && (
                                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] px-1 py-0 font-medium">
                                          Immediate
                                        </Badge>
                                      )}
                                      {app.assignedInterviewerId && (
                                        <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[9px] px-1 py-0 font-medium flex items-center gap-1">
                                          <UserPlus className="w-2.5 h-2.5" /> Assigned
                                        </Badge>
                                      )}
                                    </div>
                                  )}

                                  {/* Footer Last Updated */}
                                  <div className="flex items-center gap-1 mt-2.5 text-[9px] text-muted-foreground">
                                    <Clock className="w-2.5 h-2.5" />
                                    <span>Updated {app.createdAt ? formatDistanceToNow(new Date(app.createdAt), {addSuffix: true}) : 'recently'}</span>
                                  </div>
                                </GlassCard>
                              </div>
                            )}
                          </Draggable>
                        )})}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {/* Profile Drawer */}
      <Sheet open={!!selectedCandidate} onOpenChange={(open) => !open && setSelectedCandidate(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-[#0B0C14]/95 backdrop-blur-3xl border-l border-white/10 p-0 overflow-y-auto custom-scrollbar">
          {selectedCandidate && (
            <div className="flex flex-col h-full">
              {/* Drawer Header */}
              <div className="p-6 border-b border-white/5 bg-gradient-to-b from-indigo-500/10 to-transparent">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-2xl shadow-lg border border-white/10">
                    {selectedCandidate.candidateName.charAt(0)}
                  </div>
                  <Badge className="bg-white/10 hover:bg-white/20">{selectedCandidate.status}</Badge>
                </div>
                <SheetTitle className="text-2xl font-headline">{selectedCandidate.candidateName}</SheetTitle>
                <SheetDescription className="text-indigo-200/60 mt-1 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> {selectedCandidate.position}
                </SheetDescription>
              </div>

              {/* Drawer Body */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Experience</p>
                    <p className="text-sm font-medium">{selectedCandidate.experience || 'Not specified'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Notice Period</p>
                    <p className="text-sm font-medium">{selectedCandidate.noticePeriodType || 'Not specified'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{selectedCandidate.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">{selectedCandidate.phone || 'Not specified'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Top Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.skills?.map(skill => (
                      <Badge key={skill} variant="outline" className="bg-white/5 border-white/10">{skill}</Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-white/5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Timeline</p>
                  <div className="relative pl-4 border-l border-white/10 space-y-4">
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-indigo-500 ring-4 ring-[#0B0C14]"></div>
                      <p className="text-xs font-semibold">Current Stage: {selectedCandidate.status}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Updated just now</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-white/20 ring-4 ring-[#0B0C14]"></div>
                      <p className="text-xs font-medium text-white/60">Application Created</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {selectedCandidate.createdAt ? new Date(selectedCandidate.createdAt).toLocaleDateString() : 'Unknown date'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="mt-auto p-6 bg-black/20 border-t border-white/5 flex gap-3">
                <Button className="flex-1 bg-white hover:bg-zinc-200 text-black">
                  View Full Profile
                </Button>
                {selectedCandidate.resumeUrl && (
                  <Button variant="outline" className="flex-1 border-white/10 hover:bg-white/5">
                    View Resume
                  </Button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

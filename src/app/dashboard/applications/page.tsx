"use client";

import React, { useState, useEffect } from 'react';
import { useHireFlowStore } from '@/lib/store';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Mail, 
  Filter,
  Users,
  Briefcase
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/components/auth-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ApplicationStatus } from '@/lib/types';

// Map our columns to actual ApplicationStatus types
const COLUMNS: { id: string; title: string; status: ApplicationStatus }[] = [
  { id: 'col-1', title: 'Sourced (Pending)', status: 'Pending' },
  { id: 'col-2', title: 'Interviewing (Scheduled)', status: 'Scheduled' },
  { id: 'col-3', title: 'Evaluation (Completed)', status: 'COMPLETED' },
  { id: 'col-4', title: 'Offered (Selected)', status: 'SELECTED' },
  { id: 'col-5', title: 'Rejected', status: 'REJECTED' }
];

export default function ApplicationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { applications, updateApplication, deleteApplication } = useHireFlowStore();
  const [search, setSearch] = useState('');
  
  // Strict mode workaround for react-beautiful-dnd / hello-pangea
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const filteredApps = applications.filter(app => 
    app.candidateName.toLowerCase().includes(search.toLowerCase()) ||
    app.position.toLowerCase().includes(search.toLowerCase())
  );

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Find the target column to get the new status
    const targetCol = COLUMNS.find(col => col.id === destination.droppableId);
    if (!targetCol) return;

    // Update the application status in the store
    updateApplication(draggableId, { status: targetCol.status }, user || undefined);
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h2 className="text-3xl font-headline font-bold">Candidates Pipeline</h2>
          <p className="text-muted-foreground">Drag and drop candidates to update their progress.</p>
        </div>
        {user?.role === 'HR' && (
          <Link href="/dashboard/applications/new">
            <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20">
              <Plus className="w-4 h-4 mr-2" /> Add New Candidate
            </Button>
          </Link>
        )}
      </div>

      <GlassCard noHover className="p-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or position..." 
              className="pl-10 bg-white/5 border-white/10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="border-white/10 bg-white/5">
            <Filter className="w-4 h-4 mr-2" /> Filters
          </Button>
        </div>
      </GlassCard>

      <div className="flex-1 overflow-x-auto pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 min-w-max h-full">
            {COLUMNS.map((column) => {
              const columnApps = filteredApps.filter(app => app.status === column.status);
              
              return (
                <div key={column.id} className="w-[350px] flex flex-col">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="font-semibold text-lg">{column.title}</h3>
                    <Badge variant="secondary" className="bg-white/10">{columnApps.length}</Badge>
                  </div>
                  
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 min-h-[500px] rounded-xl p-3 transition-colors ${
                          snapshot.isDraggingOver ? 'bg-white/5 border-2 border-dashed border-white/20' : 'bg-black/20'
                        }`}
                      >
                        {columnApps.map((app, index) => (
                          <Draggable key={app.id} draggableId={app.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`mb-3 last:mb-0`}
                                style={{
                                  ...provided.draggableProps.style,
                                  opacity: snapshot.isDragging ? 0.8 : 1,
                                }}
                              >
                                <GlassCard className="p-4 hover:border-indigo-500/50 transition-colors shadow-xl" noHover>
                                  <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-sm shrink-0">
                                        {app.candidateName.charAt(0)}
                                      </div>
                                      <div>
                                        <h4 className="font-semibold">{app.candidateName}</h4>
                                        <p className="text-xs text-muted-foreground">{app.position}</p>
                                      </div>
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white shrink-0">
                                          <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="bg-[#1e1b4b] border-white/10 text-white">
                                        <DropdownMenuItem onSelect={() => router.push(`/dashboard/applications/${app.id}`)}>
                                          View Details
                                        </DropdownMenuItem>
                                        {user?.role === 'HR' && (
                                          <DropdownMenuItem onSelect={() => router.push(`/dashboard/applications/${app.id}/edit`)}>
                                            Edit Profile
                                          </DropdownMenuItem>
                                        )}
                                        {user?.role === 'HR' && (
                                          <DropdownMenuItem className="text-rose-400 focus:bg-rose-400/10" onSelect={() => deleteApplication(app.id)}>
                                            Delete
                                          </DropdownMenuItem>
                                        )}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                  
                                  <div className="text-xs text-muted-foreground space-y-1">
                                    <p className="flex items-center gap-2 truncate"><Mail className="w-3 h-3 shrink-0" /> {app.email}</p>
                                    <p className="flex items-center gap-2"><Briefcase className="w-3 h-3 shrink-0" /> {app.experience}</p>
                                  </div>
                                  
                                  {app.noticePeriodType === 'Immediate Joiner' && (
                                    <div className="mt-3">
                                      <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px]">
                                        Immediate Joiner
                                      </Badge>
                                    </div>
                                  )}
                                </GlassCard>
                              </div>
                            )}
                          </Draggable>
                        ))}
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
    </div>
  );
}

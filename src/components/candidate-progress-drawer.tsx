"use client";

import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Application, ApplicationStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, MapPin, Mail, Phone, Calendar, Clock, CheckCircle2, FileText, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CandidateProgressDrawerProps {
  candidate: Application | null;
  onClose: () => void;
}

const STATUS_STAGES: { status: ApplicationStatus; label: string }[] = [
  { status: 'Applied', label: 'Applied' },
  { status: 'Screening', label: 'Screening' },
  { status: 'Round 1 Interview', label: 'Round 1' },
  { status: 'Round 2 Interview', label: 'Round 2' },
  { status: 'HR Discussion', label: 'HR Round' },
  { status: 'Document Verification', label: 'Verification' },
  { status: 'Offer Released', label: 'Offer' },
  { status: 'Joined', label: 'Joined' }
];

export const CandidateProgressDrawer: React.FC<CandidateProgressDrawerProps> = ({ candidate, onClose }) => {
  if (!candidate) return null;

  // Calculate current stage index for the visual tracker
  const currentStageIndex = STATUS_STAGES.findIndex(s => s.status === candidate.status);
  
  // Handle edge cases like Rejected/Hold which aren't in the linear happy path
  const isRejected = candidate.status === 'Rejected';
  const isHold = candidate.status === 'Hold';

  return (
    <Sheet open={!!candidate} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl bg-[#0B0C14]/95 backdrop-blur-3xl border-l border-white/10 p-0 overflow-y-auto custom-scrollbar flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 bg-gradient-to-b from-indigo-500/10 to-transparent shrink-0">
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-2xl shadow-lg border border-white/10 shrink-0">
                {candidate.candidateName.charAt(0)}
              </div>
              <div>
                <SheetTitle className="text-2xl font-headline">{candidate.candidateName}</SheetTitle>
                <SheetDescription className="text-indigo-200/60 mt-1 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 shrink-0" /> {candidate.position}
                </SheetDescription>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono mt-1">
                  REF: #{candidate.id.toUpperCase().slice(0, 8)}
                </div>
              </div>
            </div>
            
            <Badge className={`
              ${isRejected ? 'bg-red-500/20 text-red-400' : ''}
              ${isHold ? 'bg-yellow-500/20 text-yellow-400' : ''}
              ${candidate.status === 'Joined' ? 'bg-emerald-500/20 text-emerald-400' : ''}
              bg-white/10 hover:bg-white/20
            `}>
              {candidate.status}
            </Badge>
          </div>

          {/* Visual Progress Tracker */}
          <div className="mt-8 relative px-2">
            <div className="absolute top-2.5 left-6 right-6 h-0.5 bg-white/10 rounded-full" />
            <div 
              className="absolute top-2.5 left-6 h-0.5 bg-indigo-500 rounded-full transition-all duration-500" 
              style={{ width: `${Math.max(0, (currentStageIndex / (STATUS_STAGES.length - 1)) * 100)}%` }} 
            />
            
            <div className="flex justify-between relative z-10">
              {STATUS_STAGES.map((stage, idx) => {
                const isCompleted = currentStageIndex > idx || candidate.status === 'Joined';
                const isCurrent = currentStageIndex === idx;
                
                let dotClass = "bg-[#11121c] border-white/20 text-transparent"; // Future
                if (isCompleted) dotClass = "bg-indigo-500 border-indigo-500 text-white"; // Completed
                if (isCurrent) dotClass = isRejected ? "bg-red-500 border-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]" 
                                        : isHold ? "bg-yellow-500 border-yellow-500 text-white shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                                        : "bg-[#0B0C14] border-indigo-500 ring-2 ring-indigo-500/30 text-indigo-500"; // Current

                return (
                  <div key={stage.status} className="flex flex-col items-center gap-2 group">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${dotClass}`}>
                      {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : (isCurrent && (isRejected || isHold) ? <AlertCircle className="w-3 h-3" /> : null)}
                    </div>
                    <span className={`text-[9px] font-medium max-w-[60px] text-center leading-tight transition-colors ${isCurrent ? 'text-white' : isCompleted ? 'text-white/70' : 'text-white/30'}`}>
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tabbed Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="w-full grid grid-cols-4 bg-white/5 border border-white/5 mb-6">
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="docs">Docs</TabsTrigger>
              <TabsTrigger value="interviews">Interviews</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 bg-white/5 p-3 rounded-lg border border-white/5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> Email</p>
                  <p className="text-sm font-medium truncate">{candidate.email}</p>
                </div>
                <div className="space-y-1 bg-white/5 p-3 rounded-lg border border-white/5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</p>
                  <p className="text-sm font-medium">{candidate.phone || 'N/A'}</p>
                </div>
                <div className="space-y-1 bg-white/5 p-3 rounded-lg border border-white/5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Briefcase className="w-3 h-3" /> Experience</p>
                  <p className="text-sm font-medium">{candidate.experience || 'N/A'}</p>
                </div>
                <div className="space-y-1 bg-white/5 p-3 rounded-lg border border-white/5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Notice Period</p>
                  <p className="text-sm font-medium">{candidate.noticePeriodType || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Key Skills</p>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills?.map(skill => (
                    <Badge key={skill} variant="outline" className="bg-white/5 border-white/10">{skill}</Badge>
                  ))}
                  {(!candidate.skills || candidate.skills.length === 0) && <span className="text-xs text-muted-foreground">No skills listed</span>}
                </div>
              </div>

              {candidate.notes && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Internal Notes</p>
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-sm text-white/80 whitespace-pre-wrap">
                    {candidate.notes}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="docs" className="space-y-4">
              <div className="border border-white/10 rounded-xl p-4 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Resume / CV</p>
                    <p className="text-xs text-muted-foreground">PDF Document</p>
                  </div>
                </div>
                {candidate.resumeUrl ? (
                  <Button variant="outline" size="sm" className="border-white/10 text-xs">View</Button>
                ) : (
                  <Badge variant="secondary" className="bg-white/5 text-muted-foreground">Missing</Badge>
                )}
              </div>
              
              <div className="border border-white/10 rounded-xl p-4 flex items-center justify-between bg-white/[0.02] opacity-60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 text-muted-foreground flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Govt Identity (Aadhar/PAN)</p>
                    <p className="text-xs text-muted-foreground">Required for Verification</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-white/10 text-xs" disabled>Upload</Button>
              </div>
            </TabsContent>

            <TabsContent value="interviews" className="space-y-4">
              <div className="text-center py-8 text-muted-foreground border border-dashed border-white/10 rounded-xl">
                <Calendar className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No interview schedules found.</p>
                <Button variant="link" className="text-indigo-400 mt-2">Schedule Interview</Button>
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <div className="relative pl-4 border-l border-white/10 space-y-6 mt-2">
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-indigo-500 ring-4 ring-[#0B0C14]"></div>
                  <p className="text-xs font-semibold">Current Stage: {candidate.status}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Updated recently</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-white/20 ring-4 ring-[#0B0C14]"></div>
                  <p className="text-xs font-medium text-white/60">Application Created</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString() : 'Unknown date'}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-black/40 border-t border-white/5 flex gap-3 shrink-0">
          <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">
            Advance Stage
          </Button>
          <Button variant="outline" className="border-white/10 hover:bg-rose-500/10 hover:text-rose-400">
            Reject
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

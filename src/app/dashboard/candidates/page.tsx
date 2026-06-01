"use client";

import React, { useState, useEffect } from 'react';
import { useHireFlowStore } from '@/lib/store';
import { useAuth } from '@/components/auth-context';
import { Application } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Search, Filter, Download, MoreHorizontal, UserPlus, 
  Calendar, CheckCircle2, ArrowUpRight, Clock, MapPin, Briefcase 
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CandidateProgressDrawer } from '@/components/candidate-progress-drawer';
import { formatDistanceToNow } from 'date-fns';

export default function CandidateManagementPage() {
  const { user } = useAuth();
  const { applications, draftCandidates, deleteApplication } = useHireFlowStore();
  const [search, setSearch] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<Application | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // Merge Drafts for tracking
  const allCandidates: Application[] = [
    ...applications,
    ...draftCandidates.map(d => ({
      ...d,
      id: d.draftId,
      status: 'Draft',
      candidateName: d.candidateName || 'Unnamed Draft',
      email: d.email || 'No email',
      position: d.position || 'Unknown Role',
      createdAt: new Date().toISOString()
    } as Application))
  ];

  const filteredCandidates = allCandidates.filter(app => 
    app.candidateName.toLowerCase().includes(search.toLowerCase()) ||
    app.position.toLowerCase().includes(search.toLowerCase()) ||
    app.id.toLowerCase().includes(search.toLowerCase())
  );

  // Admin / HR KPIs
  const totalCount = allCandidates.length;
  const activeCount = allCandidates.filter(a => !['Rejected', 'Joined', 'Hold'].includes(a.status)).length;
  const draftCount = allCandidates.filter(a => a.status === 'Draft').length;
  const scheduledCount = allCandidates.filter(a => ['Scheduled', 'Round 1 Interview', 'Round 2 Interview'].includes(a.status)).length;
  const offeredCount = allCandidates.filter(a => a.status === 'Offer Released').length;
  const joinedCount = allCandidates.filter(a => a.status === 'Joined').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold">Candidate Tracking</h2>
          <p className="text-muted-foreground mt-1">Centralized ATS tracking and candidate management.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-white/10 bg-white/5 text-white">
            <Download className="w-4 h-4 mr-2" /> Export Report
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20">
            <UserPlus className="w-4 h-4 mr-2" /> Add Candidate
          </Button>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Total Candidates', value: totalCount, icon: UserPlus, color: 'text-blue-400' },
          { label: 'Active Pipeline', value: activeCount, icon: Clock, color: 'text-indigo-400' },
          { label: 'Draft Candidates', value: draftCount, icon: Filter, color: 'text-slate-400' },
          { label: 'Interviews Scheduled', value: scheduledCount, icon: Calendar, color: 'text-purple-400' },
          { label: 'Offers Released', value: offeredCount, icon: CheckCircle2, color: 'text-lime-400' },
          { label: 'Joined Candidates', value: joinedCount, icon: ArrowUpRight, color: 'text-emerald-400' },
        ].map((kpi, i) => (
          <div key={i} className="bg-[#11121c]/80 backdrop-blur-xl border border-white/5 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">{kpi.label}</p>
              <div className={`p-1.5 rounded-lg bg-white/5 ${kpi.color}`}>
                <kpi.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-bold font-headline">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-[#0B0C14]/90 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-4 border-b border-white/5 flex flex-wrap items-center gap-3 bg-white/[0.02]">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by Name, Reference ID, or Position..." 
              className="pl-9 bg-black/20 border-white/10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="border-white/10 bg-[#11121c]">
            Status: All
          </Button>
          <Button variant="outline" className="border-white/10 bg-[#11121c]">
            Interviewer: All
          </Button>
          <Button variant="outline" className="border-white/10 bg-[#11121c]">
            Source: All
          </Button>
          <Button variant="outline" className="border-white/10 bg-[#11121c]">
            <Filter className="w-4 h-4 mr-2" /> More Filters
          </Button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-black/40">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="w-[250px] font-semibold text-white/70">Candidate</TableHead>
                <TableHead className="font-semibold text-white/70">Position & Experience</TableHead>
                <TableHead className="font-semibold text-white/70">Tracking Status</TableHead>
                <TableHead className="font-semibold text-white/70">Notice Period</TableHead>
                <TableHead className="font-semibold text-white/70">Source</TableHead>
                <TableHead className="font-semibold text-white/70 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                    No candidates found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCandidates.map((app) => (
                  <TableRow 
                    key={app.id} 
                    className="border-white/5 hover:bg-white/[0.02] cursor-pointer group transition-colors"
                    onClick={() => setSelectedCandidate(app)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center font-bold text-sm text-indigo-300">
                          {app.candidateName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-white/90 group-hover:text-indigo-300 transition-colors">{app.candidateName}</p>
                          <p className="text-[10px] text-muted-foreground font-mono uppercase">#{app.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm text-white/80">{app.position}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Briefcase className="w-3 h-3" /> {app.experience || 'N/A'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`
                        ${app.status === 'Draft' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' : ''}
                        ${['Applied', 'Sourced', 'Screening'].includes(app.status) ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : ''}
                        ${['Scheduled', 'Round 1 Interview', 'Round 2 Interview', 'HR Discussion'].includes(app.status) ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : ''}
                        ${['Document Verification', 'Background Verification'].includes(app.status) ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : ''}
                        ${app.status === 'Offer Released' ? 'bg-lime-500/10 text-lime-400 border-lime-500/20' : ''}
                        ${app.status === 'Joined' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''}
                        ${app.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : ''}
                        ${app.status === 'Hold' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : ''}
                      `}>
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-white/70">{app.noticePeriodType || 'N/A'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs px-2 py-1 bg-white/5 rounded-md border border-white/5 text-muted-foreground">
                        {app.source || 'Direct'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#1e1b4b] border-white/10 text-white shadow-xl">
                          <DropdownMenuItem onClick={() => setSelectedCandidate(app)}>View Details</DropdownMenuItem>
                          {app.status !== 'Draft' && <DropdownMenuItem>Schedule Interview</DropdownMenuItem>}
                          <DropdownMenuItem>Edit Candidate</DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem className="text-rose-400 focus:bg-rose-500/20">Delete Record</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Progress Tracking Drawer */}
      <CandidateProgressDrawer 
        candidate={selectedCandidate} 
        onClose={() => setSelectedCandidate(null)} 
      />
    </div>
  );
}

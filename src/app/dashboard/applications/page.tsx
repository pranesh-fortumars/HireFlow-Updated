
"use client";

import React, { useState } from 'react';
import { useHireFlowStore } from '@/lib/store';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Mail, 
  Filter,
  Users,
  Briefcase,
  ChevronRight
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

export default function ApplicationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { applications, deleteApplication } = useHireFlowStore();
  const [search, setSearch] = useState('');

  const filteredApps = applications.filter(app => 
    app.candidateName.toLowerCase().includes(search.toLowerCase()) ||
    app.position.toLowerCase().includes(search.toLowerCase()) ||
    app.noticePeriodType?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold">Candidates</h2>
          <p className="text-muted-foreground">Manage and track all current job applicants.</p>
        </div>
        {user?.role === 'HR' && (
          <Link href="/dashboard/applications/new">
            <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20">
              <Plus className="w-4 h-4 mr-2" /> Add New Candidate
            </Button>
          </Link>
        )}
      </div>

      <GlassCard noHover className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, position, notice period..." 
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

      <div className="grid grid-cols-1 gap-4">
        {filteredApps.map((app) => {
          const isImmediate = app.noticePeriodType === 'Immediate Joiner' || app.noticePeriodType === 'No Notice Period Applicable';
          return (
          <GlassCard key={app.id} className="p-0 overflow-hidden hover:bg-white/[0.07]" noHover>
            <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-lg">
                  {app.candidateName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-lg">{app.candidateName}</h4>
                    {isImmediate && (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        High Priority: Available Now
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {app.email}</span>
                    <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {app.position}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex flex-col items-end mr-4">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Status</p>
                  <Badge className={
                    app.status === 'SELECTED' ? 'bg-emerald-500/10 text-emerald-400' :
                    app.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400' :
                    app.status === 'SCHEDULED' ? 'bg-cyan-500/10 text-cyan-400' :
                    'bg-amber-500/10 text-amber-400'
                  }>
                    {app.status.toLowerCase()}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/applications/${app.id}`}>
                    <Button variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20">
                      View Details
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#1e1b4b] border-white/10 text-white">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem 
                        className="focus:bg-white/10 cursor-pointer"
                        onSelect={() => router.push(`/dashboard/applications/${app.id}/edit`)}
                      >
                        Edit Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="focus:bg-white/10 cursor-pointer"
                        onSelect={() => router.push(`/dashboard/applications/${app.id}`)}
                      >
                        Schedule Interview
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem 
                        className="text-rose-400 focus:bg-rose-400/10 cursor-pointer"
                        onSelect={() => deleteApplication(app.id)}
                      >
                        Delete Application
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </GlassCard>
          );
        })}

        {filteredApps.length === 0 && (
          <div className="text-center py-20">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-xl font-headline font-semibold">No candidates found</h3>
            <p className="text-muted-foreground">Try adjusting your search or add a new candidate.</p>
          </div>
        )}
      </div>
    </div>
  );
}

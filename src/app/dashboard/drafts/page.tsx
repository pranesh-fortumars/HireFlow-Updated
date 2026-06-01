"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHireFlowStore } from '@/lib/store';
import { useAuth } from '@/components/auth-context';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, FileEdit, Trash2, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

export default function DraftsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { draftCandidates, deleteDraft, isDraftsInitialized } = useHireFlowStore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter drafts for current HR user only
  const myDrafts = draftCandidates.filter(d => d.createdBy === user?.id);
  
  const filteredDrafts = myDrafts.filter(d => {
    const searchStr = searchTerm.toLowerCase();
    return (
      d.candidateName?.toLowerCase().includes(searchStr) ||
      d.position?.toLowerCase().includes(searchStr) ||
      d.email?.toLowerCase().includes(searchStr)
    );
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteDraft(id);
      toast({ title: "Draft Deleted", description: "The draft was permanently removed." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete draft.", variant: "destructive" });
    }
  };

  if (!isDraftsInitialized) {
    return <div className="p-8 text-center text-muted-foreground">Loading drafts...</div>;
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold flex items-center gap-3">
            <FileEdit className="w-8 h-8 text-amber-400" /> Draft Candidates
          </h2>
          <p className="text-muted-foreground mt-2">Manage and continue editing your incomplete candidate profiles.</p>
        </div>
        <Button onClick={() => router.push('/dashboard/applications/new')} className="bg-indigo-600 hover:bg-indigo-700">
          New Candidate
        </Button>
      </div>

      <GlassCard noHover>
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search drafts by name, email or role..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/10"
            />
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-white/10 bg-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-medium">Candidate Profile</th>
                  <th className="px-6 py-4 font-medium">Position</th>
                  <th className="px-6 py-4 font-medium">Last Saved</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrafts.map((draft) => (
                  <tr key={draft.draftId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold font-headline">
                          {draft.candidateName ? draft.candidateName.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{draft.candidateName || 'Unnamed Draft'}</p>
                          <p className="text-xs text-muted-foreground">{draft.email || 'No email provided'}</p>
                          <Badge variant="outline" className="mt-1 border-amber-500/30 text-amber-400 bg-amber-500/10">Draft</Badge>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {draft.position || <span className="text-muted-foreground italic">Not specified</span>}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(draft.lastSaved).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="hover:bg-indigo-500/20 hover:text-indigo-400"
                          onClick={() => router.push(`/dashboard/applications/new?draftId=${draft.draftId}`)}
                        >
                          Resume <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-rose-500/20 hover:text-rose-400">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-[#0f111a] border-white/10">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this draft?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the draft profile for "{draft.candidateName || 'Unnamed'}". This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-white/5 hover:bg-white/10 border-white/10">Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-rose-600 hover:bg-rose-700 text-white" onClick={() => handleDelete(draft.draftId)}>
                                Delete Draft
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredDrafts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      No draft candidates found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

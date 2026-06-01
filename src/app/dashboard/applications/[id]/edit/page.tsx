
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useHireFlowStore } from '@/lib/store';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Save, 
  UserPlus, 
  FileText, 
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function EditApplicationPage() {
  const { id } = useParams();
  const router = useRouter();
  const { applications, updateApplication, isInitialized } = useHireFlowStore();
  const { toast } = useToast();
  
  const app = applications.find(a => a.id === id);

  const [formData, setFormData] = useState({
    candidateName: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    skills: '',
    resumeUrl: '',
    notes: ''
  });

  useEffect(() => {
    if (app) {
      setFormData({
        candidateName: app.candidateName || '',
        email: app.email || '',
        phone: app.phone || '',
        position: app.position || '',
        experience: app.experience || '',
        skills: app.skills?.join(', ') || '',
        resumeUrl: app.resumeUrl || '',
        notes: app.notes || ''
      });
    }
  }, [app]);

  if (isInitialized && !app) {
    return <div className="p-8 text-center">Candidate not found.</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.candidateName || !formData.email || !formData.position) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    updateApplication(id as string, {
      ...formData,
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s !== '')
    });

    toast({
      title: "Success",
      description: "Candidate profile updated successfully.",
    });

    router.push(`/dashboard/applications/${id}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h2 className="text-3xl font-headline font-bold">Edit Candidate Details</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <GlassCard noHover className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="candidateName">Full Name *</Label>
              <Input 
                id="candidateName" 
                name="candidateName" 
                placeholder="John Doe" 
                className="bg-white/5 border-white/10"
                value={formData.candidateName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="john@example.com" 
                className="bg-white/5 border-white/10"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                name="phone" 
                placeholder="+1 (555) 000-0000" 
                className="bg-white/5 border-white/10"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Applied Position *</Label>
              <Input 
                id="position" 
                name="position" 
                placeholder="e.g. Senior Frontend Developer" 
                className="bg-white/5 border-white/10"
                value={formData.position}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input 
                id="experience" 
                name="experience" 
                placeholder="e.g. 5 years" 
                className="bg-white/5 border-white/10"
                value={formData.experience}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resumeUrl">Resume Link (PDF)</Label>
              <Input 
                id="resumeUrl" 
                name="resumeUrl" 
                placeholder="https://dropbox.com/s/resume.pdf" 
                className="bg-white/5 border-white/10"
                value={formData.resumeUrl}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Skills (comma separated)</Label>
            <Input 
              id="skills" 
              name="skills" 
              placeholder="React, TypeScript, Node.js" 
              className="bg-white/5 border-white/10"
              value={formData.skills}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Internal Notes</Label>
            <Textarea 
              id="notes" 
              name="notes" 
              placeholder="Initial impressions..." 
              className="bg-white/5 border-white/10 min-h-[120px]"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <div className="pt-4 flex gap-4">
            <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 h-11 text-lg">
              <Save className="w-5 h-5 mr-2" /> Save Changes
            </Button>
            <Button type="button" variant="secondary" className="bg-white/5 hover:bg-white/10 h-11" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </GlassCard>
      </form>
    </div>
  );
}

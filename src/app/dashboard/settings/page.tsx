"use client";

import React from 'react';
import { GlassCard } from '@/components/glass-card';
import { Settings, Building2, Mail, Globe, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { toast } = useToast();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Settings Saved",
      description: "Company profile has been successfully updated.",
    });
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-3xl font-headline font-bold flex items-center gap-3">
          <Settings className="w-8 h-8 text-indigo-400" /> Company Settings
        </h2>
        <p className="text-muted-foreground mt-2">Manage your organization's general profile and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <GlassCard noHover>
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xl font-semibold">General Information</h3>
          </div>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Company Name</label>
              <Input defaultValue="Acme Corporation" className="bg-white/5 border-white/10" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Contact Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input defaultValue="contact@acme.inc" className="pl-10 bg-white/5 border-white/10" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Website URL</label>
              <div className="relative">
                <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input defaultValue="https://acme.inc" className="pl-10 bg-white/5 border-white/10" />
              </div>
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20">
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </Button>
          </form>
        </GlassCard>

        <GlassCard noHover className="h-fit">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-5 h-5 text-cyan-400" />
            <h3 className="text-xl font-semibold">System Preferences</h3>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive daily digest of interviews.</p>
              </div>
              <div className="w-10 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div>
                <p className="font-medium">Strict Document Verification</p>
                <p className="text-sm text-muted-foreground">Block scheduling until documents are verified.</p>
              </div>
              <div className="w-10 h-6 bg-white/10 rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white/50 rounded-full"></div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

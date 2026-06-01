
"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from '@/components/auth-context';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRole } from '@/lib/types';
import { Briefcase, ShieldCheck, UserCheck } from 'lucide-react';

const LoginPageContent = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123456');
  const [activeTab, setActiveTab] = useState<UserRole>('HR');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email || `${activeTab.toLowerCase()}@company.com`, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-bg relative overflow-hidden">
      {/* Background blobs */}
      <div className="blob w-[600px] h-[600px] bg-indigo-600 top-[-20%] left-[-10%] opacity-10" />
      <div className="blob w-[500px] h-[500px] bg-cyan-600 bottom-[-10%] right-[-10%] opacity-10" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-headline font-bold mb-2 tracking-tight">
            HireFlow <span className="text-indigo-500 neon-text-indigo">Glass</span>
          </h1>
          <p className="text-muted-foreground">The future of HR coordination.</p>
        </div>

        <GlassCard noHover className="p-8">
          <Tabs defaultValue="HR" className="w-full" onValueChange={(val) => setActiveTab(val as UserRole)}>
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/5 border border-white/10 p-1">
              <TabsTrigger value="HR" className="data-[state=active]:bg-indigo-600">HR</TabsTrigger>
              <TabsTrigger value="INTERVIEWER" className="data-[state=active]:bg-indigo-600">Interviewer</TabsTrigger>
              <TabsTrigger value="ADMIN" className="data-[state=active]:bg-indigo-600">Admin</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Work Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder={activeTab === 'HR' ? 'hr@company.com' : activeTab === 'INTERVIEWER' ? 'interviewer@company.com' : 'admin@company.com'}
                  className="bg-white/5 border-white/10 focus:border-indigo-500 transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  className="bg-white/5 border-white/10 focus:border-indigo-500 transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 text-lg font-semibold shadow-lg shadow-indigo-600/20">
                  Sign In as {activeTab === 'HR' ? 'HR Lead' : activeTab === 'INTERVIEWER' ? 'Interviewer' : 'Administrator'}
                </Button>
              </div>
            </form>
          </Tabs>
        </GlassCard>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Demo Credentials: Use password <strong>123456</strong>
        </p>
      </motion.div>
    </div>
  );
};

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginPageContent />
    </AuthProvider>
  );
}

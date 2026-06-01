"use client";

import React, { useState } from 'react';
import { GlassCard } from '@/components/glass-card';
import { useHireFlowStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Settings, ShieldAlert, Mail, UserCheck, Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { usersCollection } from '@/lib/firestore-schema';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/lib/types';

export default function UsersPage() {
  const { allUsers } = useHireFlowStore();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('HR');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Save user role and data to Firestore
      await setDoc(doc(usersCollection, uid), {
        name,
        email,
        role,
        isActive: true,
        avatar: `https://picsum.photos/seed/${uid}/100/100`
      });

      toast({ title: 'Success', description: 'User created successfully.' });
      setIsOpen(false);
      setName('');
      setEmail('');
      setPassword('');
      setRole('HR');
    } catch (error: any) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(usersCollection, userId), { isActive: !currentStatus });
      toast({ title: 'Success', description: `User ${!currentStatus ? 'activated' : 'deactivated'}.` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleChangeRole = async (userId: string, newRole: UserRole) => {
    try {
      await updateDoc(doc(usersCollection, userId), { role: newRole });
      toast({ title: 'Success', description: 'Role updated successfully.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage roles, access, and accounts across the platform.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20">
              <UserPlus className="w-4 h-4 mr-2" />
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0B0C14]/95 backdrop-blur-xl border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">Create User Account</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} required className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <Label>Temporary Password</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="bg-white/5 border-white/10" minLength={6} />
              </div>
              <div className="space-y-2">
                <Label>System Role</Label>
                <Select value={role} onValueChange={(val: UserRole) => setRole(val)}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f111a] border-white/10 text-white">
                    <SelectItem value="HR">HR Executive</SelectItem>
                    <SelectItem value="INTERVIEWER">Interviewer</SelectItem>
                    <SelectItem value="ADMIN">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 hover:bg-indigo-700 mt-4">
                {isSubmitting ? 'Creating...' : 'Create Account'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <GlassCard className="border-indigo-500/20">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400"><Shield className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Administrators</p>
              <h4 className="text-2xl font-bold font-headline">{allUsers.filter(u => u.role === 'ADMIN').length}</h4>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="border-emerald-500/20">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400"><UserCheck className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-muted-foreground">HR Executives</p>
              <h4 className="text-2xl font-bold font-headline">{allUsers.filter(u => u.role === 'HR').length}</h4>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="border-amber-500/20">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400"><Settings className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Interviewers</p>
              <h4 className="text-2xl font-bold font-headline">{allUsers.filter(u => u.role === 'INTERVIEWER').length}</h4>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard noHover className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted-foreground bg-white/5 border-b border-white/10 uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {allUsers.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar || `https://picsum.photos/seed/${u.id}/100/100`} alt={u.name} className="w-10 h-10 rounded-full border border-white/10" />
                      <div>
                        <p className="font-semibold text-white">{u.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" /> {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Select value={u.role} onValueChange={(val: UserRole) => handleChangeRole(u.id, val)}>
                      <SelectTrigger className="w-[140px] h-8 bg-transparent border-white/10 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0f111a] border-white/10 text-white">
                        <SelectItem value="HR">HR Executive</SelectItem>
                        <SelectItem value="INTERVIEWER">Interviewer</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={u.isActive !== false ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}>
                      {u.isActive !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-transparent border-white/10 hover:bg-white/5"
                      onClick={() => handleToggleStatus(u.id, u.isActive !== false)}
                    >
                      {u.isActive !== false ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
              {allUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    No users found. Create one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

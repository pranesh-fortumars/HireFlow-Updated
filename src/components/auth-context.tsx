
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { usersCollection } from '@/lib/firestore-schema';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    // Check local storage for mock session
    const storedUser = localStorage.getItem('hireflow_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password = '123456') => {
    try {
      setIsLoading(true);
      
      // Mock login logic for testing
      let role: UserRole = 'INTERVIEWER';
      let name = 'Interviewer';
      let id = '3';
      
      if (email.includes('hr')) {
        role = 'HR';
        name = 'HR Executive';
        id = 'hr-1';
      } else if (email.includes('admin')) {
        role = 'ADMIN';
        name = 'System Admin';
        id = 'admin-1';
      } else if (email.includes('john') || email.includes('interviewer')) {
        role = 'INTERVIEWER';
        name = 'John Smith';
        id = '1';
      }

      const mockUser: User = {
        id,
        name,
        email,
        role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
      };

      localStorage.setItem('hireflow_user', JSON.stringify(mockUser));
      setUser(mockUser);
      
      toast({ title: 'Success', description: `Logged in as ${name}` });
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error', error);
      toast({ variant: 'destructive', title: 'Login Failed', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('hireflow_user');
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  // Basic route protection
  useEffect(() => {
    if (!isLoading) {
      const publicPaths = ['/login'];
      if (!user && !publicPaths.includes(pathname)) {
        router.push('/login');
      }
    }
  }, [user, isLoading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// src/hooks/useAuth.ts
"use client";

import type { User, UserRole } from '@/types';
import { useRouter } from 'next/navigation';
import { atom, useAtom } from 'jotai';
import { useEffect } from 'react';

// Replace with actual Firebase auth state if integrating
const mockUser: User = {
  id: 'mock-user-id',
  email: 'psicologo@psiguard.com',
  name: 'Dr. Exemplo Silva',
  role: 'psychologist',
  avatarUrl: 'https://placehold.co/100x100.png',
};

const authAtom = atom<User | null>(null);
const loadingAtom = atom<boolean>(true);

export function useAuth() {
  const [user, setUser] = useAtom(authAtom);
  const [isLoading, setIsLoading] = useAtom(loadingAtom);
  const router = useRouter();

  useEffect(() => {
    // Simulate checking auth state
    const storedUser = localStorage.getItem('psiguard_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, [setUser, setIsLoading]);


  const login = async (email: string, pass: string, role: UserRole = 'psychologist') => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const loggedInUser: User = { ...mockUser, email, role, name: role === 'admin' ? 'Admin User' : role === 'secretary' ? 'Secretary User' : 'Psychologist User' };
    setUser(loggedInUser);
    localStorage.setItem('psiguard_user', JSON.stringify(loggedInUser));
    setIsLoading(false);
    router.push('/dashboard');
  };

  const logout = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser(null);
    localStorage.removeItem('psiguard_user');
    setIsLoading(false);
    router.push('/login');
  };

  const register = async (name: string, email: string, pass: string, role: UserRole) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    const newUser: User = { id: `mock-new-${Date.now()}`, email, name, role };
    setUser(newUser);
    localStorage.setItem('psiguard_user', JSON.stringify(newUser));
    setIsLoading(false);
    router.push('/dashboard');
  }

  return { user, isLoading, login, logout, register, isAuthenticated: !!user };
}

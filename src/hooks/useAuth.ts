
"use client";

import type { User, UserRole } from '@/types';
import { useRouter } from 'next/navigation';
import { atom, useAtom } from 'jotai';
import { useEffect } from 'react';

// Mock user for initial state and some defaults
const baseMockUser: Omit<User, 'role' | 'email' | 'name' | 'id'> = {
  avatarUrl: 'https://placehold.co/100x100.png',
  crp: '06/123456',
};

const authAtom = atom<User | null>(null);
const loadingAtom = atom<boolean>(true);

export function useAuth() {
  const [user, setUser] = useAtom(authAtom);
  const [isLoading, setIsLoading] = useAtom(loadingAtom);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('psiguard_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('psiguard_user');
      }
    }
    setIsLoading(false);
  }, [setUser, setIsLoading]);


  const login = async (email: string, pass: string, role: UserRole = 'psychologist') => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let userName = 'Usuário';
    let userSpecificData: Partial<User> = {};

    switch(role) {
      case 'admin':
        userName = 'Admin Geral';
        break;
      case 'psychologist':
        userName = 'Dr. Exemplo Silva';
        userSpecificData.crp = baseMockUser.crp;
        break;
      case 'secretary':
        userName = 'Secretária Exemplo';
        break;
      case 'scheduling':
        userName = 'Agendador(a) Psi';
        break;
    }

    const loggedInUser: User = { 
      ...baseMockUser,
      id: `mock-user-${role}-${Date.now().toString().slice(-4)}`, // More unique mock ID
      email, 
      role, 
      name: userName,
      ...userSpecificData,
    };
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

  // Register function might be needed if users can sign up themselves,
  // for now, login assigns roles for mock purposes.

  return { user, isLoading, login, logout, isAuthenticated: !!user };
}

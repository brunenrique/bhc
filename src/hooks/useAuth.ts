
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

// Definindo IDs fixos para psicólogos mockados principais
const MOCK_PSYCHOLOGIST_DR_SILVA_ID = 'mock-psy-dr-silva';
const MOCK_PSYCHOLOGIST_DRA_SOUZA_ID = 'mock-psy-dra-souza';
const MOCK_PSYCHOLOGIST_DR_CONVIDADO_ID = 'mock-psy-dr-convidado';


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
    let userId = `mock-user-${role}-${Date.now().toString().slice(-4)}`;
    let userSpecificData: Partial<User> = {};

    switch(role) {
      case 'admin':
        userName = 'Admin Geral';
        userId = 'mock-admin-geral';
        break;
      case 'psychologist':
        // Para simplificar, vamos alternar entre os psicólogos mockados se o email for genérico
        // Ou podemos definir emails específicos para cada um se necessário no futuro
        if (email.includes("silva")) {
            userName = 'Dr. Exemplo Silva';
            userId = MOCK_PSYCHOLOGIST_DR_SILVA_ID;
        } else if (email.includes("souza")) {
            userName = 'Dra. Modelo Souza';
            userId = MOCK_PSYCHOLOGIST_DRA_SOUZA_ID;
        } else if (email.includes("convidado")) {
            userName = 'Dr. Convidado';
            userId = MOCK_PSYCHOLOGIST_DR_CONVIDADO_ID;
        } else {
            // Default psychologist if no specific email match
            userName = 'Dr. Exemplo Silva';
            userId = MOCK_PSYCHOLOGIST_DR_SILVA_ID;
        }
        userSpecificData.crp = baseMockUser.crp;
        break;
      case 'secretary':
        userName = 'Secretária Exemplo';
        userId = 'mock-secretary-exemplo';
        break;
      case 'scheduling':
        userName = 'Agendador(a) Psi';
        userId = 'mock-scheduler-psi';
        break;
    }

    const loggedInUser: User = { 
      ...baseMockUser,
      id: userId,
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

  return { user, isLoading, login, logout, isAuthenticated: !!user };
}

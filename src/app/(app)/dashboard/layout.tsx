
"use client";

import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LayoutDashboard, BarChart3, TrendingUp, UserCircle, Activity, ShieldAlert } from 'lucide-react'; // Added Activity, ShieldAlert

interface TabConfig {
  value: string;
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

type UserRole = 'admin' | 'psychologist' | 'secretary';

const allTabs: TabConfig[] = [
  { value: 'overview', label: 'Visão Geral', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'psychologist', 'secretary'] },
  { value: 'my-panel', label: 'Meu Painel', href: '/dashboard/my-panel', icon: UserCircle, roles: ['psychologist', 'admin'] }, // Admin can see for config/overview
  { value: 'clinical-analysis', label: 'Análise Clínica', href: '/dashboard/clinical-analysis', icon: Activity, roles: ['admin', 'psychologist'] },
  { value: 'performance', label: 'Desempenho', href: '/dashboard/performance', icon: TrendingUp, roles: ['admin', 'secretary'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [authorized, setAuthorized] = useState(false);

  const activeTabValue = useMemo(() => {
    if (pathname === '/dashboard') return 'overview';
    const segments = pathname.split('/');
    const lastSegment = segments[segments.length - 1];
    const currentTab = allTabs.find(tab => tab.href.endsWith(lastSegment));
    return currentTab?.value || 'overview';
  }, [pathname]);

  const visibleTabs = useMemo(() => {
    if (!user) return [];
    return allTabs.filter(tab => tab.roles.includes(user.role));
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
      return;
    }

    if (user && visibleTabs.length > 0) {
      const currentPathTab = allTabs.find(tab => tab.href === pathname);
      
      if (currentPathTab && !currentPathTab.roles.includes(user.role)) {
        // User is on a path for which they don't have tab access
        if (user.role === 'psychologist') {
          router.replace('/dashboard/my-panel');
        } else if (user.role === 'secretary') {
          router.replace('/dashboard'); // Default to overview
        } else {
          router.replace('/dashboard'); // Admin default
        }
      } else if (!currentPathTab && pathname.startsWith('/dashboard/')) {
        // Path is a sub-path of dashboard but not a direct tab link (e.g. deeper route or 404 under dashboard)
        // For now, let it try to render, or redirect to a sensible default.
        // If it's a 404, Next.js will handle it.
        // If it's a valid deeper route, the specific page's layout/auth would handle it.
        setAuthorized(true); // Assume authorized if it's a sub-path not directly managed by tabs for now
      }
      else {
        setAuthorized(true);
      }
    }
  }, [user, authLoading, router, pathname, visibleTabs]);

  if (authLoading || !user || !authorized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if(visibleTabs.length === 0 && user){
     return (
      <div className="flex flex-col h-screen items-center justify-center p-6 text-center">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-headline font-semibold mb-2">Acesso Restrito</h1>
        <p className="text-muted-foreground">Sua função ({user.role}) não tem permissão para acessar nenhuma seção deste painel.</p>
        <p className="text-muted-foreground mt-1">Por favor, contate um administrador se você acredita que isso é um erro.</p>
         <Link href="/" passHref>
            <Button variant="outline" className="mt-6">Voltar para o Início do App</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
        <h1 className="text-2xl font-headline font-semibold">Painel de Controle</h1>
      </header>
      <Tabs value={activeTabValue} className="w-full px-4 sm:px-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 md:max-w-2xl">
          {visibleTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} asChild className="font-body">
              <Link href={tab.href} className="flex items-center gap-2">
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>
        {/* TabsContent is not used here directly as children are handled by Next.js routing */}
      </Tabs>
      <main className="flex-1 overflow-auto p-4 sm:px-6 sm:py-0 md:gap-8 mt-4">
        {children}
      </main>
    </div>
  );
}

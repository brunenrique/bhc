
"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/components/shared/Logo';
import { UserNav } from '@/components/layout/UserNav';
import { SidebarNav } from '@/components/layout/SidebarNav';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react'; 
import { useTheme } from 'next-themes'; 
import { FloatingChatButton } from '@/features/chat/components/FloatingChatButton';
import { SimulatedNotificationManager } from '@/features/notifications/components/SimulatedNotificationManager';
import { OfflineIndicator } from '@/components/layout/OfflineIndicator';

// A lógica de aplicar o tema customizado do localStorage foi movida para CustomThemeInitializer no RootLayout.
// const CUSTOM_THEME_LS_KEY = 'psiguard-custom-theme';
// const ALL_CUSTOM_THEME_CLASSES = ["theme-modern", "theme-light-gray", "theme-lilac"];


function ThemeToggle() {
  const { setTheme, theme } = useTheme(); 

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' || theme === 'system' ? 'dark' : 'light')}
      aria-label="Toggle theme"
      className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const child = React.Children.only(children);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // REMOVIDO: O useEffect para aplicar o tema customizado foi movido para CustomThemeInitializer.
  // useEffect(() => {
  //   const savedCustomTheme = localStorage.getItem(CUSTOM_THEME_LS_KEY);
  //   const htmlElement = document.documentElement;
  //   ALL_CUSTOM_THEME_CLASSES.forEach(cls => htmlElement.classList.remove(cls));
  //   if (savedCustomTheme && ALL_CUSTOM_THEME_CLASSES.includes(savedCustomTheme)) {
  //     htmlElement.classList.add(savedCustomTheme);
  //   } else {
  //     // Apply default if none saved, or rely on RootLayout's default
  //     // htmlElement.classList.add('theme-lilac'); // Example default
  //   }
  // }, []);


  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <SidebarProvider defaultOpen={true}>
      <OfflineIndicator />
      <Sidebar collapsible="icon" variant="sidebar" side="left">
        <SidebarHeader className="p-4 border-b border-sidebar-border">
          <Logo showText={true} className="data-[state=collapsed]:hidden group-data-[collapsible=icon]:hidden" />
           <Logo showText={false} size={28} className="hidden data-[state=collapsed]:block group-data-[collapsible=icon]:block" />
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-2 border-t border-sidebar-border flex items-center justify-center"> 
          <ThemeToggle /> 
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
          <div className="flex-1">
          </div>
          <UserNav />
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 pt-12 md:pt-6 lg:pt-8">
          {child}
        </main>
        <footer className="p-4 text-center text-xs text-muted-foreground border-t border-border">
          Desenvolvido por Bruno Henrique Cordeiro
        </footer>
      </SidebarInset>
      <FloatingChatButton />
      <SimulatedNotificationManager />
    </SidebarProvider>
  );
}

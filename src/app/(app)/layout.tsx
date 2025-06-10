
"use client";

import { useEffect } from 'react';
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


function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
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

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

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
          {children}
        </main>
      </SidebarInset>
      <FloatingChatButton />
      <SimulatedNotificationManager />
    </SidebarProvider>
  );
}

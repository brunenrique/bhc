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
import { Moon, Sun } from 'lucide-react'; // For theme toggle example
import { useTheme } from 'next-themes'; // Assuming next-themes is or will be installed

// Install next-themes: npm install next-themes
// And configure it in a ThemeProvider in the root layout or here if preferred.
// For this prototype, a simple toggle button is added to the sidebar footer.

function ThemeToggle() {
  // This is a conceptual ThemeToggle. 
  // For it to work, you need to install `next-themes` and wrap your RootLayout with <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  const { setTheme, theme } = useTheme ? useTheme() : { setTheme: () => {}, theme: 'light' }; // Mock if useTheme is not available

  if (!useTheme) {
    return null; // Don't render if next-themes is not set up
  }

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
    // You can render a global loading spinner here
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon" variant="sidebar" side="left">
        <SidebarHeader className="p-4 border-b border-sidebar-border">
          <Logo showText={true} className="data-[state=collapsed]:hidden group-data-[collapsible=icon]:hidden" />
           <Logo showText={false} size={28} className="hidden data-[state=collapsed]:block group-data-[collapsible=icon]:block" />
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-2 border-t border-sidebar-border items-center">
          {/* Example of Theme Toggle - requires next-themes setup */}
          {/* <ThemeToggle /> */} 
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
          <div className="flex-1 md:ml-auto md:w-auto md:flex-none">
            {/* Search or other header elements can go here */}
          </div>
          <UserNav />
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

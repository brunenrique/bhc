
"use client";

import React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar"; 
import AppHeader from "@/components/layout/header";
import SidebarNav from "@/components/layout/sidebar-nav";
import { Brain } from "lucide-react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import ChatFloatingButton from '@/components/chat/ChatFloatingButton';
import ChatWindow from '@/components/chat/ChatWindow';
import useAuth from '@/hooks/use-auth';
import { APP_ROUTES } from '@/lib/routes';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  useAuth();
  
  const [defaultOpen, setDefaultOpen] = React.useState(true);

  React.useEffect(() => {
    const sidebarState = document.cookie
      .split('; ')
      .find(row => row.startsWith('sidebar_state='))
      ?.split('=')[1];
    if (sidebarState) {
      setDefaultOpen(sidebarState === 'true');
    }
    if (window.innerWidth < 768) {
      setDefaultOpen(false);
    }
  }, []);



  return (
    <SidebarProvider defaultOpen={defaultOpen} open={defaultOpen} onOpenChange={(open) => setDefaultOpen(open)}>
      <Sidebar collapsible="icon" variant="sidebar" side="left">
        <SidebarHeader className="p-4">
          <Link href={APP_ROUTES.dashboard} className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <Brain className="w-8 h-8 text-primary" />
            <span className="font-headline text-2xl font-bold text-primary group-data-[collapsible=icon]:hidden">PsiGuard</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav currentPath={pathname} />
        </SidebarContent>
        <SidebarFooter className="p-2 group-data-[collapsible=icon]:hidden">
          {/* Footer content if any, e.g., version */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
        {/* Chat Components */}
        <ChatFloatingButton />
        <ChatWindow />
      </SidebarInset>
    </SidebarProvider>
  );
}

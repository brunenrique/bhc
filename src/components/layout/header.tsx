
"use client";

import React from "react";
import useAuth from "@/hooks/use-auth";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Bell, UserCircle, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "@/components/ui/theme-toggle";
// import { useTheme } from "next-themes"; // Assuming next-themes is installed for theme toggling

export default function AppHeader() {
  // const { setTheme, theme } = useTheme(); // Uncomment if using next-themes

  const { user } = useAuth();



  return (
    <header role="banner" className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1">
        {/* Optional: Global Search can go here */}
        {/* <form className="relative ml-auto flex-1 sm:flex-initial">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-background"
          />
        </form> */}
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Button variant="ghost" size="icon" asChild aria-label="Ver notificações">
          <Link href="/notifications">
            <Bell className="h-5 w-5" />
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Menu do usuário">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatarUrl || "https://placehold.co/100x100.png"} alt={user.displayName || "Usuário"} data-ai-hint="user avatar" />
                <AvatarFallback>
                  <UserCircle className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta{user.displayName ? ` - ${user.displayName}` : ''}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <span className="inline-flex items-center gap-2">
                  <UserCircle className="h-4 w-4" />
                  Perfil
                </span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <span className="inline-flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configurações
                </span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* Logout functionality commented out as auth is disabled */}
            <DropdownMenuItem disabled>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair (Desabilitado)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

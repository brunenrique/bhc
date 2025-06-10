
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  ClipboardList,
  FileText,
  Brain, 
  Settings,
  AreaChart, // Icon for Admin Metrics
  LucideIcon,
} from "lucide-react";
// import { useAuth } from '@/hooks/useAuth'; // For role-based navigation

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: string[]; 
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/scheduling", label: "Agendamentos", icon: CalendarDays },
  { href: "/patients", label: "Pacientes", icon: Users },
  { href: "/assessments", label: "Avaliações", icon: ClipboardList },
  { href: "/documents", label: "Documentos", icon: FileText },
  { href: "/ai-insights", label: "Insights IA", icon: Brain },
  { href: "/admin/metrics", label: "Métricas Admin", icon: AreaChart, roles: ['admin'] }, // Added admin metrics link
  { href: "/settings", label: "Configurações", icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();
  // const { user } = useAuth(); 

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        // Basic role check example (can be expanded or moved to a helper)
        // if (item.roles && (!user || !item.roles.includes(user.role))) {
        //   return null; 
        // }
        const isActive = pathname === item.href || 
                         (pathname.startsWith(item.href) && item.href !== "/" && item.href !== "/dashboard" && !navItems.some(other => other.href !== item.href && pathname.startsWith(other.href) && other.href.length > item.href.length));
        
        return (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} legacyBehavior passHref>
              <SidebarMenuButton
                as="a" // Use <a> tag for proper navigation with Link
                isActive={isActive}
                tooltip={item.label}
                className={cn(
                  "w-full justify-start",
                  // isActive && "bg-sidebar-accent text-sidebar-accent-foreground" // isActive is now handled by data-active attribute
                )}
              >
                <item.icon className="mr-2 h-5 w-5 flex-shrink-0" />
                <span className="truncate font-body">{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

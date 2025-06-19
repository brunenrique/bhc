
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
  Settings,
  MessageSquare,
  ListTodo, 
  BookOpenText,
  AreaChart, 
  ExternalLink,
  LucideIcon,
} from "lucide-react";
import { WithRole } from '@/components/auth/WithRole';
import type { UserRole } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: UserRole[]; 
  anchor?: boolean;
  external?: boolean;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ['admin', 'psychologist', 'secretary', 'scheduling'] },
  { href: "/scheduling", label: "Agendamentos", icon: CalendarDays, roles: ['admin', 'psychologist', 'secretary', 'scheduling'] },
  { href: "/scheduling#waiting-list", label: "Lista de Espera", icon: ListTodo, anchor: true, roles: ['admin', 'psychologist', 'secretary', 'scheduling'] },
  { href: "/patients", label: "Pacientes", icon: Users, roles: ['admin', 'psychologist', 'secretary'] }, 
  { href: "/assessments", label: "Avaliações", icon: ClipboardList, roles: ['admin', 'psychologist'] },
  { href: "/documents", label: "Documentos", icon: FileText, roles: ['admin', 'psychologist', 'secretary'] }, 
  { href: "/whatsapp-reminders", label: "Lembretes WhatsApp", icon: MessageSquare, roles: ['admin', 'psychologist', 'secretary'] },
  { 
    href: "https://intranet.santanadeparnaiba.sp.gov.br/SIGEM/login", 
    label: "Sigem", 
    icon: ExternalLink, 
    roles: ['admin', 'psychologist', 'secretary', 'scheduling'], 
    external: true 
  },
  { href: "/guide", label: "Guia de Uso", icon: BookOpenText, roles: ['admin', 'psychologist', 'secretary', 'scheduling'] },
  { href: "/settings", label: "Configurações", icon: Settings, roles: ['admin', 'psychologist', 'secretary', 'scheduling'] },
];

export function SidebarNav() {
  const pathname = usePathname();
  
  const checkIsActive = (itemHref: string, currentPath: string, isAnchor?: boolean) => {
    if (isAnchor) {
      const [basePath, anchor] = itemHref.split('#');
      if (currentPath !== basePath && !currentPath.startsWith(basePath + '/')) return false;
      if (typeof window !== 'undefined' && window.location.hash === `#${anchor}` && currentPath === basePath) return true;
      return currentPath === basePath && currentPath.endsWith(itemHref); 
    }
    if (itemHref.startsWith('http://') || itemHref.startsWith('https://')) {
      return false;
    }
    return currentPath === itemHref || (itemHref !== "/" && itemHref !== "/dashboard" && currentPath.startsWith(itemHref + '/')) || (itemHref === "/dashboard" && currentPath === "/dashboard");
  };

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        const isActive = checkIsActive(item.href, pathname, item.anchor);
        
        const scrollHandler = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
          const [basePath, anchorId] = item.href.split('#');
          if (item.anchor && pathname === basePath && anchorId) {
            e.preventDefault(); 
            const element = document.getElementById(anchorId);
            if (element) {
              element.scrollIntoView({ behavior: "smooth" });
            }
          }
        };
        
        const menuItemContent = (
            <SidebarMenuButton asChild isActive={isActive} tooltip={item.label} className={cn("w-full justify-start")}>
              <Link href={item.href} onClick={item.anchor ? scrollHandler : undefined} target={item.external ? "_blank" : undefined} rel={item.external ? "noopener noreferrer" : undefined}><tab.icon className="mr-2 h-5 w-5 flex-shrink-0" /><span className="truncate font-body">{item.label}</span></Link>
            </SidebarMenuButton>
        );

        if (item.roles) {
          return (
            <SidebarMenuItem key={item.href}>
              <WithRole role={item.roles}>
                {menuItemContent}
              </WithRole>
            </SidebarMenuItem>
          );
        }
        return <SidebarMenuItem key={item.href}>{menuItemContent}</SidebarMenuItem>;
      })}
      <SidebarMenuItem key="/admin/metrics">
        <WithRole role="admin">
          <SidebarMenuButton
            asChild
            isActive={checkIsActive("/admin/metrics", pathname)}
            tooltip="Métricas Admin"
            className={cn("w-full justify-start")}
          ><Link href="/admin/metrics"><AreaChart className="mr-2 h-5 w-5 flex-shrink-0" /><span className="truncate font-body">Métricas Admin</span></Link></SidebarMenuButton>
        </WithRole>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

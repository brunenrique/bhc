
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
  LucideIcon,
  BarChart3, // Restored from previous version or ensure it's the correct one.
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: string[]; 
  anchor?: boolean; 
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/scheduling", label: "Agendamentos", icon: CalendarDays },
  { href: "/scheduling#waiting-list", label: "Lista de Espera", icon: ListTodo, anchor: true },
  { href: "/patients", label: "Pacientes", icon: Users },
  { href: "/assessments", label: "Avaliações", icon: ClipboardList },
  { href: "/documents", label: "Documentos", icon: FileText },
  { href: "/whatsapp-reminders", label: "Lembretes WhatsApp", icon: MessageSquare },
  { href: "/admin/metrics", label: "Métricas Admin", icon: AreaChart },
  { href: "/guide", label: "Guia de Uso", icon: BookOpenText },
  { href: "/settings", label: "Configurações", icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();
  
  const checkIsActive = (itemHref: string, currentPath: string, isAnchor?: boolean) => {
    if (isAnchor) {
      const [basePath, anchor] = itemHref.split('#');
      if (currentPath !== basePath && !currentPath.startsWith(basePath + '/')) return false;
      // For client-side, accurately check hash
      if (typeof window !== 'undefined' && window.location.hash === `#${anchor}` && currentPath === basePath) return true;
      // Fallback for server or initial render if hash isn't immediately available
      return currentPath === basePath && currentPath.endsWith(itemHref); // Basic check
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
              // Updating URL hash manually after smooth scroll for better UX if needed,
              // but Link component might handle this or browser default behavior is often sufficient.
              // window.history.pushState(null, '', `#${anchorId}`);
            }
          }
          // If it's not a same-page anchor scroll, Link's default behavior will handle navigation.
        };
        
        return (
          <SidebarMenuItem key={item.href}> 
            <SidebarMenuButton
              asChild // SidebarMenuButton will render Slot, passing styles to Link
              isActive={isActive}
              tooltip={item.label}
              className={cn("w-full justify-start")}
            >
              <Link 
                href={item.href}
                onClick={item.anchor ? scrollHandler : undefined}
              >
                <item.icon className="mr-2 h-5 w-5 flex-shrink-0" />
                <span className="truncate font-body">{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

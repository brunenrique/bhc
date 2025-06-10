
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
  BarChart3, // Icon for Reports
  LucideIcon,
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
  { href: "/reports", label: "Relatórios", icon: BarChart3 }, // New Reports link
  { href: "/guide", label: "Guia de Uso", icon: BookOpenText },
  { href: "/settings", label: "Configurações", icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();
  
  const checkIsActive = (itemHref: string, currentPath: string, isAnchor?: boolean) => {
    if (isAnchor) {
      const [basePath, anchor] = itemHref.split('#');
      if (currentPath !== basePath && !currentPath.startsWith(basePath + '/')) return false; // Allow active if on a subpath of the anchor's base
      if (typeof window !== 'undefined' && window.location.hash === `#${anchor}` && currentPath === basePath) return true;
      return false;
    }
    // For non-anchor links, make it active if currentPath starts with itemHref
    // (unless itemHref is just "/", then exact match)
    return currentPath === itemHref || (itemHref !== "/" && currentPath.startsWith(itemHref + '/'));
  };

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        const isActive = checkIsActive(item.href, pathname, item.anchor);
        
        return (
          <SidebarMenuItem key={item.href}> 
            <Link href={item.href} passHref asChild>
              <SidebarMenuButton
                isActive={isActive}
                tooltip={item.label}
                className={cn("w-full justify-start")}
                onClick={
                  item.anchor && pathname === item.href.split('#')[0]
                    ? (e) => {
                        const anchorId = item.href.split('#')[1];
                        if (anchorId) {
                          const element = document.getElementById(anchorId);
                          if (element) {
                            e.preventDefault(); 
                            element.scrollIntoView({ behavior: "smooth" });
                            // Optionally update URL hash without full page reload
                            if (window.history.pushState) {
                                // window.history.pushState(null, '', `#${anchorId}`);
                            } else {
                                // window.location.hash = `#${anchorId}`;
                            }
                          }
                        }
                      }
                    : undefined
                }
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

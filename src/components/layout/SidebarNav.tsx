
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
  AreaChart, 
  MessageSquare,
  ListTodo, // Added icon for Waiting List
  LucideIcon,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: string[]; 
  anchor?: boolean; // To indicate if the link is an anchor link
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/scheduling", label: "Agendamentos", icon: CalendarDays },
  { href: "/scheduling#waiting-list", label: "Lista de Espera", icon: ListTodo, anchor: true },
  { href: "/patients", label: "Pacientes", icon: Users },
  { href: "/assessments", label: "Avaliações", icon: ClipboardList },
  { href: "/documents", label: "Documentos", icon: FileText },
  { href: "/whatsapp-reminders", label: "Lembretes WhatsApp", icon: MessageSquare },
  { href: "/admin/metrics", label: "Métricas Admin", icon: AreaChart, roles: ['admin'] }, 
  { href: "/settings", label: "Configurações", icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();
  
  const checkIsActive = (itemHref: string, currentPath: string, isAnchor?: boolean) => {
    if (isAnchor) {
      const [basePath, anchor] = itemHref.split('#');
      if (currentPath !== basePath) return false;
      // For client-side check after navigation or on initial load if hash is present
      return typeof window !== 'undefined' && window.location.hash === `#${anchor}`;
    }
    // Active if it's an exact match or if currentPath starts with itemHref (for nested routes),
    // but not for very generic paths like "/" or "/dashboard" if a more specific match exists.
    return currentPath === itemHref || 
           (currentPath.startsWith(itemHref + '/') && itemHref !== "/" );
  };


  return (
    <SidebarMenu>
      {navItems.map((item) => {
        const isActive = checkIsActive(item.href, pathname, item.anchor);
        
        return (
          <SidebarMenuItem key={item.href}> {/* Use href as key if labels might not be unique */}
            <Link href={item.href} passHref asChild>
              <SidebarMenuButton
                isActive={isActive}
                tooltip={item.label}
                className={cn("w-full justify-start")}
                onClick={
                  item.anchor
                    ? (e) => {
                        const [basePath, anchorId] = item.href.split('#');
                        if (pathname === basePath && anchorId) {
                          // If on the same page, prevent Link's default behavior if it reloads,
                          // and manually scroll.
                          const element = document.getElementById(anchorId);
                          if (element) {
                            e.preventDefault(); // Prevent default only if we successfully scroll
                            element.scrollIntoView({ behavior: "smooth" });
                             // Update URL hash manually after scrolling for better UX
                            if (window.history.pushState) {
                                window.history.pushState(null, '', `#${anchorId}`);
                            } else {
                                window.location.hash = `#${anchorId}`;
                            }
                          }
                        }
                        // If on a different page, Link component (asChild) will handle navigation,
                        // and the browser will jump to the anchor.
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


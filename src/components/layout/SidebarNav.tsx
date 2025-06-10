
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
      return currentPath === basePath && typeof window !== 'undefined' && window.location.hash === `#${anchor}`;
    }
    return currentPath === itemHref || 
           (currentPath.startsWith(itemHref) && itemHref !== "/" && itemHref !== "/dashboard" && !navItems.some(other => other.href !== itemHref && !other.anchor && currentPath.startsWith(other.href) && other.href.length > itemHref.length));
  };


  return (
    <SidebarMenu>
      {navItems.map((item) => {
        const isActive = checkIsActive(item.href, pathname, item.anchor);
        
        return (
          <SidebarMenuItem key={item.label}> {/* Using label as key for simplicity assuming labels are unique */}
            <Link href={item.href} passHref legacyBehavior={item.anchor}>
              <SidebarMenuButton
                asChild={item.anchor}
                isActive={isActive}
                tooltip={item.label}
                className={cn(
                  "w-full justify-start",
                )}
                onClick={item.anchor ? (e) => {
                  e.preventDefault();
                  const [path, anchorId] = item.href.split('#');
                  if (pathname !== path) {
                    // Navigate to base path first if not already there
                    // Then scroll in a useEffect on the target page or handle differently
                    // For now, simple navigation and rely on browser for anchor scroll if on same page
                    window.location.href = item.href; 
                  } else {
                    const element = document.getElementById(anchorId);
                    element?.scrollIntoView({ behavior: "smooth" });
                  }
                } : undefined}
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

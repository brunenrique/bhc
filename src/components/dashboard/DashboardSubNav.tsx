
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  Users2,
  Activity,
  CalendarClock,
  ClipboardCheck,
  ListFilter,
  Files,
  LucideIcon
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const dashboardNavItems: NavItem[] = [
  { href: "/dashboard", label: "Visão Geral", icon: LayoutGrid },
  { href: "/dashboard/users", label: "Usuários", icon: Users2 },
  { href: "/dashboard/patients-analytics", label: "Pacientes (Análise)", icon: Activity },
  { href: "/dashboard/sessions-analytics", label: "Sessões (Análise)", icon: CalendarClock },
  { href: "/dashboard/clinical-tracking", label: "Acomp. Clínico", icon: ClipboardCheck },
  { href: "/dashboard/waiting-list-analytics", label: "Lista Espera (Análise)", icon: ListFilter },
  { href: "/dashboard/documents-analytics", label: "Documentos (Análise)", icon: Files },
];

export function DashboardSubNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2">
      {dashboardNavItems.map((item) => (
        <Link key={item.href} href={item.href} passHref legacyBehavior>
          <Button
            variant={pathname === item.href ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start text-base h-10 px-3",
              pathname === item.href && "font-semibold"
            )}
            aria-current={pathname === item.href ? "page" : undefined}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.label}
          </Button>
        </Link>
      ))}
    </nav>
  );
}

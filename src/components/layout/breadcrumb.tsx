"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/shared/utils";
import { APP_ROUTES } from "@/lib/routes";

const segmentLabelMap: Record<string, string> = {
  dashboard: "Home",
  patients: "Pacientes",
  groups: "Grupos Terapêuticos",
  "waiting-list": "Lista de Espera",
  templates: "Modelos Inteligentes",
  tasks: "Tarefas",
  resources: "Recursos da Clínica",
  analytics: "Análises",
  schedule: "Agenda",
  tools: "Ferramentas Clínicas",
  settings: "Configurações",
  "user-approvals": "Aprovação de Usuários",
  "inventories-scales": "Inventários e Escalas",
  profile: "Perfil",
  new: "Novo",
  edit: "Editar",
};

function formatSegment(segment: string): string {
  return (
    segmentLabelMap[segment] ||
    segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase())
  );
}

export default function Breadcrumb({ className }: { className?: string }) {
  const pathname = usePathname();
  const segments = pathname
    .split("/")
    .filter(Boolean);

  const crumbs = segments.map((segment, idx) => {
    const href = "/" + segments.slice(0, idx + 1).join("/");
    const label = formatSegment(segment);
    return { href, label };
  });

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <ol className="flex items-center gap-1 text-muted-foreground">
        <li>
          <Link href={APP_ROUTES.dashboard} className="hover:underline">
            Home
          </Link>
        </li>
        {crumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.href}>
            <ChevronRight className="h-4 w-4" />
            {idx === crumbs.length - 1 ? (
              <span className="text-foreground font-medium">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:underline">
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}


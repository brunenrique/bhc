"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const segmentLabels: Record<string, string> = {
  dashboard: "Home",
  patients: "Pacientes",
  new: "Novo Paciente",
  groups: "Grupos Terapêuticos",
  "waiting-list": "Lista de Espera",
  templates: "Modelos Inteligentes",
  tasks: "Tarefas",
  resources: "Recursos",
  analytics: "Análises",
  tools: "Ferramentas",
  settings: "Configurações",
  notifications: "Notificações",
  chat: "Chat",
  admin: "Admin",
};

function getLabel(segment: string) {
  if (segmentLabels[segment]) return segmentLabels[segment];
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export default function Breadcrumb() {
  const pathname = usePathname();

  const segments = pathname
    .split("/")
    .filter((seg) => seg.length > 0 && seg !== "dashboard");

  const crumbs = segments.map((segment, index) => {
    const href = "/" + ["dashboard", ...segments.slice(0, index + 1)].join("/");
    return {
      href,
      label: getLabel(segment),
    };
  });

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <ol className="flex items-center gap-1">
        <li>
          <Link href="/dashboard" className="hover:underline">
            Home
          </Link>
        </li>
        {crumbs.map((crumb, idx) => (
          <li key={idx} className="flex items-center gap-1">
            <ChevronRight className="size-4" />
            {idx === crumbs.length - 1 ? (
              <span className="text-foreground">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:underline">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

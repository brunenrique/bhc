
// src/app/(app)/dashboard/my-panel/page.tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { UserCircle } from "lucide-react";

export default function MyPanelPage() {
  // This page would typically fetch data specific to the logged-in psychologist
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCircle className="mr-2 h-6 w-6 text-primary" />
            Meu Painel
          </CardTitle>
          <CardDescription>
            Sua visão personalizada com seus pacientes, próximas sessões e tarefas pendentes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Conteúdo do Meu Painel (específico para o psicólogo logado) será implementado aqui.</p>
          <ul className="list-disc pl-5 mt-4 space-y-1 text-sm text-muted-foreground">
            <li>Lista dos seus pacientes recentes/ativos.</li>
            <li>Suas próximas sessões agendadas.</li>
            <li>Avaliações pendentes para seus pacientes.</li>
            <li>Lembretes de tarefas clínicas.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

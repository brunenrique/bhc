
"use client";

import type { TherapeuticPlan, TherapeuticGoal } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListChecks, Target, RotateCcw, CheckCircle2, PauseCircle, XCircle } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PatientTherapeuticPlanProps {
  plan?: TherapeuticPlan;
}

const goalStatusMap: Record<TherapeuticGoal['status'], { label: string; icon: React.ElementType; color: string; badgeVariant: "default" | "secondary" | "outline" | "destructive" }> = {
  active: { label: "Ativo", icon: Target, color: "text-blue-600 border-blue-500 bg-blue-500/10", badgeVariant: "outline" },
  achieved: { label: "Alcançado", icon: CheckCircle2, color: "text-green-600 border-green-500 bg-green-500/10", badgeVariant: "secondary" },
  on_hold: { label: "Em Espera", icon: PauseCircle, color: "text-yellow-600 border-yellow-500 bg-yellow-500/10", badgeVariant: "outline" },
  discontinued: { label: "Descontinuado", icon: XCircle, color: "text-red-600 border-red-500 bg-red-500/10", badgeVariant: "destructive" },
};

export function PatientTherapeuticPlan({ plan }: PatientTherapeuticPlanProps) {
  if (!plan) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><ListChecks className="mr-2 h-6 w-6 text-primary" /> Plano Terapêutico Individual (PTI)</CardTitle>
          <CardDescription>Nenhum plano terapêutico definido para este paciente ainda.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="font-headline flex items-center"><ListChecks className="mr-2 h-6 w-6 text-primary" /> Plano Terapêutico Individual (PTI)</CardTitle>
        {plan.overallSummary && <CardDescription>{plan.overallSummary}</CardDescription>}
        <p className="text-xs text-muted-foreground pt-1">Última atualização: {format(parseISO(plan.lastUpdatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
      </CardHeader>
      <CardContent>
        <h4 className="font-semibold text-md mb-3 font-headline">Metas Terapêuticas:</h4>
        {plan.goals.length > 0 ? (
          <ul className="space-y-4">
            {plan.goals.map((goal) => {
              const statusInfo = goalStatusMap[goal.status] || goalStatusMap.active;
              return (
                <li key={goal.id} className="p-4 border rounded-lg bg-muted/20 shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-medium text-foreground">{goal.description}</p>
                    <Badge variant={statusInfo.badgeVariant} className={`capitalize whitespace-nowrap ${statusInfo.color}`}>
                      <statusInfo.icon className={`mr-1.5 h-3.5 w-3.5`} />
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p>Criada em: {format(parseISO(goal.createdAt), "dd/MM/yyyy", { locale: ptBR })}</p>
                    {goal.targetDate && <p>Meta para: {format(parseISO(goal.targetDate), "dd/MM/yyyy", { locale: ptBR })}</p>}
                    {goal.achievedAt && <p>Alcançada em: {format(parseISO(goal.achievedAt), "dd/MM/yyyy", { locale: ptBR })}</p>}
                  </div>
                  {goal.notes && <p className="text-sm italic text-muted-foreground mt-2 p-2 bg-background rounded-md border">{goal.notes}</p>}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-muted-foreground">Nenhuma meta definida neste plano.</p>
        )}
        {/* Placeholder for adding/editing goals - future feature */}
        {/* <Button variant="outline" size="sm" className="mt-4"><PlusCircle className="mr-2 h-4 w-4"/> Adicionar Meta</Button> */}
      </CardContent>
    </Card>
  );
}

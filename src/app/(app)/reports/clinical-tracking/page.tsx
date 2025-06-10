
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ClipboardCheck } from "lucide-react";

export default function ReportsClinicalTrackingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardCheck className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-headline font-semibold">Relatório de Acompanhamento Clínico</h1>
      </div>
      <p className="text-muted-foreground font-body">
        Visão geral de planos terapêuticos e progresso em avaliações.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Progresso</CardTitle>
          <CardDescription>Funcionalidade a ser implementada.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Gráficos sobre atingimento de metas de PTI, evolução em escalas, etc.</p>
        </CardContent>
      </Card>
    </div>
  );
}

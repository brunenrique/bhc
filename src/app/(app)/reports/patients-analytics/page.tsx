
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";

export default function ReportsPatientsAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Activity className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-headline font-semibold">Relatório de Pacientes</h1>
      </div>
      <p className="text-muted-foreground font-body">
        Insights e estatísticas sobre a base de pacientes.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Pacientes</CardTitle>
          <CardDescription>Funcionalidade a ser implementada.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Gráficos e dados sobre demografia, status, etc.</p>
        </CardContent>
      </Card>
    </div>
  );
}

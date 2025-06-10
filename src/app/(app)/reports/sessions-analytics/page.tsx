
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CalendarClock } from "lucide-react";

export default function ReportsSessionsAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CalendarClock className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-headline font-semibold">Relatório de Sessões</h1>
      </div>
      <p className="text-muted-foreground font-body">
        Métricas sobre agendamentos, comparecimento e tipos de sessão.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas de Sessões</CardTitle>
          <CardDescription>Funcionalidade a ser implementada.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Gráficos sobre volume de sessões, taxas de cancelamento, etc.</p>
        </CardContent>
      </Card>
    </div>
  );
}

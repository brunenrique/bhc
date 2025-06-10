
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ListFilter } from "lucide-react";

export default function ReportsWaitingListAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ListFilter className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-headline font-semibold">Relatório da Lista de Espera</h1>
      </div>
      <p className="text-muted-foreground font-body">
        Insights sobre a demanda reprimida e tempos de espera.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Métricas da Lista de Espera</CardTitle>
          <CardDescription>Funcionalidade a ser implementada.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Gráficos sobre tamanho da lista, tempo médio de espera, taxa de conversão, etc.</p>
        </CardContent>
      </Card>
    </div>
  );
}

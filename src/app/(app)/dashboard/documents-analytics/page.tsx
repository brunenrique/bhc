
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Files } from "lucide-react";

export default function DashboardDocumentsAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Files className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-headline font-semibold">Análise de Documentos</h1>
      </div>
      <p className="text-muted-foreground font-body">
        Estatísticas sobre o uso e tipos de documentos na plataforma.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Documentos</CardTitle>
          <CardDescription>Funcionalidade a ser implementada.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Gráficos sobre tipos de documentos mais comuns, status de assinatura, etc.</p>
        </CardContent>
      </Card>
    </div>
  );
}

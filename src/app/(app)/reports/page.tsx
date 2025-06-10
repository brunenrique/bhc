
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function ReportsOverviewPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-headline font-semibold">Visão Geral dos Relatórios</h1>
      </div>
      <p className="text-muted-foreground font-body">
        Selecione um tipo de relatório no menu lateral para visualizar os dados e análises.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Disponíveis</CardTitle>
          <CardDescription>Esta seção centraliza diversas análises sobre a plataforma e o acompanhamento clínico.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Utilize o menu à esquerda para navegar entre os diferentes painéis de relatórios.</p>
        </CardContent>
      </Card>
    </div>
  );
}

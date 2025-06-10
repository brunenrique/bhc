
// src/app/(app)/dashboard/performance/page.tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function PerformancePage() {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-6 w-6 text-primary" />
            Desempenho da Clínica
          </CardTitle>
          <CardDescription>
            Métricas e indicadores chave sobre o funcionamento da clínica.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Conteúdo da página de Desempenho será implementado aqui.</p>
           <ul className="list-disc pl-5 mt-4 space-y-1 text-sm text-muted-foreground">
            <li>Taxa de ocupação dos psicólogos.</li>
            <li>Número de sessões realizadas (por período, por psicólogo).</li>
            <li>Taxas de cancelamento e não comparecimento (no-show).</li>
            <li>Tempo médio de espera na Lista de Espera.</li>
            <li>Receita e faturamento (se aplicável).</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

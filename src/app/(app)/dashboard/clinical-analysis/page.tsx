
// src/app/(app)/dashboard/clinical-analysis/page.tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";

export default function ClinicalAnalysisPage() {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-6 w-6 text-primary" />
            Análise Clínica
          </CardTitle>
          <CardDescription>
            Insights e acompanhamento clínico detalhado dos pacientes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Conteúdo da página de Análise Clínica será implementado aqui.</p>
          <ul className="list-disc pl-5 mt-4 space-y-1 text-sm text-muted-foreground">
            <li>Visualização de progresso de Planos Terapêuticos Individuais (PTI).</li>
            <li>Análise de resultados de avaliações e escalas.</li>
            <li>Comparativos de evolução (com consentimento e anonimização, se aplicável).</li>
            <li>Identificação de pacientes que necessitam de atenção.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}


import { SessionInsightGeneratorClient } from "@/features/ai/components/SessionInsightGeneratorClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain } from "lucide-react";

export default function AiInsightsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-headline font-semibold">Insights de Sessão por IA (Demonstração)</h1>
      </div>
      <p className="text-muted-foreground font-body">
        Utilize a inteligência artificial para gerar insights automáticos a partir das notas de sessão. 
        Esta é uma funcionalidade demonstrativa e utiliza texto fictício para os insights.
      </p>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Gerador de Insights</CardTitle>
          <CardDescription>Cole as notas da sessão abaixo para obter insights gerados por IA.</CardDescription>
        </CardHeader>
        <CardContent>
          <SessionInsightGeneratorClient />
        </CardContent>
      </Card>
    </div>
  );
}

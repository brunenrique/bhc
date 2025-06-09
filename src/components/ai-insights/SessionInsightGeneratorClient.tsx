"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { generateSessionInsights, type GenerateSessionInsightsInput, type GenerateSessionInsightsOutput } from '@/ai/flows/generate-session-insights';
import { useToast } from '@/hooks/use-toast';

export function SessionInsightGeneratorClient() {
  const [sessionNotes, setSessionNotes] = useState('');
  const [insights, setInsights] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionNotes.trim()) {
      toast({
        title: "Notas Vazias",
        description: "Por favor, insira as notas da sessão.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setInsights(null);

    try {
      const input: GenerateSessionInsightsInput = { sessionNotes };
      const output: GenerateSessionInsightsOutput = await generateSessionInsights(input);
      setInsights(output.insights);
      toast({
        title: "Insights Gerados!",
        description: "Os insights da sessão foram gerados com sucesso.",
        className: "bg-primary text-primary-foreground",
      });
    } catch (error) {
      console.error("Error generating insights:", error);
      setInsights("Ocorreu um erro ao gerar os insights. Tente novamente.");
      toast({
        title: "Erro ao Gerar Insights",
        description: "Não foi possível conectar ao serviço de IA ou ocorreu um erro interno.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="sessionNotes" className="text-lg font-medium">Notas da Sessão</Label>
          <Textarea
            id="sessionNotes"
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder="Digite ou cole aqui as notas da sessão do paciente..."
            rows={10}
            className="mt-1 text-base leading-relaxed"
            disabled={isLoading}
          />
        </div>
        <Button type="submit" disabled={isLoading || !sessionNotes.trim()} className="w-full sm:w-auto">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          Gerar Insights
        </Button>
      </form>

      {insights && (
        <Card className="mt-6 bg-muted/30">
          <CardHeader>
            <CardTitle className="font-headline flex items-center text-xl">
              <Sparkles className="mr-2 h-5 w-5 text-accent" />
              Insights Gerados por IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm font-body leading-relaxed p-4 bg-background rounded-md border">
              {insights}
            </pre>
          </CardContent>
        </Card>
      )}
       {isLoading && !insights && (
         <div className="mt-6 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground mt-2">Gerando insights, por favor aguarde...</p>
         </div>
       )}
    </div>
  );
}


"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { generateSessionInsights, type GenerateSessionInsightsInput, type GenerateSessionInsightsOutput } from '@/ai/flows/generate-session-insights';
import { useToast } from '@/hooks/use-toast';

export default function AiInsightsPage() {
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
    } catch (error: any) {
      // console.error("Error generating insights:", error);
      setInsights("Ocorreu um erro ao gerar os insights. Tente novamente.");
      toast({
        title: "Erro ao Gerar Insights",
        description: error.message || "Não foi possível conectar ao serviço de IA ou ocorreu um erro interno.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Sparkles className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-headline font-semibold">Insights de Sessão por IA</h1>
      </div>
      <p className="text-muted-foreground font-body">
        Utilize a inteligência artificial para extrair resumos, temas e pontos chave das suas notas de sessão.
        Cole as notas abaixo e clique em "Gerar Insights".
      </p>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Gerador de Insights</CardTitle>
          <CardDescription>Insira as notas da sessão para análise.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="sessionNotes" className="text-base font-medium">Notas da Sessão</Label>
              <Textarea
                id="sessionNotes"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Ex: Paciente relatou sentir-se ansioso(a) em relação ao trabalho. Mencionou dificuldades de sono e concentração. Exploramos técnicas de respiração e identificamos pensamentos automáticos..."
                rows={10}
                className="mt-1 text-base leading-relaxed bg-input focus:bg-background transition-colors"
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
        </CardContent>
      </Card>


      {isLoading && !insights && (
         <div className="mt-6 text-center py-10">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground mt-3 text-lg">Gerando insights, por favor aguarde...</p>
            <p className="text-sm text-muted-foreground">Isso pode levar alguns segundos.</p>
         </div>
       )}
       
      {insights && !isLoading && (
        <Card className="mt-6 bg-muted/20 shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center text-xl">
              <Sparkles className="mr-2 h-5 w-5 text-accent" />
              Insights Gerados por IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="prose prose-sm dark:prose-invert max-w-none p-4 bg-background rounded-md border whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: insights.replace(/\n/g, '<br />') }} // Simple markdown to HTML for display
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

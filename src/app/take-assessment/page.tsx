
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock questions for the assessment
const mockQuestions = [
  { id: 'q1', text: 'Como você tem se sentido ultimamente em relação ao seu humor?', type: 'radio', options: ['Muito bem', 'Bem', 'Mais ou menos', 'Mal', 'Muito mal'] },
  { id: 'q2', text: 'Você tem tido dificuldades para dormir recentemente?', type: 'radio', options: ['Nenhuma', 'Alguma', 'Muita'] },
  { id: 'q3', text: 'Descreva em poucas palavras como tem sido sua semana.', type: 'textarea', placeholder: 'Ex: Estressante, produtiva, tranquila...' },
  { id: 'q4', text: 'Em uma escala de 1 a 5, qual seu nível de energia (1=baixo, 5=alto)?', type: 'radio', options: ['1', '2', '3', '4', '5'] },
];

interface Answers {
  [questionId: string]: string;
}

function TakeAssessmentForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const assessmentId = searchParams.get('assessmentId');
  const assessmentTitle = searchParams.get('title') || "Avaliação";

  const [answers, setAnswers] = useState<Answers>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // Ensure client-side rendering before accessing searchParams
  }, []);

  if (!isMounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!assessmentId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader>
            <CardTitle className="text-destructive font-headline">Erro: Avaliação Inválida</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">O link para esta avaliação parece estar incompleto ou inválido.</p>
            <Button onClick={() => router.push('/')} className="mt-6">Voltar para o Início</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call and result processing
    setTimeout(() => {
      const score = Math.floor(Math.random() * 80) + 20; // Mock score
      const level = score > 70 ? 'Elevado' : score > 40 ? 'Moderado' : 'Baixo';
      const summary = `O paciente demonstrou um nível ${level.toLowerCase()} nos indicadores avaliados, com destaque para as respostas sobre humor e energia.`;
      
      const detailedAnswers = mockQuestions.map(q => ({
        question: q.text,
        answer: answers[q.id] || "Não respondido",
      }));

      const mockResults = {
        score,
        level,
        summary,
        answeredAt: new Date().toISOString(),
        detailedAnswers
      };

      try {
        localStorage.setItem(`assessment_completed_${assessmentId}`, JSON.stringify(mockResults));
        toast({
          title: "Avaliação Enviada!",
          description: "Suas respostas foram registradas com sucesso. Você será redirecionado.",
          className: "bg-primary text-primary-foreground",
        });
        router.push('/assessments'); // Redirect back to the assessments list
      } catch (error) {
        console.error("Error saving to localStorage:", error);
        toast({
          title: "Erro ao Salvar",
          description: "Não foi possível salvar suas respostas. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-background to-secondary/30 p-4 md:p-8">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl text-primary">{assessmentTitle}</CardTitle>
          <CardDescription>Por favor, responda às perguntas abaixo com atenção.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {mockQuestions.map(q => (
              <div key={q.id} className="space-y-3 p-4 border rounded-lg bg-card shadow-sm">
                <Label htmlFor={q.id} className="text-base font-medium text-foreground block">{q.text}</Label>
                {q.type === 'radio' && q.options && (
                  <RadioGroup
                    id={q.id}
                    value={answers[q.id]}
                    onValueChange={(value) => handleAnswerChange(q.id, value)}
                    className="space-y-2"
                  >
                    {q.options.map(opt => (
                      <div key={opt} className="flex items-center space-x-2">
                        <RadioGroupItem value={opt} id={`${q.id}-${opt}`} />
                        <Label htmlFor={`${q.id}-${opt}`} className="font-normal">{opt}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
                {q.type === 'textarea' && (
                  <Textarea
                    id={q.id}
                    value={answers[q.id] || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    placeholder={q.placeholder}
                    rows={3}
                  />
                )}
              </div>
            ))}
            <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
              Enviar Respostas
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="mt-8 text-xs text-muted-foreground">
        PsiGuard &copy; {new Date().getFullYear()} - Ambiente de Avaliação Segura (Simulado)
      </p>
    </div>
  );
}

// Wrap with Suspense for useSearchParams
export default function TakeAssessmentPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <TakeAssessmentForm />
    </Suspense>
  );
}

    

"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Assessment } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";

interface ResultsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  assessment: Assessment | null;
}

export function ResultsDisplayDialog({ isOpen, onOpenChange, assessment }: ResultsDialogProps) {
  if (!assessment || !assessment.results) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center">
            <FileText className="mr-2 h-5 w-5 text-primary"/>Resultados da Avaliação: {assessment.title}
          </DialogTitle>
          <DialogDescription>
            Para o paciente: {assessment.patientName || "Não especificado"}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] py-4 pr-4">
          <div className="space-y-3 text-sm">
            <p><strong>Pontuação Geral:</strong> {assessment.results.score ?? 'N/A'}</p>
            <p><strong>Nível:</strong> {assessment.results.level ?? 'N/A'}</p>
            {assessment.results.summary && (
              <div className="space-y-1">
                <p className="font-medium">Resumo Interpretativo:</p>
                <p className="whitespace-pre-wrap p-2 bg-muted/50 border rounded-md">{assessment.results.summary}</p>
              </div>
            )}
            {assessment.results.detailedAnswers && assessment.results.detailedAnswers.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-1 mt-3">Respostas Detalhadas:</h4>
                <ul className="space-y-1.5 text-xs">
                  {(assessment.results.detailedAnswers as Array<{question: string, answer: string}>).map((item, index) => (
                     <li key={index} className="p-1.5 bg-muted/30 border-l-2 border-primary/50 rounded-r-sm">
                        <strong>{item.question}:</strong> {item.answer}
                     </li>
                  ))}
                </ul>
              </div>
            )}
             {assessment.results.answeredAt && (
                <p className="text-xs text-muted-foreground mt-3">Respondido em: {format(parseISO(assessment.results.answeredAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
             )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Need to import format and parseISO if not already available globally
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

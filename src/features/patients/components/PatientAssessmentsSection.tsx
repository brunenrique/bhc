
"use client";

import type { Assessment } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Download, CheckCircle, Send, AlertCircle, Eye } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { useState, useCallback } from "react";
import { ResultsDisplayDialog } from "./ResultsDisplayDialog"; // Assuming this will be created or reused

interface PatientAssessmentsSectionProps {
  patientName: string;
  assessments: Assessment[];
}

const statusMap: Record<Assessment["status"], { label: string; icon: React.ElementType; color: string; badgeVariant: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "Pendente", icon: AlertCircle, color: "text-yellow-600 border-yellow-500 bg-yellow-500/10", badgeVariant: "outline" },
  sent: { label: "Enviada", icon: Send, color: "text-blue-600 border-blue-500 bg-blue-500/10", badgeVariant: "outline" },
  completed: { label: "Concluída", icon: CheckCircle, color: "text-green-600 border-green-500 bg-green-500/10", badgeVariant: "secondary" },
};

export function PatientAssessmentsSection({ patientName, assessments }: PatientAssessmentsSectionProps) {
  const { toast } = useToast();
  const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false);
  const [selectedAssessmentForResults, setSelectedAssessmentForResults] = useState<Assessment | null>(null);

  const handleViewResults = useCallback((assessment: Assessment) => {
    if (assessment.status === 'completed' && assessment.results) {
      setSelectedAssessmentForResults(assessment);
      setIsResultsDialogOpen(true);
    } else {
      toast({
        title: "Resultados Indisponíveis",
        description: "Os resultados para esta avaliação ainda não estão disponíveis ou a avaliação não foi concluída.",
        variant: "default"
      });
    }
  }, [toast]);
  
  const handleDownloadResults = (assessmentTitle: string) => {
    // Mock download action
    toast({
      title: "Download Simulado",
      description: `Resultados de "${assessmentTitle}" seriam preparados para download.`,
    });
  };

  if (!assessments || assessments.length === 0) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><FileText className="mr-2 h-6 w-6 text-primary" /> Escalas e Questionários</CardTitle>
          <CardDescription>Nenhuma escala ou questionário associado a {patientName} ainda.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><FileText className="mr-2 h-6 w-6 text-primary" /> Escalas e Questionários</CardTitle>
          <CardDescription>Histórico de escalas e questionários psicométricos para {patientName}.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-3"> {/* Adjust height as needed */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Instrumento</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessments.map((assessment) => {
                  const statusInfo = statusMap[assessment.status] || statusMap.pending;
                  return (
                    <TableRow key={assessment.id}>
                      <TableCell className="font-medium">{assessment.title}</TableCell>
                      <TableCell>{format(parseISO(assessment.createdAt), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.badgeVariant} className={`capitalize ${statusInfo.color}`}>
                          <statusInfo.icon className={`mr-1.5 h-3.5 w-3.5`} />
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewResults(assessment)}
                          disabled={assessment.status !== 'completed' || !assessment.results}
                        >
                          <Eye className="mr-1 h-4 w-4" /> Ver
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDownloadResults(assessment.title)}
                          disabled={assessment.status !== 'completed'}
                        >
                          <Download className="mr-1 h-4 w-4" /> Baixar
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
      <ResultsDisplayDialog 
        isOpen={isResultsDialogOpen}
        onOpenChange={setIsResultsDialogOpen}
        assessment={selectedAssessmentForResults}
      />
    </>
  );
}

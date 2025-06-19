
"use client";
import React, { useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Assessment } from "@/types";
import { MoreHorizontal, Edit, Trash2, ExternalLink, CheckCircle, Send, AlertCircle, FileText, Eye } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from "next/link";

interface AssessmentResultsTableProps {
  assessments: Assessment[];
  onEdit: (assessment: Assessment) => void;
  onDelete: (assessmentId: string) => void;
}

const statusMap: Record<Assessment["status"], { label: string; icon: React.ElementType; color: string; badgeVariant: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "Pendente", icon: AlertCircle, color: "text-yellow-600 border-yellow-500 bg-yellow-500/10", badgeVariant: "outline" },
  sent: { label: "Enviada", icon: Send, color: "text-blue-600 border-blue-500 bg-blue-500/10", badgeVariant: "outline" },
  completed: { label: "Concluída", icon: CheckCircle, color: "text-green-600 border-green-500 bg-green-500/10", badgeVariant: "secondary" },
};

interface ResultsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  assessment: Assessment | null;
}

function ResultsDisplayDialog({ isOpen, onOpenChange, assessment }: ResultsDialogProps) {
  if (!assessment || !assessment.results) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Resultados da Avaliação: {assessment.title}</DialogTitle>
          <DialogDescription>
            Resultados para o paciente: {assessment.patientName || "Não especificado"}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-3">
          <p className="text-sm"><strong>Pontuação Geral:</strong> {assessment.results.score ?? 'N/A'}</p>
          <p className="text-sm"><strong>Nível:</strong> {assessment.results.level ?? 'N/A'}</p>
          {assessment.results.summary && <p className="text-sm"><strong>Resumo:</strong> {assessment.results.summary}</p>}
          {assessment.results.detailedAnswers && (
            <div>
              <h4 className="font-medium text-sm mb-1">Respostas Detalhadas:</h4>
              <ul className="list-disc list-inside text-xs space-y-1">
                {(assessment.results.detailedAnswers as Array<{question: string, answer: string}>).map((item, index) => (
                   <li key={index}><strong>{item.question}:</strong> {item.answer}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const AssessmentResultsTable = React.memo(function AssessmentResultsTable({ assessments, onEdit, onDelete }: AssessmentResultsTableProps) {
  const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false);
  const [selectedAssessmentForResults, setSelectedAssessmentForResults] = useState<Assessment | null>(null);

  const handleViewResults = useCallback((assessment: Assessment) => {
    setSelectedAssessmentForResults(assessment);
    setIsResultsDialogOpen(true);
  }, []);
  
  if (assessments.length === 0) {
    return <p className="text-muted-foreground text-center py-8">Nenhuma avaliação encontrada.</p>;
  }
  
  return (
    <>
      <div className="rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px] hidden sm:table-cell"><FileText className="h-4 w-4 text-muted-foreground" /></TableHead>
              <TableHead>Título da Avaliação</TableHead>
              <TableHead className="hidden md:table-cell">Paciente</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Data Criação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assessments.map((assessment) => {
              const statusInfo = statusMap[assessment.status] || statusMap.pending;
              return (
                <TableRow key={assessment.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="hidden sm:table-cell">
                     <statusInfo.icon className={`h-5 w-5 ${statusInfo.color.split(' ')[0]}`} />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{assessment.title}</div>
                    <div className="text-xs text-muted-foreground md:hidden">{assessment.patientName || 'N/A'}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{assessment.patientName || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={statusInfo.badgeVariant} className={`capitalize ${statusInfo.color}`}>
                      <statusInfo.icon className={`mr-1.5 h-3.5 w-3.5`} />
                      {statusInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {format(parseISO(assessment.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Abrir menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                         {assessment.formLink && assessment.formLink !== '#' && (
                          <DropdownMenuItem asChild><Link href={assessment.formLink} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4" /> Abrir Link do Formulário</Link></DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => onEdit(assessment)}>
                          <Edit className="mr-2 h-4 w-4" /> Editar Detalhes
                        </DropdownMenuItem>
                        {assessment.status === 'completed' && assessment.results && (
                           <DropdownMenuItem onClick={() => handleViewResults(assessment)}>
                             <Eye className="mr-2 h-4 w-4" /> Ver Resultados
                           </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onDelete(assessment.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <ResultsDisplayDialog 
        isOpen={isResultsDialogOpen}
        onOpenChange={setIsResultsDialogOpen}
        assessment={selectedAssessmentForResults}
      />
    </>
  );
});
AssessmentResultsTable.displayName = "AssessmentResultsTable";

    
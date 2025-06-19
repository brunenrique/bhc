"use client";

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
import { MoreHorizontal, Edit, Trash2, ExternalLink, CheckCircle, Send, AlertCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AssessmentResultsTableProps {
  assessments: Assessment[];
  onEdit: (assessment: Assessment) => void;
  onDelete: (assessmentId: string) => void;
}

const statusMap: Record<Assessment["status"], { label: string; icon: React.ElementType; color: string }> = {
  pending: { label: "Pendente", icon: AlertCircle, color: "text-yellow-500" },
  sent: { label: "Enviada", icon: Send, color: "text-blue-500" },
  completed: { label: "Concluída", icon: CheckCircle, color: "text-green-500" },
};


export function AssessmentResultsTable({ assessments, onEdit, onDelete }: AssessmentResultsTableProps) {
  if (assessments.length === 0) {
    return <p className="text-muted-foreground text-center py-8">Nenhuma avaliação encontrada.</p>;
  }
  
  return (
    <div className="rounded-lg border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título da Avaliação</TableHead>
            <TableHead className="hidden md:table-cell">Paciente</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden lg:table-cell">Data Criação</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assessments.map((assessment) => {
            const statusInfo = statusMap[assessment.status];
            return (
              <TableRow key={assessment.id} className="hover:bg-muted/50 transition-colors">
                <TableCell>
                  <div className="font-medium">{assessment.title}</div>
                  <div className="text-xs text-muted-foreground md:hidden">{assessment.patientName || 'N/A'}</div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{assessment.patientName || 'N/A'}</TableCell>
                <TableCell>
                  <Badge variant={assessment.status === 'completed' ? 'secondary' : assessment.status === 'sent' ? 'default' : 'outline'} className={`capitalize border-${statusInfo.color.replace('text-','')} ${statusInfo.color} bg-${statusInfo.color.replace('text-','')}/10`}>
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
                       {assessment.formLink && (
                        <DropdownMenuItem asChild><a href={assessment.formLink} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4" /> Ver Link</a></DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => onEdit(assessment)}>
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      {assessment.status === 'completed' && assessment.results && (
                         <DropdownMenuItem onClick={() => alert(JSON.stringify(assessment.results, null, 2))}>
                           <CheckCircle className="mr-2 h-4 w-4" /> Ver Resultados
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
  );
}


"use client";

import React from 'react'; 
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, FileText, Send, BarChart2, User } from "lucide-react";
import Link from "next/link";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';


type AssessmentStatus = "Pending" | "Sent" | "Completed" | "Overdue";

interface Assessment {
  id: string;
  name: string;
  description?: string;
  patientName?: string; 
  dateSent: string;
  status: AssessmentStatus;
  score?: string;
}

interface AssessmentCardProps {
  assessment: Assessment;
  showPatientInfo?: boolean; 
}

const statusLabels: Record<AssessmentStatus, string> = {
  Pending: "Pendente",
  Sent: "Enviada",
  Completed: "Concluída",
  Overdue: "Atrasada"
};


function AssessmentCardComponent({ assessment, showPatientInfo = false }: AssessmentCardProps) {
  if (!assessment) {
    return (
      <div className="p-4 text-sm text-muted-foreground">Dados indisponíveis</div>
    );
  }

  const getStatusIcon = () => {
    switch (assessment.status) {
      case "Completed": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "Pending": return <Clock className="h-4 w-4 text-yellow-500" />;
      case "Sent": return <Send className="h-4 w-4 text-blue-500" />;
      case "Overdue": return <Clock className="h-4 w-4 text-red-500" />; 
      default: return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadgeVariant = (): "default" | "secondary" | "destructive" | "outline" => {
     switch (assessment.status) {
      case "Completed": return "default"; 
      case "Pending": return "secondary";
      case "Sent": return "outline"; 
      case "Overdue": return "destructive";
      default: return "outline";
    }
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="font-headline text-lg">{assessment.name}</CardTitle>
            <Badge variant={getStatusBadgeVariant()} className="capitalize">
                {getStatusIcon()}
                <span className="ml-1.5">{statusLabels[assessment.status]}</span>
            </Badge>
        </div>
        {assessment.description && <CardDescription className="text-xs mt-1">{assessment.description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-grow">
        {showPatientInfo && assessment.patientName && (
          <p className="text-sm text-muted-foreground mb-2 flex items-center"><User className="mr-1.5 h-4 w-4" /> {assessment.patientName}</p>
        )}
        <p className="text-sm text-muted-foreground">Enviada: {format(new Date(assessment.dateSent), "P", { locale: ptBR })}</p>
        {assessment.status === "Completed" && assessment.score && (
          <p className="text-sm text-muted-foreground font-medium mt-1">Pontuação: {assessment.score}</p>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex w-full justify-end gap-2">
          {assessment.status === "Completed" && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/inventories-scales/${assessment.id}/results`}>
                <span>
                  <BarChart2 className="mr-2 h-4 w-4" /> Ver Resultados
                </span>
              </Link>
            </Button>
          )}
          {(assessment.status === "Pending" || assessment.status === "Sent") && (
             <Button variant="outline" size="sm">
                <Send className="mr-2 h-4 w-4" /> Reenviar Link
            </Button>
          )}
          <Button variant="default" size="sm" asChild className="bg-primary/90 hover:bg-primary text-primary-foreground">
             <Link href={`/inventories-scales/${assessment.id}/details`}>
                Ver Detalhes
             </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

const AssessmentCard = React.memo(AssessmentCardComponent);
export default AssessmentCard;

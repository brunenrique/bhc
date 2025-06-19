
"use client";

import React from "react"; // Import React
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Edit3, Mail, CalendarDays, Trash2 } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";


interface Patient {
  id: string;
  name: string;
  email: string;
  lastSession?: string | null;
  nextAppointment?: string | null;
  avatarUrl?: string;
  dataAiHint?: string;
}

interface PatientListItemProps {
  patient: Patient;
}

function PatientListItemComponent({ patient }: PatientListItemProps) {
  const { toast } = useToast();

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0][0]?.toUpperCase() || '';
    return (names[0][0] + (names[names.length - 1][0] || '')).toUpperCase();
  };

  const formattedNextAppointment = patient.nextAppointment 
    ? format(new Date(patient.nextAppointment), "P", { locale: ptBR }) 
    : null;

  const handleDeletePatient = () => {
    // console.log(`Excluindo paciente ${patient.id} da lista... (Simulado)`); // Debug log removed
    toast({
      title: "Paciente Excluído (Simulado)",
      description: `${patient.name} foi excluído(a) permanentemente.`,
      variant: "destructive",
    });
    // Lógica para remover da lista (ou re-fetch) após exclusão real
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Avatar className="h-12 w-12">
              <AvatarImage src={patient.avatarUrl} alt={patient.name} data-ai-hint={patient.dataAiHint} />
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {getInitials(patient.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <Link href={`/patients/${patient.id}`} className="block">
                <h3 className="text-lg font-semibold truncate hover:text-accent">{patient.name}</h3>
              </Link>
              <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                <Mail className="h-3 w-3" /> {patient.email}
              </p>
              {formattedNextAppointment && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" /> Próx.: {formattedNextAppointment}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="outline" size="sm" asChild className="h-8 px-2 sm:px-3" aria-label={`Editar perfil de ${patient.name}`}>
              <Link href={`/patients/${patient.id}/edit`}>
                <span className="inline-flex items-center gap-2">
                  <Edit3 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Editar</span>
                  <span className="sr-only sm:hidden">Editar perfil de {patient.name}</span>
                </span>
              </Link>
            </Button>
            <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-sm font-medium text-destructive hover:text-destructive hover:bg-destructive/10 h-8"
                  aria-label={`Excluir paciente ${patient.name}`}
                >
                  <span className="inline-flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </span>
                </Button>
            </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir Paciente Permanentemente?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Todos os dados associados a {patient.name} serão permanentemente removidos. 
                    Tem certeza que deseja excluir este paciente?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeletePatient} className="bg-destructive hover:bg-destructive/90">
                    Excluir Permanentemente
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              variant="ghost"
              asChild
              className="flex items-center gap-2 text-sm font-medium h-8"
              aria-label={`Ver detalhes de ${patient.name}`}
            >
              <Link href={`/patients/${patient.id}`} className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2">
                  <ChevronRight className="h-5 w-5" />
                  Abrir
                </span>
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const PatientListItem = React.memo(PatientListItemComponent);
export default PatientListItem;


"use client";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Phone, CalendarDays, Edit, FileText, Brain, CheckCircle, Clock, Archive, MessageSquare, Trash2, Users as UsersIconLucide, Home as HomeIconLucide } from "lucide-react"; 
import Link from "next/link";
import PatientTimeline from "@/components/patients/patient-timeline";
import SessionNoteCard from "@/components/patients/session-note-card";
import ResourceCard from "@/components/resources/resource-card";
import AssessmentCard from "@/components/assessments/assessment-card";
import { useRouter } from "next/navigation";
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
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';


const mockPatient = {
  id: "1",
  name: "Alice Wonderland",
  email: "alice@example.com",
  phone: "555-1234",
  dob: "1990-05-15",
  avatarUrl: "https://placehold.co/150x150/D0BFFF/4F3A76?text=AW",
  dataAiHint: "female avatar",
  nextAppointment: "2024-07-22T10:00:00Z",
  lastSession: "2024-07-15",
  assignedPsychologist: "Dr. Smith",
  address: "Rua Principal, 123, Cidade Alegre, BR",
};

const mockSessionNotes = [
  { id: "sn1", date: "2024-07-15", summary: "Discutimos mecanismos de enfrentamento para ansiedade...", keywords: ["ansiedade", "enfrentamento"], themes: ["gerenciamento de estresse"] },
  { id: "sn2", date: "2024-07-08", summary: "Exploramos dinâmicas familiares e padrões de comunicação.", keywords: ["família", "comunicação"], themes: ["relacionamentos interpessoais"] },
];

const mockAssessments = [
  { id: "asm1", name: "Inventário de Depressão de Beck", dateSent: "2024-07-01", status: "Completed" as const, score: "15/63" },
  { id: "asm2", name: "Escala de Ansiedade GAD-7", dateSent: "2024-07-10", status: "Pending" as const },
];

const mockResources = [
 { id: "res1", name: "Guia de Mindfulness.pdf", type: "pdf" as const, size: "1.2MB", sharedDate: "2024-07-02", dataAiHint: "documento mindfulness" },
 { id: "res2", name: "Dicas de Higiene do Sono.pdf", type: "pdf" as const, size: "800KB", sharedDate: "2024-06-20", dataAiHint: "documento sono" },
];


export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const patient = mockPatient;
  const { toast } = useToast();
  const router = useRouter();

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0][0]?.toUpperCase() || '';
    return (names[0][0] + (names[names.length - 1][0] || '')).toUpperCase();
  };

  const handleArchivePatient = () => {
    console.log(`Arquivando paciente ${patient.id}... (Simulado)`);
    toast({
      title: "Paciente Arquivado (Simulado)",
      description: `${patient.name} foi marcado(a) como arquivado(a).`,
    });
  };
  
  const handleDeletePatient = () => {
    console.log(`Excluindo paciente ${patient.id}... (Simulado)`);
    toast({
      title: "Paciente Excluído (Simulado)",
      description: `${patient.name} foi excluído(a) permanentemente.`,
      variant: "destructive",
    });
    router.push("/patients");
  };

  const formattedDob = patient.dob ? format(new Date(patient.dob), "P", { locale: ptBR }) : "N/A";
  const formattedNextAppointment = patient.nextAppointment 
    ? format(new Date(patient.nextAppointment), "P 'às' HH:mm", { locale: ptBR }) 
    : "Não agendado";
  const formattedLastSession = patient.lastSession 
    ? format(new Date(patient.lastSession), "P", { locale: ptBR }) 
    : "N/A";


  return (
    <div className="space-y-6">
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="h-24 w-24 border-4 border-background shadow-md">
              <AvatarImage src={patient.avatarUrl} alt={patient.name} data-ai-hint={patient.dataAiHint} />
              <AvatarFallback className="text-3xl bg-primary text-primary-foreground font-semibold">
                {getInitials(patient.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-headline font-bold">{patient.name}</h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                <span className="flex items-center"><Mail className="mr-1.5 h-4 w-4" /> {patient.email}</span>
                <span className="flex items-center"><Phone className="mr-1.5 h-4 w-4" /> {patient.phone}</span>
                <span className="flex items-center"><CalendarDays className="mr-1.5 h-4 w-4" /> Nasc: {formattedDob}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 self-start sm:self-center">
                <Button variant="outline" asChild>
                  <Link href={`/patients/${patient.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" /> Editar Perfil
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="border-yellow-500 text-yellow-700 hover:bg-yellow-50 hover:text-yellow-700">
                      <Archive className="mr-2 h-4 w-4" /> Arquivar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Arquivar Paciente?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Arquivar este paciente o removerá das listas ativas, mas preservará seus dados. 
                        Esta ação geralmente pode ser desfeita. Tem certeza que deseja arquivar {patient.name}?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleArchivePatient} className="bg-yellow-500 hover:bg-yellow-600 text-white">
                        Arquivar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="bg-destructive/90 hover:bg-destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Excluir
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir Paciente Permanentemente?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Todos os dados associados a {patient.name} (prontuários, agendamentos, avaliações) serão permanentemente removidos. 
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
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="session_notes">Anotações</TabsTrigger>
          <TabsTrigger value="assessments">Avaliações</TabsTrigger>
          <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
          <TabsTrigger value="resources">Recursos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Visão Geral do Paciente</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <InfoItem icon={<CalendarDays className="text-accent" />} label="Próximo Agendamento" value={formattedNextAppointment} />
              <InfoItem icon={<Clock className="text-accent" />} label="Última Sessão" value={formattedLastSession} />
              <InfoItem icon={<UsersIconLucide className="text-accent h-5 w-5" />} label="Psicólogo(a) Responsável" value={patient.assignedPsychologist} />
              <InfoItem icon={<HomeIconLucide className="text-accent h-5 w-5" />} label="Endereço" value={patient.address} className="md:col-span-2"/>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="session_notes" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="font-headline">Anotações de Sessão</CardTitle>
                <CardDescription>Registro cronológico das sessões de terapia.</CardDescription>
              </div>
              <Button variant="outline" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <FileText className="mr-2 h-4 w-4" /> Nova Anotação
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockSessionNotes.map(note => (
                <SessionNoteCard key={note.id} note={note} />
              ))}
              {mockSessionNotes.length === 0 && <p className="text-muted-foreground">Nenhuma anotação de sessão registrada ainda.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="font-headline">Avaliações</CardTitle>
                <CardDescription>Acompanhe e gerencie as avaliações do paciente.</CardDescription>
              </div>
               <Button variant="outline" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <CheckCircle className="mr-2 h-4 w-4" /> Atribuir Avaliação
               </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockAssessments.map(assessment => (
                <AssessmentCard key={assessment.id} assessment={assessment} />
              ))}
              {mockAssessments.length === 0 && <p className="text-muted-foreground">Nenhuma avaliação atribuída ou concluída.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Linha do Tempo do Paciente</CardTitle>
              <CardDescription>Eventos chave e interações relacionadas ao paciente.</CardDescription>
            </CardHeader>
            <CardContent>
              <PatientTimeline patientId={params.id} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="resources" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
             <div>
                <CardTitle className="font-headline">Recursos Compartilhados</CardTitle>
                <CardDescription>Documentos e guias compartilhados com o paciente.</CardDescription>
              </div>
               <Button variant="outline" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Archive className="mr-2 h-4 w-4" /> Compartilhar Recurso
               </Button>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockResources.map(resource => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
              {mockResources.length === 0 && <p className="text-muted-foreground md:col-span-full">Nenhum recurso compartilhado ainda.</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
  className?: string;
}

function InfoItem({ icon, label, value, className }: InfoItemProps) {
  return (
    <div className={`flex items-start gap-3 p-3 bg-secondary/30 rounded-md ${className}`}>
      <span className="text-muted-foreground mt-1">{icon}</span>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-foreground">{value || "N/A"}</p>
      </div>
    </div>
  );
}
    

    
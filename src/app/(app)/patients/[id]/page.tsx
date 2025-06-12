
"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Mail, Phone, CalendarDays, Edit, FileText, Brain, CheckCircle, Clock, MessageSquare, Trash2, Users as UsersIconLucide, Home as HomeIconLucide, Share2, UploadCloud, Calendar as CalendarIconShad, Lightbulb, Tag, BarChart3 as BarChart3Icon, ShieldAlert as ShieldAlertIcon, CheckCircle as CheckCircleIcon, TrendingUp, BookOpen, Activity, Users2, ClipboardList, Target, ListChecks, PlusCircle, Archive } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PatientTimeline from "@/components/patients/patient-timeline";
import SessionNoteCard from "@/components/patients/session-note-card";
import ResourceCard from "@/components/resources/resource-card";
import AssessmentCard from "@/components/assessments/assessment-card";
import InfoItem from "@/components/patients/info-item";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import dynamic from "next/dynamic";
const Calendar = dynamic(() => import("@/components/ui/calendar").then(m => m.Calendar), { ssr: false });
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { generateSessionInsights, type GenerateSessionInsightsOutput } from '@/ai/flows/generate-session-insights';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { gerarProntuario } from "@/services/prontuarioService";

const PatientProgressChart = dynamic(() => import("@/components/patients/patient-progress-chart"), {
  loading: () => (
    <div className="h-[350px] w-full flex flex-col items-center justify-center bg-muted/30 rounded-lg">
      <Skeleton className="h-4 w-1/4 mb-2" />
      <Skeleton className="h-3/4 w-full" />
    </div>
  ),
  ssr: false,
});


const mockGlobalClinicResources = [
 { id: "res_global_1", name: "Guia Completo de Mindfulness.pdf", type: "pdf" as const, size: "2.1MB", uploadDate: "2024-07-01", dataAiHint:"documento mindfulness"},
 { id: "res_global_2", name: "Estratégias para Melhorar o Sono.pdf", type: "pdf" as const, size: "1.5MB", uploadDate: "2024-06-15", dataAiHint:"documento sono"},
 { id: "res_global_3", name: "Cartilha sobre Ansiedade Social.docx", type: "docx" as const, size: "350KB", uploadDate: "2024-05-20", dataAiHint:"documento cartilha"},
 { id: "res_global_4", name: "Infográfico: Ciclo da Depressão.png", type: "image" as const, size: "3.0MB", uploadDate: "2024-07-12", dataAiHint:"imagem infográfico"},
];


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
  assignedPsychologist: "Dr. Silva",
  address: "Rua Principal, 123, Cidade Alegre, BR",
};

const initialSessionNotes = [
  { id: "sn1", date: "2024-07-15", summary: "Sessão focada em mecanismos de enfrentamento para ansiedade. Paciente relata melhora na qualidade do sono após aplicar técnicas de relaxamento que foram ensinadas na sessão anterior. Apresentou-se engajada e participativa. Discutimos a importância da exposição gradual e planejamos pequenos passos para a próxima semana. Tarefa: praticar respiração diafragmática duas vezes ao dia.", keywords: ["ansiedade", "enfrentamento", "sono", "relaxamento", "exposição gradual"], themes: ["gerenciamento de estresse", "técnicas de relaxamento", "TCC"] },
  { id: "sn2", date: "2024-07-08", summary: "Exploramos dinâmicas familiares e padrões de comunicação. Identificamos alguns gatilhos em interações com a mãe que disparam sentimentos de inadequação. Paciente expressou dificuldade em estabelecer limites saudáveis. Trabalhamos role-playing de comunicação assertiva, focando em frases 'Eu sinto...' e pedidos claros. Paciente demonstrou progresso na identificação de pensamentos automáticos negativos relacionados a estas interações.", keywords: ["família", "comunicação", "limites", "assertividade", "pensamentos automáticos"], themes: ["relacionamentos interpessoais", "comunicação assertiva", "dinâmica familiar"] },
];

const initialAssessments = [
  { id: "asm1", name: "Inventário de Depressão de Beck", dateSent: "2024-07-01", status: "Completed" as const, score: "15/63" },
  { id: "asm2", name: "Escala de Ansiedade GAD-7", dateSent: "2024-07-10", status: "Pending" as const },
];

const initialPatientResources = [
 { id: "res1", name: "Guia de Mindfulness.pdf", type: "pdf" as const, size: "1.2MB", sharedDate: "2024-07-02", dataAiHint: "documento mindfulness" },
 { id: "res2", name: "Dicas de Higiene do Sono.pdf", type: "pdf" as const, size: "800KB", sharedDate: "2024-06-20", dataAiHint: "documento sono" },
];

const mockInventoryTemplates = [
  { id: "tpl_bdi", name: "Inventário de Depressão de Beck (BDI)" },
  { id: "tpl_gad7", name: "Escala de Ansiedade GAD-7" },
  { id: "tpl_rosenberg", name: "Escala de Autoestima de Rosenberg" },
  { id: "tpl_pcl5", name: "Checklist de TEPT (PCL-5)" },
];

const mockAvailableInstrumentsForProgress = [
  { id: "bdi", name: "Inventário de Depressão de Beck (BDI)" },
  { id: "gad7", name: "Escala de Ansiedade GAD-7" },
];

const mockPatientProgressData: Record<string, Array<{ date: string; score: number }>> = {
  bdi: [
    { date: "2024-05-01", score: 25 },
    { date: "2024-06-01", score: 18 },
    { date: "2024-07-01", score: 15 },
    { date: "2024-07-15", score: 12 },
  ],
  gad7: [
    { date: "2024-05-15", score: 18 },
    { date: "2024-06-15", score: 14 },
    { date: "2024-07-10", score: 10 },
  ],
};

type TherapeuticGoalStatus = "Em Andamento" | "Alcançado" | "Em Pausa" | "Não Iniciado";
interface TherapeuticGoal {
  id: string;
  title: string;
  description?: string;
  status: TherapeuticGoalStatus;
  targetDate?: string;
}

const mockTherapeuticGoals: TherapeuticGoal[] = [
  { id: "goal1", title: "Reduzir sintomas de ansiedade social", status: "Em Andamento", targetDate: "2024-12-31", description: "Participar de 2 eventos sociais por mês e iniciar conversas." },
  { id: "goal2", title: "Melhorar a qualidade do sono", status: "Alcançado", description: "Dormir 7-8 horas por noite consistentemente e acordar descansado." },
  { id: "goal3", title: "Desenvolver habilidades de comunicação assertiva", status: "Em Pausa", targetDate: "2025-03-31", description: "Expressar necessidades e limites de forma clara e respeitosa em relacionamentos." },
];

type PatientTaskStatus = "A Fazer" | "Concluído" | "Não Feito" | "Sugerido";
interface PatientTask {
  id: string;
  description: string;
  dateProposed: string;
  status: PatientTaskStatus;
  category: "Tarefa" | "Exercício" | "Plano de Ação";
  details?: string;
}
const mockPatientTasks: PatientTask[] = [
  { id: "ptask1", description: "Praticar respiração diafragmática 2x ao dia por 5 min", dateProposed: "2024-07-15", status: "A Fazer", category: "Exercício" },
  { id: "ptask2", description: "Preencher diário de pensamentos automáticos diariamente", dateProposed: "2024-07-08", status: "Concluído", category: "Tarefa" },
  { id: "ptask3", description: "Ler capítulo sobre exposição gradual do material compartilhado", dateProposed: "2024-07-15", status: "A Fazer", category: "Tarefa" },
  { id: "ptask4", description: "Revisar técnicas de relaxamento progressivo (vídeo)", dateProposed: "N/A", status: "Sugerido", category: "Exercício", details: "Pode ser útil para momentos de maior tensão." },
];


export default function PatientDetailPage({ params }: { params: { id: string } }) {
  // For this demo, simply use the static mockPatient defined above
  const patient = mockPatient;
  const router = useRouter();
  const { toast } = useToast();

  if (!patient) {
    return (
      <div className="space-y-6 text-center py-10">
        <UsersIconLucide className="mx-auto h-16 w-16 text-destructive" />
        <h1 className="text-3xl font-headline font-bold text-destructive">
          Paciente não encontrado
        </h1>
        <Button variant="outline" asChild>
          <Link href="/patients">Voltar para Pacientes</Link>
        </Button>
      </div>
    );
  }

  const [sessionNotes, setSessionNotes] = useState(initialSessionNotes);
  const [assessments, setAssessments] = useState<Array<{ id: string; name: string; dateSent: string; status: "Completed" | "Pending" | "Sent"; score?: string }>>(initialAssessments);
  const [patientResources, setPatientResources] = useState<Array<{ id: string; name: string; type: "pdf" | "docx" | "image" | "other"; size: string; sharedDate: string; dataAiHint: string; uploadDate?: string }>>(initialPatientResources);

  const [selectedInventoryTemplate, setSelectedInventoryTemplate] = useState<string>("");
  const [inventorySendDate, setInventorySendDate] = useState<Date | undefined>(undefined); // Initialize as undefined for useEffect
  const [resourceShareNotes, setResourceShareNotes] = useState<string>("");

  const [generalPatientInsights, setGeneralPatientInsights] = useState<GenerateSessionInsightsOutput | null>(null); 
  const [isLoadingGeneralInsights, setIsLoadingGeneralInsights] = useState(false);
  const [errorGeneralInsights, setErrorGeneralInsights] = useState<string | null>(null);

  const [selectedProgressInstrument, setSelectedProgressInstrument] = useState<string>("bdi");
  const [currentProgressData, setCurrentProgressData] = useState<Array<{ date: Date; score: number }>>([]);
  const [isLoadingProgressChart, setIsLoadingProgressChart] = useState(false);
  const [selectedGlobalResource, setSelectedGlobalResource] = useState<string>("");


  useEffect(() => {
    setInventorySendDate(new Date());
  }, []);

  useEffect(() => {
    setIsLoadingProgressChart(true);
    const instrumentData = mockPatientProgressData[selectedProgressInstrument] || [];
    setTimeout(() => {
      setCurrentProgressData(instrumentData.map(d => ({ ...d, date: new Date(d.date) })));
      setIsLoadingProgressChart(false);
    }, 500);
  }, [selectedProgressInstrument]);

  const getInitials = useCallback((name: string) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0][0]?.toUpperCase() || '';
    return (names[0][0] + (names[names.length - 1][0] || '')).toUpperCase();
  }, []);

  const handleArchivePatient = useCallback(() => {
    toast({
      title: "Paciente Arquivado (Simulado)",
      description: `${patient.name} foi marcado(a) como arquivado(a).`,
    });
  }, [toast, patient.name]);

  const handleDeletePatient = useCallback(() => {
    toast({
      title: "Paciente Excluído (Simulado)",
      description: `${patient.name} foi excluído(a) permanentemente.`,
      variant: "destructive",
    });
    router.push("/patients");
  }, [toast, patient.name, router]);

  const handleAssignInventory = useCallback(() => {
    if (!selectedInventoryTemplate || !inventorySendDate) {
      toast({ title: "Erro", description: "Selecione um modelo e uma data de envio.", variant: "destructive" });
      return;
    }
    const template = mockInventoryTemplates.find(t => t.id === selectedInventoryTemplate);
    if (!template) {
        toast({ title: "Erro", description: "Modelo de inventário/escala não encontrado.", variant: "destructive" });
        return;
    }
    const newAssessment = {
      id: `asm_${Date.now()}`,
      name: template.name,
      dateSent: format(inventorySendDate, "yyyy-MM-dd"),
      status: "Sent" as const,
    };
    setAssessments(prev => [newAssessment, ...prev].sort((a, b) => new Date(b.dateSent).getTime() - new Date(a.dateSent).getTime()));
    toast({
      title: "Inventário/Escala Atribuído(a)",
      description: `"${template.name}" atribuído(a) a ${patient.name}. Link de preenchimento simulado enviado.`,
    });
    setSelectedInventoryTemplate("");
    setInventorySendDate(new Date());
  }, [selectedInventoryTemplate, inventorySendDate, toast, patient.name, setAssessments]);

  const handleShareResource = useCallback(() => {
    if (!selectedGlobalResource) {
      toast({ title: "Erro", description: "Selecione um recurso para compartilhar.", variant: "destructive" });
      return;
    }
    const resourceToShare = mockGlobalClinicResources.find(r => r.id === selectedGlobalResource);
    if (!resourceToShare) {
      toast({ title: "Erro", description: "Recurso não encontrado na biblioteca da clínica.", variant: "destructive" });
      return;
    }
    const newSharedResource = {
      ...resourceToShare,
      id: `pat_res_${Date.now()}`,
      sharedDate: format(new Date(), "yyyy-MM-dd"),
    };
    setPatientResources(prev => [newSharedResource, ...prev].sort((a,b) => new Date(b.sharedDate!).getTime() - new Date(a.sharedDate!).getTime()));
    toast({
      title: "Recurso Compartilhado",
      description: `Recurso "${resourceToShare.name}" compartilhado com ${patient.name}.`,
    });
    setSelectedGlobalResource("");
    setResourceShareNotes("");
  }, [selectedGlobalResource, toast, patient.name, setPatientResources]);

  const handleGenerateGeneralPatientInsights = useCallback(async () => {
    if (sessionNotes.length === 0) {
      toast({ title: "Sem Anotações", description: "Não há anotações de sessão para gerar insights gerais.", variant: "default" });
      return;
    }
    setIsLoadingGeneralInsights(true);
    setErrorGeneralInsights(null);
    setGeneralPatientInsights(null);

    const mostRecentNote = sessionNotes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    const summaryForInsights = mostRecentNote.summary;

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setGeneralPatientInsights({
        keywords: mostRecentNote.keywords || ["Tópico 1", "Tópico 2"],
        themes: mostRecentNote.themes || ["Tema A", "Tema B"],
        symptomEvolution: "Evolução dos sintomas parece estável com leve melhora relatada.",
        suggestiveInsights: "Considerar explorar estratégias de mindfulness para ansiedade.",
        therapeuticMilestones: ["Demonstrou maior auto-consciência sobre gatilhos."],
        potentialRiskAlerts: Math.random() > 0.7 ? ["Linguagem sugestiva de aumento de estresse detectada."] : [],
        inventoryComparisonInsights: "Comparado ao último inventário, houve uma redução nos escores de ansiedade.",
      });
      toast({ title: "Insights Gerais Gerados (Simulado)", description: "Insights do paciente foram gerados com base na última anotação de sessão." });
    } catch (e) {
      
      setErrorGeneralInsights("Não foi possível gerar os insights gerais do paciente. Por favor, tente novamente.");
    } finally {
      setIsLoadingGeneralInsights(false);
    }
  }, [sessionNotes, toast]);

  const handleGenerateProntuario = useCallback(async () => {
    if (sessionNotes.length === 0) {
      toast({
        title: "Sem Anotações",
        description: "Adicione anotações para gerar o prontuário.",
        variant: "default",
      });
      return;
    }
    try {
      await gerarProntuario(patient.id, sessionNotes);
      toast({
        title: "Prontuário Gerado",
        description: "Documento criado via Google Apps Script.",
      });
    } catch (e: any) {
      toast({
        title: "Erro ao Gerar Prontuário",
        description: e.message || "Não foi possível gerar o prontuário.",
        variant: "destructive",
      });
    }
  }, [sessionNotes, patient.id, toast]);


  const formattedDob = useMemo(() => patient.dob ? format(new Date(patient.dob), "P", { locale: ptBR }) : "N/A", [patient.dob]);
  const formattedNextAppointment = useMemo(() => patient.nextAppointment
    ? format(new Date(patient.nextAppointment), "P 'às' HH:mm", { locale: ptBR })
    : "Não agendado", [patient.nextAppointment]);
  const formattedLastSession = useMemo(() => patient.lastSession
    ? format(new Date(patient.lastSession), "P", { locale: ptBR })
    : "N/A", [patient.lastSession]);

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild>
        <Link href="/patients">← Voltar para Pacientes</Link>
      </Button>
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

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><Users2 className="mr-2 h-5 w-5 text-primary"/> Visão Geral do Paciente</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <InfoItem icon={<CalendarDays className="text-accent" />} label="Próximo Agendamento" value={formattedNextAppointment} />
          <InfoItem icon={<Clock className="text-accent" />} label="Última Sessão" value={formattedLastSession} />
          <InfoItem icon={<UsersIconLucide className="text-accent h-5 w-5" />} label="Psicólogo(a) Responsável" value={patient.assignedPsychologist} />
          <InfoItem icon={<HomeIconLucide className="text-accent h-5 w-5" />} label="Endereço" value={patient.address} className="md:col-span-2"/>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="font-headline flex items-center">
              <Target className="mr-2 h-5 w-5 text-primary" /> Metas e Alvos Terapêuticos
            </CardTitle>
            <CardDescription>Acompanhe as metas definidas para o tratamento do paciente.</CardDescription>
          </div>
          <Button variant="outline" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Meta
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockTherapeuticGoals.length > 0 ? mockTherapeuticGoals.map(goal => (
            <div key={goal.id} className="p-3 border rounded-md bg-secondary/30 hover:shadow-sm transition-shadow">
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-sm">{goal.title}</h4>
                <Badge 
                  variant={goal.status === "Alcançado" ? "default" : goal.status === "Em Andamento" ? "secondary" : "outline"}
                  className={goal.status === "Alcançado" ? "bg-green-100 text-green-700 border-green-300" : ""}
                >
                  {goal.status}
                </Badge>
              </div>
              {goal.description && <p className="text-xs text-muted-foreground mt-1">{goal.description}</p>}
              {goal.targetDate && <p className="text-xs text-muted-foreground mt-1">Data Alvo: {format(new Date(goal.targetDate), "P", { locale: ptBR })}</p>}
            </div>
          )) : <p className="text-muted-foreground text-sm">Nenhuma meta terapêutica definida ainda.</p>}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row justify-between items-center">
           <div>
            <CardTitle className="font-headline flex items-center">
              <ListChecks className="mr-2 h-5 w-5 text-primary" /> Plano de Ação e Tarefas do Paciente
            </CardTitle>
            <CardDescription>Exercícios, tarefas e planos propostos ao paciente.</CardDescription>
          </div>
          <Button variant="outline" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Tarefa/Exercício
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockPatientTasks.filter(task => task.status !== "Sugerido").length > 0 && (
            <>
              <h4 className="text-sm font-semibold text-muted-foreground">Atribuídos:</h4>
              {mockPatientTasks.filter(task => task.status !== "Sugerido").map(task => (
                <div key={task.id} className="p-3 border rounded-md bg-secondary/30 hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start">
                    <h5 className="font-medium text-sm">{task.category}: {task.description}</h5>
                    <Badge 
                      variant={task.status === "Concluído" ? "default" : task.status === "A Fazer" ? "secondary" : "destructive"}
                      className={task.status === "Concluído" ? "bg-green-100 text-green-700 border-green-300" : ""}
                    >
                      {task.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Proposto em: {format(new Date(task.dateProposed), "P", { locale: ptBR })}</p>
                </div>
              ))}
            </>
          )}
          {mockPatientTasks.filter(task => task.status === "Sugerido").length > 0 && (
            <>
              <h4 className="text-sm font-semibold text-muted-foreground mt-4">Sugestões de Exercícios Futuros:</h4>
              {mockPatientTasks.filter(task => task.status === "Sugerido").map(task => (
                <div key={task.id} className="p-3 border rounded-md bg-blue-500/5 hover:shadow-sm transition-shadow">
                  <h5 className="font-medium text-sm text-blue-700 dark:text-blue-400">{task.category}: {task.description}</h5>
                  {task.details && <p className="text-xs text-muted-foreground mt-1">{task.details}</p>}
                   <Button variant="link" size="sm" className="p-0 h-auto text-xs mt-1">Atribuir este exercício</Button>
                </div>
              ))}
            </>
          )}
          {mockPatientTasks.length === 0 && <p className="text-muted-foreground text-sm">Nenhum plano de ação ou tarefa definida.</p>}
        </CardContent>
      </Card>

      <Card className="mt-6 shadow-sm">
        <CardHeader>
          <CardTitle className="font-headline flex items-center">
            <Brain className="mr-2 h-5 w-5 text-primary" /> Insights Chave do Paciente
          </CardTitle>
          <CardDescription>
            Gere e visualize insights baseados nas interações e histórico do paciente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!generalPatientInsights && !isLoadingGeneralInsights && !errorGeneralInsights && (
            <Button onClick={handleGenerateGeneralPatientInsights} variant="outline" className="w-full sm:w-auto">
              <Brain className="mr-2 h-4 w-4" /> Gerar Insights Gerais (Baseado na Última Sessão)
            </Button>
          )}
          {isLoadingGeneralInsights && (
            <div className="space-y-3 p-4 rounded-md bg-muted/30">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-[180px]" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-8 w-[200px] mt-2" />
            </div>
          )}
          {errorGeneralInsights && !isLoadingGeneralInsights && (
            <Alert variant="destructive">
              <AlertTitle>Erro ao Gerar Insights</AlertTitle>
              <AlertDescription>{errorGeneralInsights}</AlertDescription>
              <Button onClick={handleGenerateGeneralPatientInsights} variant="outline" size="sm" className="mt-3">
                Tentar Novamente
              </Button>
            </Alert>
          )}
          {generalPatientInsights && !isLoadingGeneralInsights && (
            <div className="space-y-4 pt-2 p-4 rounded-md bg-muted/30">
              {generalPatientInsights.potentialRiskAlerts && generalPatientInsights.potentialRiskAlerts.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold flex items-center text-destructive mb-1">
                    <ShieldAlertIcon className="mr-2 h-4 w-4" /> Alertas de Risco Potencial:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {generalPatientInsights.potentialRiskAlerts.map((alert: string, idx: number) => (
                      <Badge key={idx} variant="destructive">{alert}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <h4 className="text-sm font-semibold flex items-center mb-1">
                  <Tag className="mr-2 h-4 w-4 text-muted-foreground" /> Palavras-chave Identificadas:
                </h4>
                <div className="flex flex-wrap gap-1">
                  {generalPatientInsights.keywords.map((kw: string) => <Badge key={kw} variant="secondary">{kw}</Badge>)}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold flex items-center mb-1">
                  <Lightbulb className="mr-2 h-4 w-4 text-muted-foreground" /> Temas Recorrentes:
                </h4>
                <div className="flex flex-wrap gap-1">
                  {generalPatientInsights.themes.map((theme: string) => <Badge key={theme} variant="outline">{theme}</Badge>)}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold flex items-center mb-1">
                  <BarChart3Icon className="mr-2 h-4 w-4 text-muted-foreground" /> Evolução de Sintomas Observada:
                </h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{generalPatientInsights.symptomEvolution}</p>
              </div>
              {generalPatientInsights.therapeuticMilestones && generalPatientInsights.therapeuticMilestones.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold flex items-center mb-1">
                    <CheckCircleIcon className="mr-2 h-4 w-4 text-green-600" /> Marcos Terapêuticos Significativos:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {generalPatientInsights.therapeuticMilestones.map((milestone: string, idx: number) => (
                      <Badge key={idx} variant="default" className="bg-green-100 text-green-700 border-green-300 hover:bg-green-200">{milestone}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {generalPatientInsights.inventoryComparisonInsights && (
                  <div>
                      <h4 className="text-sm font-semibold flex items-center mb-1">
                          <BarChart3Icon className="mr-2 h-4 w-4 text-muted-foreground" /> Insights Comparativos (Histórico/Inventários):
                      </h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{generalPatientInsights.inventoryComparisonInsights}</p>
                  </div>
              )}
              <div>
                <h4 className="text-sm font-semibold flex items-center mb-1">
                  <Lightbulb className="mr-2 h-4 w-4 text-muted-foreground" /> Sugestões e Observações da IA:
                </h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{generalPatientInsights.suggestiveInsights}</p>
              </div>
              <div className="flex gap-2 mt-3">
                <Button onClick={() => { setGeneralPatientInsights(null); setErrorGeneralInsights(null); }} variant="outline" size="sm">
                    Limpar Insights
                </Button>
                 <Button onClick={handleGenerateGeneralPatientInsights} variant="outline" size="sm">
                    <Brain className="mr-2 h-3.5 w-3.5" /> Regenerar Insights
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6 shadow-sm">
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="font-headline flex items-center"><MessageSquare className="mr-2 h-5 w-5 text-primary"/> Anotações de Sessão</CardTitle>
            <CardDescription>Registro cronológico das sessões de terapia.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleGenerateProntuario} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <UploadCloud className="mr-2 h-4 w-4" /> Gerar Prontuário
            </Button>
            <Button variant="outline" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <FileText className="mr-2 h-4 w-4" /> Nova Anotação
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessionNotes.map(note => (
            <SessionNoteCard key={note.id} note={note} patientName={patient.name} therapistName={patient.assignedPsychologist} />
          ))}
          {sessionNotes.length === 0 && <p className="text-muted-foreground">Nenhuma anotação de sessão registrada ainda.</p>}
        </CardContent>
      </Card>

      <Card className="mt-6 shadow-sm">
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="font-headline flex items-center"><ClipboardList className="mr-2 h-5 w-5 text-primary"/> Inventários e Escalas</CardTitle>
            <CardDescription>Acompanhe e gerencie os instrumentos aplicados ao paciente.</CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <CheckCircle className="mr-2 h-4 w-4" /> Atribuir Inventário/Escala
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Atribuir Inventário/Escala a {patient.name}</DialogTitle>
                    <DialogDescription>
                        Selecione um modelo e uma data de envio.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="inventory-template" className="text-right col-span-1">
                            Modelo
                        </Label>
                        <Select value={selectedInventoryTemplate} onValueChange={setSelectedInventoryTemplate}>
                            <SelectTrigger id="inventory-template" className="col-span-3">
                                <SelectValue placeholder="Selecione um modelo" />
                            </SelectTrigger>
                            <SelectContent>
                                {mockInventoryTemplates.map(template => (
                                    <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="inventory-date" className="text-right col-span-1">
                            Data Envio
                        </Label>
                         <div className="col-span-3">
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className="w-full justify-start text-left font-normal"
                                >
                                    <CalendarIconShad className="mr-2 h-4 w-4" />
                                    {inventorySendDate ? format(inventorySendDate, "P", {locale: ptBR}) : <span>Escolha uma data</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={inventorySendDate}
                                    onSelect={setInventorySendDate}
                                    initialFocus
                                    locale={ptBR}
                                />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {/* Close logic or use DialogClose */}}>Cancelar</Button>
                  <Button type="button" onClick={handleAssignInventory} disabled={!selectedInventoryTemplate || !inventorySendDate}>Atribuir</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {assessments.map(assessment => (
            <AssessmentCard key={assessment.id} assessment={assessment} />
          ))}
          {assessments.length === 0 && <p className="text-muted-foreground md:col-span-full">Nenhum inventário/escala atribuído ou concluído.</p>}
        </CardContent>
      </Card>

      <Card className="mt-6 shadow-sm">
        <CardHeader>
        <CardTitle className="font-headline flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-primary" /> Progresso Terapêutico
        </CardTitle>
        <CardDescription>
            Acompanhe a evolução das pontuações dos instrumentos ao longo do tempo.
        </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
        <div className="max-w-xs">
            <Label htmlFor="progressInstrumentSelect">Selecionar Instrumento:</Label>
            <Select value={selectedProgressInstrument} onValueChange={setSelectedProgressInstrument}>
            <SelectTrigger id="progressInstrumentSelect">
                <SelectValue placeholder="Selecione um instrumento" />
            </SelectTrigger>
            <SelectContent>
                {mockAvailableInstrumentsForProgress.map(instrument => (
                <SelectItem key={instrument.id} value={instrument.id}>
                    {instrument.name}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>
        {isLoadingProgressChart ? (
            <div className="h-[350px] w-full flex flex-col items-center justify-center bg-muted/30 rounded-lg">
            <Skeleton className="h-4 w-1/4 mb-2" />
            <Skeleton className="h-3/4 w-full" />
            </div>
        ) : currentProgressData.length > 0 ? (
            <div className="h-[350px] w-full bg-muted/30 rounded-lg p-4">
            <PatientProgressChart data={currentProgressData} instrumentName={mockAvailableInstrumentsForProgress.find(i => i.id === selectedProgressInstrument)?.name || ""} />
            </div>
        ) : (
            <div className="text-center py-10 text-muted-foreground">
            <TrendingUp className="mx-auto h-12 w-12" />
            <p className="mt-2">Nenhum dado de progresso disponível para o instrumento selecionado.</p>
            <p className="text-sm">Certifique-se de que há resultados concluídos para este paciente com o instrumento escolhido.</p>
            </div>
        )}
        </CardContent>
      </Card>

      <Card className="mt-6 shadow-sm">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><Activity className="mr-2 h-5 w-5 text-primary"/> Linha do Tempo do Paciente</CardTitle>
          <CardDescription>Eventos chave e interações relacionadas ao paciente.</CardDescription>
        </CardHeader>
        <CardContent>
          <PatientTimeline patientId={params.id} />
        </CardContent>
      </Card>

      <Card className="mt-6 shadow-sm">
        <CardHeader className="flex flex-row justify-between items-center">
         <div>
            <CardTitle className="font-headline flex items-center"><BookOpen className="mr-2 h-5 w-5 text-primary"/> Recursos Compartilhados com {patient.name}</CardTitle>
            <CardDescription>Documentos e guias compartilhados com este paciente.</CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
               <Button variant="outline" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Share2 className="mr-2 h-4 w-4" /> Compartilhar Novo Recurso
               </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Compartilhar Recurso com {patient.name}</DialogTitle>
                    <DialogDescription>
                        Selecione um recurso da biblioteca da clínica para compartilhar com este paciente.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="global-resource-select">Recurso da Clínica</Label>
                        <Select value={selectedGlobalResource} onValueChange={setSelectedGlobalResource}>
                            <SelectTrigger id="global-resource-select">
                                <SelectValue placeholder="Selecione um recurso global" />
                            </SelectTrigger>
                            <SelectContent>
                                {mockGlobalClinicResources.map(res => (
                                    <SelectItem key={res.id} value={res.id}>{res.name} ({res.type}, {res.size})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="resource-share-notes">Notas para o Paciente (Opcional)</Label>
                        <Textarea
                            id="resource-share-notes"
                            value={resourceShareNotes}
                            onChange={(e) => setResourceShareNotes(e.target.value)}
                            placeholder="Ex: Dê uma olhada neste material antes da nossa próxima sessão."
                            rows={3}
                        />
                    </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {/* Close logic or use DialogClose */}}>Cancelar</Button>
                  <Button type="button" onClick={handleShareResource} disabled={!selectedGlobalResource}>Compartilhar</Button>
                </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {patientResources.map(resource => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
          {patientResources.length === 0 && <p className="text-muted-foreground md:col-span-full">Nenhum recurso compartilhado com este paciente ainda.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

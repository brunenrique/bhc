
"use client";

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { cacheService } from '@/services/cacheService';
import type { Patient, Session, Assessment, TherapeuticPlan, ProcedimentoAnaliseEntry, User } from '@/types';
import { mockPatientsData } from '@/app/(app)/patients/page';
import { mockSessionsData } from '@/app/(app)/whatsapp-reminders/page';
import { mockAssessmentsData } from '@/app/(app)/assessments/page';
import { PatientFormDialog } from '@/features/patients/components/PatientFormDialog';
import { GenerateProntuarioDialog } from '@/features/patients/components/GenerateProntuarioDialog';
import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { PatientAssessmentsSection } from '@/features/patients/components/PatientAssessmentsSection';
import { PatientEvolutionChart } from '@/features/patients/components/PatientEvolutionChart';
import { PatientTherapeuticPlan } from '@/features/patients/components/PatientTherapeuticPlan';
import { PatientAttachmentManager } from '@/features/patients/components/PatientAttachmentManager';
import { summarizeClinicalNotes, type SummarizeClinicalNotesInput, type SummarizeClinicalNotesOutput } from '@/ai/flows/summarize-clinical-notes-flow';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { hasPermission } from '@/lib/permissions';
import { format, parseISO, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import {
  UserCircle, Edit, FileText, ListChecks, BarChart3, Paperclip, ShieldCheck, Download, Eye, Target, TrendingUp,
  AlertTriangle, CalendarCheck2, CalendarX2, UserX, Hourglass, RotateCcw, PlusCircle, Wand2, Loader2
} from 'lucide-react';


// Placeholder for ProntuarioDisplay component logic inside PatientDetailPage
const ProntuarioDisplay = ({ patient, currentUser, onOpenGenerateDialog }: { patient: Patient, currentUser: User | null, onOpenGenerateDialog: () => void }) => {
  if (!patient.prontuario) {
    return <p className="text-muted-foreground">Dados do prontuário não disponíveis.</p>;
  }

  const { identificacao, entradaUnidade, demandaQueixaPrincipal, procedimentosAnalise, conclusaoEncaminhamentoGeral, localAssinatura } = patient.prontuario;
  const isOwnerOrAdmin = currentUser?.role === 'admin' || (currentUser?.role === 'psychologist' && patient.assignedTo === currentUser?.id);

  return (
    <div className="space-y-6">
      {identificacao && (
        <Card>
          <CardHeader><CardTitle className="font-headline text-lg">Identificação do Paciente</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p><strong>Nome:</strong> {identificacao.nomeCompleto || patient.name}</p>
            <p><strong>CPF:</strong> {identificacao.cpf || 'Não informado'}</p>
            <p><strong>Data de Nascimento:</strong> {identificacao.dataNascimento ? format(parseISO(identificacao.dataNascimento), "dd/MM/yyyy", { locale: ptBR }) : patient.dateOfBirth ? format(parseISO(patient.dateOfBirth), "dd/MM/yyyy", { locale: ptBR }) : 'Não informado'}</p>
            {/* Add other identificacao fields as needed */}
          </CardContent>
        </Card>
      )}
      {entradaUnidade && entradaUnidade.descricaoEntrada && (
        <Card>
          <CardHeader><CardTitle className="font-headline text-lg">Entrada na Unidade</CardTitle></CardHeader>
          <CardContent><p className="text-sm">{entradaUnidade.descricaoEntrada}</p></CardContent>
        </Card>
      )}
      {demandaQueixaPrincipal && (
        <Card>
          <CardHeader><CardTitle className="font-headline text-lg">Demanda/Queixa Principal (Geral)</CardTitle></CardHeader>
          <CardContent><p className="text-sm whitespace-pre-line">{demandaQueixaPrincipal}</p></CardContent>
        </Card>
      )}
      <Card>
        <CardHeader><CardTitle className="font-headline text-lg">Procedimento/Análise (Histórico de Evoluções)</CardTitle></CardHeader>
        <CardContent>
          {procedimentosAnalise && procedimentosAnalise.length > 0 ? (
            <ScrollArea className="h-[400px] border rounded-md p-3 bg-muted/30">
              <ul className="space-y-4">
                {procedimentosAnalise.slice().reverse().map((entry) => ( // Show most recent first
                  <li key={entry.entryId} className="pb-3 border-b last:border-b-0">
                    <p className="text-xs text-muted-foreground mb-1">
                      Registrado em: {format(parseISO(entry.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                    <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: entry.content }} />
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma evolução de sessão registrada no prontuário.</p>
          )}
        </CardContent>
      </Card>
      {conclusaoEncaminhamentoGeral && (
        <Card>
          <CardHeader><CardTitle className="font-headline text-lg">Conclusão/Encaminhamento (Geral)</CardTitle></CardHeader>
          <CardContent><p className="text-sm whitespace-pre-line">{conclusaoEncaminhamentoGeral}</p></CardContent>
        </Card>
      )}
      <Card>
        <CardHeader><CardTitle className="font-headline text-lg">Assinatura e Validação</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm"><strong>Local e Data:</strong> {localAssinatura || 'Não informado'}, {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}.</p>
          <p className="text-sm"><strong>Psicólogo Responsável:</strong> {currentUser?.name} (CRP: {currentUser?.crp || 'N/A'})</p>
          {isOwnerOrAdmin && (
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
               <Button variant="outline" onClick={onOpenGenerateDialog} className="w-full sm:w-auto">
                <FileText className="mr-2 h-4 w-4" /> Gerar Texto do Prontuário (Local)
              </Button>
              <Button variant="outline" onClick={() => toast({ title: "Simulação", description: "Funcionalidade de exportação PDF seria acionada aqui."})} className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" /> Exportar para PDF (Simulado)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


export default function PatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;
  const { user: currentUser, isLoading: authLoading } = useAuth();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("prontuario");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [sessionNotesContent, setSessionNotesContent] = useState("<p></p>"); // For new session notes
  const [isGenerateProntuarioDialogOpen, setIsGenerateProntuarioDialogOpen] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAiSummaryLoading, setIsAiSummaryLoading] = useState(false);

  const patientSessions = useMemo(() => {
    if (!patient) return [];
    // In a real app, this would be a Firestore query
    return mockSessionsData.filter(s => s.patientId === patient.id)
      .sort((a, b) => parseISO(b.startTime).getTime() - parseISO(a.startTime).getTime());
  }, [patient]);

  const patientAssessments = useMemo(() => {
    if (!patient) return [];
    return mockAssessmentsData.filter(a => a.patientId === patient.id);
  }, [patient]);

  const completedPatientAssessments = useMemo(() => {
    return patientAssessments.filter(a => a.status === 'completed' && a.results && typeof a.results.score === 'number');
  }, [patientAssessments]);
  

  const loadPatientData = useCallback(async () => {
    if (!patientId || authLoading) return;
    setIsLoading(true);

    let foundPatient = await cacheService.patients.getDetail(patientId);
    if (!foundPatient) {
      const patientsList = await cacheService.patients.getList();
      foundPatient = patientsList?.find(p => p.id === patientId) || mockPatientsData.find(p => p.id === patientId) || null;
      if (foundPatient) await cacheService.patients.setDetail(patientId, foundPatient);
    }
    
    if (foundPatient) {
      setPatient(foundPatient);
      // Initialize sessionNotesContent for new entries, not from patient.sessionNotes (which is legacy now)
      setSessionNotesContent("<p>Nova entrada de evolução da sessão...</p>");
    } else {
      toast({ title: "Erro", description: "Paciente não encontrado.", variant: "destructive" });
      router.push('/patients');
    }
    setIsLoading(false);
  }, [patientId, router, authLoading]);

  useEffect(() => {
    loadPatientData();
  }, [loadPatientData]);

  const handleOpenForm = useCallback(() => {
    // Form dialog will initialize with patient data, including last session notes if available or new note placeholder
    setIsFormOpen(true);
  }, []);

  const handleSavePatient = async (updatedData: Partial<Patient>) => {
    if (!patient) return;
    
    const updatedPatient: Patient = { 
        ...patient, 
        ...updatedData, 
        updatedAt: new Date().toISOString(),
        prontuario: {
            ...(patient.prontuario || { procedimentosAnalise: [] }),
            ...(updatedData.prontuario || {}),
            identificacao: {
                ...(patient.prontuario?.identificacao || {}),
                ...(updatedData.prontuario?.identificacao || {}),
            },
            entradaUnidade: {
                ...(patient.prontuario?.entradaUnidade || {}),
                ...(updatedData.prontuario?.entradaUnidade || {}),
            },
            // The logic in PatientFormDialog handles appending sessionNotes to procedimentosAnalise
            procedimentosAnalise: updatedData.prontuario?.procedimentosAnalise || patient.prontuario?.procedimentosAnalise || [],
        }
    };

    // Reset sessionNotes on the main patient object if it's handled within prontuario.procedimentosAnalise now
    // This depends on how PatientFormDialog is structured
    // For safety, ensure it's not carrying over old direct sessionNotes if they are now part of prontuario
    if (updatedPatientData.sessionNotes && updatedPatientData.sessionNotes.trim() !== "<p></p>" && updatedPatientData.sessionNotes.trim() !== "<p>Nova entrada de evolução da sessão...</p>") {
        // This indicates new notes were likely entered, and PatientFormDialog should have handled appending them.
        // We can clear the direct sessionNotes field on the patient object if it's purely for temporary input.
        updatedPatient.sessionNotes = "<p>Nova entrada de evolução da sessão...</p>"; // Or however you manage the placeholder
    }

    setPatient(updatedPatient);
    await cacheService.patients.setDetail(patientId, updatedPatient);
    
    const patientsList = await cacheService.patients.getList() || [];
    const updatedList = patientsList.map(p => p.id === patientId ? updatedPatient : p);
    await cacheService.patients.setList(updatedList);

    toast({ title: "Sucesso", description: "Dados do paciente e prontuário atualizados." });
    setIsFormOpen(false);
    loadPatientData(); 
  };
  
  const stripHtml = (html: string): string => {
    if (typeof document !== 'undefined') {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.body.textContent || "";
    }
    return html.replace(/<[^>]+>/g, ''); 
  };

  const handleGenerateAiSummary = useCallback(async () => {
    if (!patient || !patient.prontuario) {
      toast({ title: "Dados Insuficientes", description: "Não há dados de prontuário para gerar o resumo.", variant: "destructive" });
      return;
    }
    setIsAiSummaryLoading(true);
    setAiSummary(null);

    const { demandaQueixaPrincipal = "", procedimentosAnalise = [], conclusaoEncaminhamentoGeral = "" } = patient.prontuario;
    
    let notesToSummarize = `Demanda/Queixa Principal: ${demandaQueixaPrincipal || "(Não informado)"}\n\n`;
    
    notesToSummarize += "Histórico de Evoluções das Sessões (Procedimento/Análise):\n";
    if (procedimentosAnalise && procedimentosAnalise.length > 0) {
      procedimentosAnalise.slice().reverse().forEach(entry => { // Most recent first for summary context
        notesToSummarize += `Data: ${format(parseISO(entry.date), "dd/MM/yyyy HH:mm", { locale: ptBR })}\nConteúdo: ${stripHtml(entry.content)}\n\n`;
      });
    } else {
      notesToSummarize += "(Nenhuma evolução registrada)\n\n";
    }
    
    notesToSummarize += `\nConclusão/Encaminhamento Geral: ${conclusaoEncaminhamentoGeral || "(Não informado)"}`;

    try {
      const input: SummarizeClinicalNotesInput = { clinicalNotes: notesToSummarize.trim() };
      const output: SummarizeClinicalNotesOutput = await summarizeClinicalNotes(input);
      setAiSummary(output.summary);
      toast({ title: "Resumo Gerado por IA", description: "O resumo clínico foi gerado com sucesso.", className: "bg-primary text-primary-foreground" });
    } catch (error: any) {
      console.error("Error generating AI summary:", error);
      setAiSummary("Falha ao gerar o resumo. Tente novamente.");
      toast({ title: "Erro na IA", description: error.message || "Não foi possível gerar o resumo clínico.", variant: "destructive" });
    } finally {
      setIsAiSummaryLoading(false);
    }
  }, [patient]);

  const getInitials = (nameStr: string) => {
    const names = nameStr.split(' ');
    if (names.length === 1) return names[0][0]?.toUpperCase() || '';
    return (names[0][0] + (names[names.length - 1][0] || '')).toUpperCase();
  };

  const calculateAge = (birthDateISO?: string) => {
    if (!birthDateISO) return 'N/A';
    try {
      return differenceInYears(new Date(), parseISO(birthDateISO));
    } catch {
      return 'N/A';
    }
  };

  const sessionStatusMap: Record<Session["status"], { label: string; icon: React.ElementType; color: string; badgeVariant: "default" | "secondary" | "outline" | "destructive" }> = {
    scheduled: { label: "Agendada", icon: Hourglass, color: "text-blue-600 border-blue-500 bg-blue-500/10", badgeVariant: "outline" },
    completed: { label: "Concluída", icon: CalendarCheck2, color: "text-green-600 border-green-500 bg-green-500/10", badgeVariant: "secondary" },
    cancelled: { label: "Cancelada", icon: CalendarX2, color: "text-orange-600 border-orange-500 bg-orange-500/10", badgeVariant: "outline" },
    'no-show': { label: "Não Compareceu", icon: UserX, color: "text-red-600 border-red-500 bg-red-500/10", badgeVariant: "destructive" },
  };

  const sessionStats = useMemo(() => {
    const stats = { completed: 0, cancelled: 0, noShow: 0, nextScheduled: null as Session | null };
    const now = new Date();
    patientSessions.forEach(s => {
      if (s.status === 'completed') stats.completed++;
      else if (s.status === 'cancelled') stats.cancelled++;
      else if (s.status === 'no-show') stats.noShow++;
      else if (s.status === 'scheduled' && parseISO(s.startTime) > now) {
        if (!stats.nextScheduled || parseISO(s.startTime) < parseISO(stats.nextScheduled.startTime)) {
          stats.nextScheduled = s;
        }
      }
    });
    return stats;
  }, [patientSessions]);
  
  const canEditPatient = hasPermission(currentUser?.role, 'CREATE_EDIT_CLINICAL_NOTES', patient?.assignedTo === currentUser?.id);

  if (isLoading || authLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-8 w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24" /> <Skeleton className="h-24" /> <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!patient || !currentUser) {
    return <div className="text-center p-8 text-destructive">Erro ao carregar dados do paciente ou usuário.</div>;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-2 border-primary">
            <AvatarImage src={patient.prontuario?.identificacao?.fotoUrl || `https://placehold.co/100x100.png?text=${getInitials(patient.name)}`} alt={patient.name} data-ai-hint="person avatar" />
            <AvatarFallback className="text-2xl">{getInitials(patient.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-headline font-semibold">{patient.name}</h1>
            <p className="text-muted-foreground">
              {patient.email || 'Email não informado'} | {patient.phone || 'Telefone não informado'} | Idade: {calculateAge(patient.dateOfBirth)}
            </p>
            {patient.assignedTo && <p className="text-xs text-muted-foreground">Psicólogo(a) Responsável: {mockPatientsData.find(p => p.assignedTo === patient.assignedTo)?.name || patient.assignedTo}</p>}
          </div>
        </div>
        {canEditPatient && (
          <Button onClick={handleOpenForm} className="w-full md:w-auto">
            <Edit className="mr-2 h-4 w-4" /> Editar Paciente e Prontuário
          </Button>
        )}
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="prontuario"><FileText className="mr-1 h-4 w-4 sm:mr-2"/>Prontuário</TabsTrigger>
          <TabsTrigger value="estudo_de_caso"><ListChecks className="mr-1 h-4 w-4 sm:mr-2"/>Estudo de Caso</TabsTrigger>
          <TabsTrigger value="pti"><Target className="mr-1 h-4 w-4 sm:mr-2"/>PTI</TabsTrigger>
          <TabsTrigger value="escalas"><BarChart3 className="mr-1 h-4 w-4 sm:mr-2"/>Escalas</TabsTrigger>
          <TabsTrigger value="analise_grafica"><TrendingUp className="mr-1 h-4 w-4 sm:mr-2"/>Análise Gráfica</TabsTrigger>
          <TabsTrigger value="anexos"><Paperclip className="mr-1 h-4 w-4 sm:mr-2"/>Anexos</TabsTrigger>
        </TabsList>

        <TabsContent value="prontuario" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center">
                <ShieldCheck className="mr-2 h-6 w-6 text-primary" />Prontuário Psicológico Consolidado
              </CardTitle>
              <CardDescription>Visualização completa do histórico e dados clínicos do paciente.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Card className="bg-muted/30">
                <CardHeader><CardTitle className="text-md font-headline">Indicadores Clínicos Rápidos</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div><strong>Sessões Realizadas:</strong> {sessionStats.completed}</div>
                  <div><strong>Faltas:</strong> {sessionStats.noShow}</div>
                  <div><strong>Canceladas:</strong> {sessionStats.cancelled}</div>
                  <div><strong>Avaliações Concluídas:</strong> {completedPatientAssessments.length}</div>
                  {sessionStats.nextScheduled && (
                    <div className="col-span-full">
                      <strong>Próxima Sessão:</strong> {format(parseISO(sessionStats.nextScheduled.startTime), "dd/MM/yy 'às' HH:mm", { locale: ptBR })} ({sessionStats.nextScheduled.psychologistName})
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="font-headline text-lg">Resumo Clínico por IA</CardTitle>
                    <Button onClick={handleGenerateAiSummary} disabled={isAiSummaryLoading || !(patient.prontuario?.procedimentosAnalise && patient.prontuario.procedimentosAnalise.length > 0)} size="sm">
                        {isAiSummaryLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4"/>}
                        {isAiSummaryLoading ? "Gerando..." : aiSummary ? "Atualizar Resumo IA" : "Gerar Resumo IA"}
                    </Button>
                </CardHeader>
                <CardContent>
                    {isAiSummaryLoading && (
                        <div className="flex items-center justify-center p-4 text-muted-foreground">
                            <Loader2 className="h-6 w-6 animate-spin mr-2"/> Processando informações...
                        </div>
                    )}
                    {aiSummary && !isAiSummaryLoading && (
                         <div className="prose prose-sm dark:prose-invert max-w-none p-3 bg-background rounded-md border whitespace-pre-line"
                            dangerouslySetInnerHTML={{ __html: aiSummary.replace(/\n/g, '<br />') }} />
                    )}
                    {!aiSummary && !isAiSummaryLoading && (
                        <p className="text-sm text-muted-foreground p-3 border rounded-md bg-muted/20">
                            Clique no botão acima para gerar um resumo clínico utilizando inteligência artificial com base nas evoluções e dados do prontuário.
                            {!(patient.prontuario?.procedimentosAnalise && patient.prontuario.procedimentosAnalise.length > 0) && <span className="text-destructive block mt-1"> (Adicione evoluções de sessão para habilitar esta função)</span>}
                        </p>
                    )}
                </CardContent>
              </Card>
              
              <ProntuarioDisplay patient={patient} currentUser={currentUser} onOpenGenerateDialog={() => setIsGenerateProntuarioDialogOpen(true)} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="estudo_de_caso" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="font-headline">Estudo de Caso Detalhado</CardTitle></CardHeader>
            <CardContent>
              <RichTextEditor
                initialContent={patient.caseStudyNotes || "<p>Nenhuma nota de estudo de caso registrada.</p>"}
                onUpdate={(content) => {
                  // This is primarily for display. Editing is done via the main PatientFormDialog
                }}
                editable={false} 
                editorClassName="bg-transparent p-0"
                pageClassName="shadow-none border p-4"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pti" className="mt-4">
          <PatientTherapeuticPlan plan={patient.therapeuticPlan} />
        </TabsContent>

        <TabsContent value="escalas" className="mt-4">
          <PatientAssessmentsSection patientName={patient.name} assessments={patientAssessments} />
        </TabsContent>
        
        <TabsContent value="analise_grafica" className="mt-4">
          <PatientEvolutionChart patientName={patient.name} completedAssessments={completedPatientAssessments} />
        </TabsContent>

        <TabsContent value="anexos" className="mt-4">
            <PatientAttachmentManager patientId={patient.id} patientName={patient.name} currentUser={currentUser} />
        </TabsContent>
      </Tabs>

      {isFormOpen && (
        <PatientFormDialog
          isOpen={isFormOpen}
          onOpenChange={setIsFormOpen}
          patient={patient}
          onSave={handleSavePatient}
        />
      )}
      {isGenerateProntuarioDialogOpen && patient && (
        <GenerateProntuarioDialog
          isOpen={isGenerateProntuarioDialogOpen}
          onOpenChange={setIsGenerateProntuarioDialogOpen}
          patient={patient}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}

    
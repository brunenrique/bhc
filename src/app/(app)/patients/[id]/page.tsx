
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import type { Session, Patient, PatientNoteVersion } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Mail, Phone, CalendarDays, FileText, PlusCircle, Repeat, Eye, EyeOff, Lock, History, Info } from 'lucide-react';
import { PatientFormDialog } from '@/components/patients/PatientFormDialog';
import { SessionFormDialog } from '@/components/scheduling/SessionFormDialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { format, parseISO, addDays, addWeeks, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cacheService } from '@/services/cacheService';
import { Skeleton } from '@/components/ui/skeleton';


const fetchPatientDetailsMock = async (id: string): Promise<Patient | null> => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
  const mockPatient: Patient = {
    id,
    name: id === '1' ? 'Ana Beatriz Silva' : id === '2' ? 'Bruno Almeida Costa' : 'Paciente Exemplo Detalhado',
    email: id === '1' ? 'ana.silva@example.com' : id === '2' ? 'bruno.costa@example.com' : 'paciente.detalhe@example.com',
    phone: id === '1' ? '(11) 98765-4321' : id === '2' ? '(21) 91234-5678' : '(XX) XXXXX-XXXX',
    dateOfBirth: id === '1' ? '1990-05-15' : id === '2' ? '1985-11-20' : '1995-01-01',
    address: 'Rua Fictícia, 123, Bairro Imaginário, Cidade Exemplo - UF',
    sessionNotes: `Sessão de 22/07: Paciente demonstrou melhora significativa na gestão de pensamentos automáticos. Praticou as técnicas de respiração e relatou diminuição da insônia. Próxima sessão focará em estratégias de manutenção e prevenção de recaídas.`,
    previousSessionNotes: [
      { content: "Sessão de 15/07: Foco em reestruturação cognitiva de pensamentos automáticos negativos. Paciente identificou três padrões principais. Recomendações: Continuar o diário de pensamentos, praticar técnicas de respiração diafragmática duas vezes ao dia.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString() },
      { content: "Paciente apresenta quadro de ansiedade generalizada, com picos de estresse relacionados ao trabalho. Demonstra boa adesão às técnicas propostas em sessões anteriores.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString() }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), 
    updatedAt: new Date().toISOString(),
  };
  if (id === 'notfound') return null;
  return mockPatient;
};

const fetchPatientSessionsMock = async (patientId: string): Promise<Session[]> => {
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay
  return [
    { id: 's1', patientId, psychologistId: 'psy1', psychologistName: "Dr. Exemplo", startTime: new Date(Date.now() - 1000*60*60*24*7).toISOString(), endTime: new Date(Date.now() - 1000*60*60*24*7 + 1000*60*60).toISOString(), status: 'completed', notes: 'Sessão produtiva, paciente demonstrou progresso.', recurring: 'weekly'},
    { id: 's2', patientId, psychologistId: 'psy1', psychologistName: "Dr. Exemplo", startTime: new Date(Date.now() - 1000*60*60*24*2).toISOString(), endTime: new Date(Date.now() - 1000*60*60*24*2 + 1000*60*60).toISOString(), status: 'scheduled', notes: 'Foco em técnicas de relaxamento.', recurring: 'none'},
  ].sort((a,b) => parseISO(b.startTime).getTime() - parseISO(a.startTime).getTime());
}

const recurrenceLabels: Record<string, string> = {
  daily: "Diária",
  weekly: "Semanal",
  monthly: "Mensal",
  none: "Não se repete"
};

export default function PatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPatientFormOpen, setIsPatientFormOpen] = useState(false);
  const [isSessionFormOpen, setIsSessionFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [areNotesVisible, setAreNotesVisible] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (patientId) {
      const loadPatientData = async () => {
        setIsLoading(true);
        
        // Try to load patient details from cache
        try {
          const cachedPatient = await cacheService.patients.getDetail(patientId);
          if (isMounted && cachedPatient) {
            setPatient(cachedPatient);
          }
        } catch (error) {
          console.warn(`Error loading patient ${patientId} from cache:`, error);
        }

        // Try to load patient sessions from cache
        try {
          const cachedSessions = await cacheService.patients.getSessions(patientId);
          if (isMounted && cachedSessions) {
            setSessions(cachedSessions.sort((a,b) => parseISO(b.startTime).getTime() - parseISO(a.startTime).getTime()));
          }
        } catch (error) {
          console.warn(`Error loading sessions for patient ${patientId} from cache:`, error);
        }

        // Fetch "fresh" data
        const patientData = await fetchPatientDetailsMock(patientId);
        const sessionsData = await fetchPatientSessionsMock(patientId);

        if (isMounted) {
          if (patientData) {
            setPatient(patientData);
            await cacheService.patients.setDetail(patientId, patientData);
          }
          setSessions(sessionsData.sort((a,b) => parseISO(b.startTime).getTime() - parseISO(a.startTime).getTime()));
          await cacheService.patients.setSessions(patientId, sessionsData);
          setIsLoading(false);
        }
      };
      loadPatientData();
    }
    return () => { isMounted = false; };
  }, [patientId]);

  const handleEditSession = useCallback((session: Session) => {
    setEditingSession(session);
    setIsSessionFormOpen(true);
  }, []);
  
  const handleNewSession = useCallback(() => {
    setEditingSession(null); 
    setIsSessionFormOpen(true);
  }, []);

  const handleSavePatient = useCallback(async (updatedData: Partial<Patient>) => {
    if (!patient) return;

    const currentNotes = patient.sessionNotes || "";
    const newNotes = updatedData.sessionNotes;
    let previousNotes = patient.previousSessionNotes || [];

    if (newNotes !== undefined && newNotes !== currentNotes && currentNotes.trim() !== "") {
      const newVersion: PatientNoteVersion = {
        content: currentNotes,
        timestamp: patient.updatedAt || new Date().toISOString(),
      };
      previousNotes = [newVersion, ...previousNotes].slice(0, 5); // Keep last 5 versions
    }

    const updatedPatient = { 
      ...patient, 
      ...updatedData, 
      previousSessionNotes: previousNotes,
      updatedAt: new Date().toISOString() 
    };
    
    setPatient(updatedPatient);
    await cacheService.patients.setDetail(patient.id, updatedPatient); // Update cache
    setIsPatientFormOpen(false);
  }, [patient]);

  const handleSaveSession = useCallback(async (sessionData: Partial<Session>) => {
    const psychologistNameMap: Record<string, string> = {
      psy1: 'Dr. Exemplo Silva',
      psy2: 'Dra. Modelo Souza',
    };
    let updatedSessions;

    if (editingSession && sessionData.id) {
      updatedSessions = sessions.map(s => (s.id === sessionData.id ? { 
          ...s, 
          ...sessionData,
          psychologistName: sessionData.psychologistId ? psychologistNameMap[sessionData.psychologistId] || s.psychologistName : s.psychologistName,
         } as Session : s));
    } else {
      const mainNewSession = { 
        ...sessionData, 
        id: `s-${Date.now()}`, 
        patientId: patientId,
        patientName: patient?.name,
        psychologistName: sessionData.psychologistId ? psychologistNameMap[sessionData.psychologistId] || 'Psicólogo Desconhecido' : 'Psicólogo Desconhecido',
      } as Session;

      const sessionsToAdd = [mainNewSession];

      if (mainNewSession.recurring && mainNewSession.recurring !== 'none' && mainNewSession.startTime) {
        const baseStartTime = parseISO(mainNewSession.startTime);
        const baseEndTime = mainNewSession.endTime ? parseISO(mainNewSession.endTime) : new Date(baseStartTime.getTime() + 60 * 60 * 1000);
        const duration = baseEndTime.getTime() - baseStartTime.getTime();
        let occurrencesToCreate = mainNewSession.recurring === 'daily' ? 6 : 4;

        for (let i = 1; i <= occurrencesToCreate; i++) {
          let nextStartTime: Date;
          if (mainNewSession.recurring === 'daily') nextStartTime = addDays(baseStartTime, i);
          else if (mainNewSession.recurring === 'weekly') nextStartTime = addWeeks(baseStartTime, i);
          else if (mainNewSession.recurring === 'monthly') nextStartTime = addMonths(baseStartTime, i);
          else break; 
          
          sessionsToAdd.push({
            ...mainNewSession,
            id: `s-${Date.now()}-recur-${i}`,
            startTime: nextStartTime.toISOString(),
            endTime: new Date(nextStartTime.getTime() + duration).toISOString(),
            status: 'scheduled',
            notes: mainNewSession.notes ? `${mainNewSession.notes} (Recorrência ${i})` : `Sessão recorrente ${i}`,
            recurring: 'none', 
          });
        }
      }
      updatedSessions = [...sessions, ...sessionsToAdd];
    }
    
    const sortedSessions = updatedSessions.sort((a, b) => parseISO(b.startTime).getTime() - parseISO(a.startTime).getTime());
    setSessions(sortedSessions);
    await cacheService.patients.setSessions(patientId, sortedSessions); // Update cache

    setIsSessionFormOpen(false);
    setEditingSession(null);
  }, [patientId, editingSession, patient?.name, sessions]);


  if (isLoading && !patient) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32 mb-4" /> {/* Back button */}
        <Card className="shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 md:flex md:items-center md:gap-6">
            <Skeleton className="h-32 w-32 rounded-full mx-auto md:mx-0" />
            <div className="mt-4 md:mt-0 text-center md:text-left space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-40" />
            </div>
          </div>
          <CardContent className="p-6 space-y-6">
            <div>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-5 w-full" />
            </div>
            <Separator />
             <div>
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-9 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold mb-4">Paciente não encontrado</h2>
        <Button onClick={() => router.push('/patients')}>Voltar para lista de pacientes</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
      </Button>

      <Card className="shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 md:flex md:items-center md:gap-6">
          <Image 
            src={`https://placehold.co/128x128.png?text=${patient.name.charAt(0)}`} 
            alt={patient.name} 
            width={128} 
            height={128} 
            className="rounded-full border-4 border-background shadow-lg mx-auto md:mx-0"
            data-ai-hint="person avatar"
          />
          <div className="mt-4 md:mt-0 text-center md:text-left">
            <CardTitle className="text-3xl font-headline">{patient.name}</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              {patient.email && <span className="flex items-center justify-center md:justify-start mt-1"><Mail className="w-4 h-4 mr-2" /> {patient.email}</span>}
              {patient.phone && <span className="flex items-center justify-center md:justify-start mt-1"><Phone className="w-4 h-4 mr-2" /> {patient.phone}</span>}
              {patient.dateOfBirth && <span className="flex items-center justify-center md:justify-start mt-1"><CalendarDays className="w-4 h-4 mr-2" /> {format(parseISO(patient.dateOfBirth), "dd/MM/yyyy", { locale: ptBR })}</span>}
            </CardDescription>
          </div>
          <Button variant="outline" size="icon" className="absolute top-4 right-4 md:static md:ml-auto" onClick={() => setIsPatientFormOpen(true)}>
            <Edit className="h-5 w-5" /> <span className="sr-only">Editar Paciente</span>
          </Button>
        </div>

        <CardContent className="p-6 space-y-6">
          <div>
            <h3 className="text-xl font-headline font-semibold mb-2">Endereço</h3>
            <p className="text-muted-foreground">{patient.address || "Não informado"}</p>
          </div>
          <Separator />
          <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-headline font-semibold flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-primary"/> Histórico / Anotações Confidenciais
                </h3>
                <div className="flex gap-2">
                    {patient.previousSessionNotes && patient.previousSessionNotes.length > 0 && (
                        <Button variant="outline" size="sm" onClick={() => setIsHistoryDialogOpen(true)} disabled={!areNotesVisible && !(patient.previousSessionNotes && patient.previousSessionNotes.length > 0)}>
                            <History className="w-4 h-4 mr-2" /> Ver Versões Anteriores
                        </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => setAreNotesVisible(!areNotesVisible)}>
                        {areNotesVisible ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                        {areNotesVisible ? "Ocultar" : "Visualizar"}
                    </Button>
                </div>
            </div>
            {areNotesVisible ? (
                <ScrollArea className="h-40 w-full rounded-md border p-3 bg-muted/20 shadow-inner">
                    <pre className="whitespace-pre-wrap text-sm text-foreground font-body leading-relaxed">{patient.sessionNotes || "Nenhuma anotação registrada."}</pre>
                </ScrollArea>
            ) : (
                 <Alert variant="default" className="bg-muted/40 border-primary/30">
                    <Lock className="h-5 w-5 text-primary/80" />
                    <AlertTitle className="font-headline text-primary/90">Conteúdo Confidencial</AlertTitle>
                    <AlertDescription className="text-muted-foreground">
                        As anotações de sessão e seu histórico são confidenciais. Clique em "Visualizar" para exibir o conteúdo.
                        Lembre-se de ocultá-las ao se afastar. (Simulação de segurança)
                    </AlertDescription>
                </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-headline">Histórico de Sessões</CardTitle>
            <Button onClick={handleNewSession} size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Nova Sessão
            </Button>
        </CardHeader>
        <CardContent>
            {sessions.length > 0 ? (
                <ScrollArea className="h-72 pr-3">
                    <ul className="space-y-3">
                        {sessions.map(s => (
                            <li key={s.id} className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-sm">Data: {format(parseISO(s.startTime), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                                        <p className="text-xs text-muted-foreground">Com: {s.psychologistName || 'Psicólogo não informado'}</p>
                                        {s.recurring && s.recurring !== "none" && (
                                          <p className="text-xs text-muted-foreground flex items-center mt-0.5">
                                            <Repeat className="w-3 h-3 mr-1 text-blue-500" /> Recorrência: {recurrenceLabels[s.recurring] || s.recurring}
                                          </p>
                                        )}
                                        <Badge variant={s.status === 'completed' ? 'secondary' : s.status === 'scheduled' ? 'default' : 'outline'} className="mt-1 text-xs capitalize">
                                            {s.status === 'completed' ? 'Concluída' : s.status === 'scheduled' ? 'Agendada' : s.status}
                                        </Badge>
                                        {s.notes && <p className="text-xs text-muted-foreground mt-1 italic">Nota: {s.notes.substring(0,50)}...</p>}
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => handleEditSession(s)}>
                                        <Edit className="w-4 h-4 mr-1" /> Editar
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </ScrollArea>
            ) : (
                 isLoading ? <Skeleton className="h-20 w-full" /> : <p className="text-muted-foreground">Nenhuma sessão registrada para este paciente.</p>
            )}
        </CardContent>
      </Card>

      <PatientFormDialog 
        isOpen={isPatientFormOpen} 
        onOpenChange={setIsPatientFormOpen}
        patient={patient}
        onSave={handleSavePatient}
      />
      
      <SessionFormDialog
        isOpen={isSessionFormOpen}
        onOpenChange={setIsSessionFormOpen}
        session={editingSession}
        onSave={handleSaveSession}
      />

       <Dialog open={isHistoryDialogOpen && areNotesVisible} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="font-headline">Histórico de Anotações de Sessão</DialogTitle>
            <DialogDescription>
              Versões anteriores das anotações para {patient.name}. A mais recente está no topo.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-3">
            {patient.previousSessionNotes && patient.previousSessionNotes.length > 0 ? (
              <ul className="space-y-4">
                {patient.previousSessionNotes.map((noteVersion, index) => (
                  <li key={noteVersion.timestamp} className="border rounded-md p-3 bg-muted/20">
                    <p className="text-xs text-muted-foreground mb-1">
                      Salvo em: {format(parseISO(noteVersion.timestamp), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
                    </p>
                    <pre className="whitespace-pre-wrap text-sm font-body leading-relaxed">{noteVersion.content}</pre>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6">
                <Info className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Nenhum histórico de versões anteriores encontrado.</p>
              </div>
            )}
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHistoryDialogOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

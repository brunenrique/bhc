
"use client";
import { SessionCalendar } from "@/features/scheduling/components/SessionCalendar";
import { SessionFormDialog } from "@/features/scheduling/components/SessionFormDialog";
import { WaitingListTable } from "@/features/scheduling/components/WaitingListTable";
import { WaitingListEntryDialog } from "@/features/scheduling/components/WaitingListEntryDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Loader2, WifiOff, Wifi, ListPlus } from "lucide-react";
import { useState, useCallback, useEffect, useMemo } from "react";
import type { Session, WaitingListEntry } from "@/types";
import { addDays, addWeeks, addMonths, parseISO, subDays } from 'date-fns';
import { cacheService } from '@/services/cacheService';
import { useToast } from "@/hooks/use-toast";

const initialMockSessions: Session[] = [
  { id: 'sched1_ana_fut', patientId: '1', patientName: 'Ana Beatriz Silva', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo Silva', startTime: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(), endTime: new Date(new Date(new Date().setDate(new Date().getDate() + 2)).setHours(new Date().getHours() + 1)).toISOString(), status: 'scheduled', recurring: 'weekly' },
  { id: 'sched2_bruno_past_comp', patientId: '2', patientName: 'Bruno Almeida Costa', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo Silva', startTime: subDays(new Date(), 5).toISOString(), endTime: new Date(subDays(new Date(), 5).getTime() + 60*60*1000).toISOString(), status: 'completed', recurring: 'none', notes: "Sessão focada em TEPT." },
  { id: 'sched3_ana_today', patientId: '1', patientName: 'Ana Beatriz Silva', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo Silva', startTime: new Date(new Date().setHours(new Date().getHours() - 2)).toISOString(), endTime: new Date(new Date().setHours(new Date().getHours() - 1)).toISOString(), status: 'completed', recurring: 'none', notes: "Revisão de técnicas de relaxamento." },
  { id: 'sched4_carla_fut', patientId: '3', patientName: 'Carla Dias Oliveira', psychologistId: 'psy2', psychologistName: 'Dra. Modelo Souza', startTime: addDays(new Date(), 3).toISOString(), endTime: new Date(addDays(new Date(), 3).getTime() + 60*60*1000).toISOString(), status: 'scheduled' },
  { id: 'sched5_bruno_fut_recur', patientId: '2', patientName: 'Bruno Almeida Costa', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo Silva', startTime: addDays(new Date(), 7).toISOString(), endTime: new Date(addDays(new Date(), 7).getTime() + 60*60*1000).toISOString(), status: 'scheduled', recurring: 'weekly', notes: "Continuação TEPT" },
  { id: 'sched6_ana_past_noshow', patientId: '1', patientName: 'Ana Beatriz Silva', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo Silva', startTime: subDays(new Date(), 10).toISOString(), endTime: new Date(subDays(new Date(), 10).getTime() + 60*60*1000).toISOString(), status: 'no-show' },
  { id: 'sched7_carla_past_cancel', patientId: '3', patientName: 'Carla Dias Oliveira', psychologistId: 'psy2', psychologistName: 'Dra. Modelo Souza', startTime: subDays(new Date(), 12).toISOString(), endTime: new Date(subDays(new Date(), 12).getTime() + 60*60*1000).toISOString(), status: 'cancelled', notes: "Paciente remarcou." },
];

const initialMockWaitingList: WaitingListEntry[] = [
  { id: 'wl1', patientName: 'Mariana Lima', contactPhone: '(11) 99999-0001', reason: 'Primeira consulta, ansiedade', addedAt: subDays(new Date(), 2).toISOString(), status: 'waiting', preferredPsychologistName: 'Dra. Modelo Souza', preferredDays: 'Ter/Qui (Tarde)'},
  { id: 'wl2', patientName: 'João Pedro Santos', contactPhone: '(21) 98888-0002', reason: 'Acompanhamento', addedAt: subDays(new Date(), 5).toISOString(), status: 'contacted', preferredTimes: 'Após 18h'},
  { id: 'wl3', patientName: 'Sofia Oliveira', contactPhone: '(31) 97777-0003', reason: 'Retorno', addedAt: subDays(new Date(), 1).toISOString(), status: 'waiting'},
];


export default function SchedulingPage() {
  const [isSessionFormOpen, setIsSessionFormOpen] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date | undefined>(new Date());
  
  const [waitingList, setWaitingList] = useState<WaitingListEntry[]>([]);
  const [isWaitingListEntryDialogOpen, setIsWaitingListEntryDialogOpen] = useState(false);
  const [editingWaitingListEntry, setEditingWaitingListEntry] = useState<WaitingListEntry | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true); 
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const updateOnlineStatus = () => {
      if (isMounted) setIsOnline(navigator.onLine);
    };
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    if (typeof navigator !== "undefined") updateOnlineStatus(); 

    const loadData = async () => {
      setIsLoading(true);
      // Load Sessions
      try {
        const cachedSessions = await cacheService.sessions.getList();
        const pendingSessions = await cacheService.pendingSessions.getList();
        let combinedSessions = cachedSessions || [];
        if (pendingSessions) {
          const pendingSessionIds = new Set(pendingSessions.map(s => s.id));
          combinedSessions = combinedSessions.filter(s => !pendingSessionIds.has(s.id));
          combinedSessions = [...combinedSessions, ...pendingSessions];
        }
        
        if (isMounted && combinedSessions.length > 0) {
          setSessions(combinedSessions.sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime()));
        } else if (isMounted && initialMockSessions.length > 0 && (!cachedSessions || cachedSessions.length === 0) && (!pendingSessions || pendingSessions.length === 0) ) {
           const sortedMockSessions = initialMockSessions.sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime());
           setSessions(sortedMockSessions);
           await cacheService.sessions.setList(sortedMockSessions);
        }
      } catch (error) {
        if (isMounted) {
             const sortedMockSessions = initialMockSessions.sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime());
             setSessions(sortedMockSessions);
        }
      }

      // Load Waiting List
      try {
        const cachedWaitingList = await cacheService.waitingList.getList();
        if (isMounted && cachedWaitingList && cachedWaitingList.length > 0) {
          setWaitingList(cachedWaitingList);
        } else if (isMounted) {
          setWaitingList(initialMockWaitingList);
          await cacheService.waitingList.setList(initialMockWaitingList);
        }
      } catch (error) {
         if (isMounted) setWaitingList(initialMockWaitingList);
      }

      if (isMounted) setIsLoading(false);
    };

    loadData();

    return () => {
      isMounted = false;
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    const syncPendingSessions = async () => {
      if (isOnline) {
        const pending = await cacheService.pendingSessions.getList();
        if (pending && pending.length > 0) {
          let currentMainSessions = await cacheService.sessions.getList() || [];
          
          for (const pendingSession of pending) {
            const syncedSession = { ...pendingSession, isPendingSync: false };
            const indexInMain = currentMainSessions.findIndex(s => s.id === syncedSession.id);
            if (indexInMain > -1) {
              currentMainSessions[indexInMain] = syncedSession;
            } else {
              currentMainSessions.push(syncedSession);
            }
            setSessions(prev => {
                const existingIdx = prev.findIndex(s => s.id === syncedSession.id);
                if (existingIdx > -1) {
                    const updated = [...prev];
                    updated[existingIdx] = syncedSession;
                    return updated.sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime());
                }
                return [...prev, syncedSession].sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime());
            });
          }
          
          await cacheService.sessions.setList(currentMainSessions);
          await cacheService.pendingSessions.clear();
          
          toast({
            title: "Sincronização Concluída",
            description: `${pending.length} sessão(ões) pendente(s) foram sincronizadas.`,
            className: "bg-primary text-primary-foreground"
          });
        }
      }
    };
    if (isOnline) { // Check isOnline before running the effect
        syncPendingSessions();
    }
  }, [isOnline, toast]);

  const handleNewSession = useCallback(() => {
    setSelectedSession(null);
    setIsSessionFormOpen(true);
  }, []);

  const handleEditSession = useCallback((session: Session) => {
    setSelectedSession(session);
    setIsSessionFormOpen(true);
  }, []);

  const handleDateChange = useCallback((date?: Date) => {
    setCurrentCalendarDate(date);
  }, []);

  const handleSaveSession = useCallback(async (sessionData: Partial<Session>) => {
    const isCurrentlyOnline = navigator.onLine; 
    setIsOnline(isCurrentlyOnline); 

    let sessionToSave: Session;
    let updatedSessionsList: Session[];
    
    // Mock data for patient and psychologist names based on IDs
    // In a real app, this might come from a global store or fetched data
    const patientNameMap: Record<string, string> = {
      '1': 'Ana Beatriz Silva', // Assuming '1' is an ID for Ana
      '2': 'Bruno Almeida Costa', // Assuming '2' is an ID for Bruno
      '3': 'Carla Dias Oliveira',
      'p1': 'Ana Silva', // from SessionFormDialog mock
      'p2': 'Bruno Costa', // from SessionFormDialog mock
    };
    const psychologistNameMap: Record<string, string> = {
      'psy1': 'Dr. Exemplo Silva',
      'psy2': 'Dra. Modelo Souza',
    };

    if (selectedSession && sessionData.id) { 
      sessionToSave = { 
        ...selectedSession, 
        ...sessionData,
        patientName: sessionData.patientId ? patientNameMap[sessionData.patientId] || selectedSession.patientName : selectedSession.patientName,
        psychologistName: sessionData.psychologistId ? psychologistNameMap[sessionData.psychologistId] || selectedSession.psychologistName : selectedSession.psychologistName,
      } as Session;
      updatedSessionsList = sessions.map(s => (s.id === sessionToSave.id ? sessionToSave : s));
    } else { 
      const mainNewSession = { 
        ...sessionData, 
        id: `sess-${Date.now()}`, 
        patientName: sessionData.patientId ? patientNameMap[sessionData.patientId] : 'Novo Paciente', // Fallback name
        psychologistName: sessionData.psychologistId ? psychologistNameMap[sessionData.psychologistId] : 'Psicólogo Desconhecido', // Fallback name
      } as Session;
      
      const sessionsToAdd = [mainNewSession];
      if (mainNewSession.recurring && mainNewSession.recurring !== 'none' && mainNewSession.startTime) {
        const baseStartTime = parseISO(mainNewSession.startTime);
        const baseEndTime = mainNewSession.endTime ? parseISO(mainNewSession.endTime) : new Date(baseStartTime.getTime() + 60 * 60 * 1000);
        const duration = baseEndTime.getTime() - baseStartTime.getTime();
        let occurrencesToCreate = 4; 
        if (mainNewSession.recurring === 'daily') occurrencesToCreate = 6;

        for (let i = 1; i <= occurrencesToCreate; i++) {
          let nextStartTime: Date;
          if (mainNewSession.recurring === 'daily') nextStartTime = addDays(baseStartTime, i);
          else if (mainNewSession.recurring === 'weekly') nextStartTime = addWeeks(baseStartTime, i);
          else if (mainNewSession.recurring === 'monthly') nextStartTime = addMonths(baseStartTime, i);
          else break; 
          
          const nextEndTime = new Date(nextStartTime.getTime() + duration);
          sessionsToAdd.push({
            ...mainNewSession, 
            id: `sess-${Date.now()}-recur-${i}`, 
            startTime: nextStartTime.toISOString(),
            endTime: nextEndTime.toISOString(),
            status: 'scheduled', 
            notes: mainNewSession.notes ? `${mainNewSession.notes} (Recorrência ${i})` : `Sessão recorrente ${i}`,
            recurring: 'none', 
          });
        }
      }
      sessionToSave = sessionsToAdd[0];
      updatedSessionsList = [...sessions.filter(s => s.id !== sessionToSave.id), ...sessionsToAdd];
    }
    
    const finalSessionsToSave = updatedSessionsList.map(s => 
      s.id === sessionToSave.id ? { ...s, isPendingSync: !isCurrentlyOnline } : s
    );
    
    if (!isCurrentlyOnline) {
      await cacheService.pendingSessions.addOrUpdate({ ...sessionToSave, isPendingSync: true });
      toast({
        title: "Offline: Salvo Localmente",
        description: "A sessão foi salva localmente e será sincronizada.",
        variant: "default",
        className: "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
      });
    } else {
      await cacheService.sessions.setList(finalSessionsToSave.sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime()));
       toast({
        title: selectedSession ? "Sessão Atualizada" : "Sessão Agendada",
        description: "Os detalhes da sessão foram salvos.",
        className: "bg-primary text-primary-foreground"
      });
    }

    setSessions(finalSessionsToSave.sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime()));
    setIsSessionFormOpen(false);
    setSelectedSession(null); 
  }, [selectedSession, sessions, toast]);

  const handleOpenNewWaitingListEntryDialog = useCallback(() => {
    setEditingWaitingListEntry(null);
    setIsWaitingListEntryDialogOpen(true);
  }, []);

  const handleEditWaitingListEntry = useCallback((entry: WaitingListEntry) => {
    setEditingWaitingListEntry(entry);
    setIsWaitingListEntryDialogOpen(true);
  }, []);
  
  const handleSaveWaitingListEntry = useCallback(async (entryData: Partial<WaitingListEntry>) => {
    let updatedList;
    if (editingWaitingListEntry && entryData.id) {
      updatedList = waitingList.map(e => e.id === entryData.id ? { ...e, ...entryData } as WaitingListEntry : e);
      toast({ title: "Entrada Atualizada", description: "Dados da lista de espera atualizados." });
    } else {
      const newEntry: WaitingListEntry = {
        id: `wl-${Date.now()}`,
        addedAt: new Date().toISOString(),
        status: 'waiting',
        ...entryData,
      } as WaitingListEntry;
      updatedList = [newEntry, ...waitingList];
      toast({ title: "Adicionado à Lista de Espera", description: `${newEntry.patientName} foi adicionado(a).` });
    }
    setWaitingList(updatedList);
    await cacheService.waitingList.setList(updatedList);
    setIsWaitingListEntryDialogOpen(false);
    setEditingWaitingListEntry(null);
  }, [editingWaitingListEntry, waitingList, toast]);

  const handleDeleteWaitingListEntry = useCallback(async (entryId: string) => {
    const entryToDelete = waitingList.find(e => e.id === entryId);
    const updatedList = waitingList.filter(e => e.id !== entryId);
    setWaitingList(updatedList);
    await cacheService.waitingList.setList(updatedList);
    toast({ title: "Removido da Lista", description: `${entryToDelete?.patientName || 'A entrada'} foi removida.`, variant: "destructive" });
  }, [waitingList, toast]);

  const handleChangeWaitingListStatus = useCallback(async (entryId: string, status: WaitingListEntry['status']) => {
    const entryToUpdate = waitingList.find(e => e.id === entryId);
    if (!entryToUpdate) return;

    const updatedList = waitingList.map(e => e.id === entryId ? { ...e, status } : e);
    setWaitingList(updatedList);
    await cacheService.waitingList.setList(updatedList);
    toast({ title: "Status Atualizado", description: `Status de ${entryToUpdate.patientName} alterado para "${status}".` });
  }, [waitingList, toast]);
  
  const handleScheduleFromWaitingList = useCallback((entry: WaitingListEntry) => {
    setSelectedSession({
        id: '', 
        patientName: entry.patientName,
        patientId: entry.patientId || '', 
        psychologistId: entry.preferredPsychologistId || '',
        psychologistName: entry.preferredPsychologistName || '',
        startTime: new Date().toISOString(), 
        endTime: new Date(new Date().getTime() + 60*60*1000).toISOString(),
        status: 'scheduled',
        notes: `Agendado a partir da lista de espera. Motivo: ${entry.reason || 'N/A'}`,
    });
    setIsSessionFormOpen(true);
    handleChangeWaitingListStatus(entry.id, 'scheduled');
  }, [handleChangeWaitingListStatus]);
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-headline font-semibold">Agendamentos</h1>
        <div className="flex items-center gap-2">
           {isOnline ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-destructive" />}
            <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-destructive'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          <Button onClick={handleNewSession} className="shadow-md hover:shadow-lg transition-shadow">
            <PlusCircle className="mr-2 h-5 w-5" />
            Nova Sessão
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground font-body">
        Visualize e gerencie os agendamentos de sessões. {isOnline ? "Clique em uma data para ver detalhes ou em um horário vago para agendar." : "Você está offline. As sessões criadas serão salvas localmente e sincronizadas."}
      </p>
      
      {isLoading && sessions.length === 0 && waitingList.length === 0 ? (
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <>
        <SessionCalendar 
          sessions={sessions} 
          onDateChange={handleDateChange}
          onSelectSession={handleEditSession}
          currentCalendarDate={currentCalendarDate}
        />
        <div id="waiting-list" className="pt-8">
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div className="flex items-center gap-2">
                        <ListPlus className="h-6 w-6 text-primary" />
                        <CardTitle className="text-xl font-headline">Lista de Espera</CardTitle>
                    </div>
                    <Button onClick={handleOpenNewWaitingListEntryDialog} size="sm">
                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar à Lista
                    </Button>
                </CardHeader>
                <CardContent>
                    <WaitingListTable 
                        entries={waitingList}
                        onSchedule={handleScheduleFromWaitingList}
                        onEdit={handleEditWaitingListEntry}
                        onDelete={handleDeleteWaitingListEntry}
                        onChangeStatus={handleChangeWaitingListStatus}
                    />
                </CardContent>
            </Card>
        </div>
        </>
      )}

      <SessionFormDialog
        isOpen={isSessionFormOpen}
        onOpenChange={setIsSessionFormOpen}
        session={selectedSession}
        onSave={handleSaveSession}
      />
      <WaitingListEntryDialog
        isOpen={isWaitingListEntryDialogOpen}
        onOpenChange={setIsWaitingListEntryDialogOpen}
        entry={editingWaitingListEntry}
        onSave={handleSaveWaitingListEntry}
      />
    </div>
  );
}


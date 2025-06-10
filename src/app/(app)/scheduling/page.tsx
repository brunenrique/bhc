
"use client";
import { SessionCalendar } from "@/features/scheduling/components/SessionCalendar";
import { SessionFormDialog } from "@/features/scheduling/components/SessionFormDialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, WifiOff, Wifi } from "lucide-react";
import { useState, useCallback, useEffect, useMemo } from "react";
import type { Session } from "@/types";
import { addDays, addWeeks, addMonths, parseISO } from 'date-fns';
import { cacheService } from '@/services/cacheService';
import { useToast } from "@/hooks/use-toast";

const initialMockSessions: Session[] = [
  { id: '1', patientId: 'p1', patientName: 'Ana Silva', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo', startTime: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), endTime: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(new Date().getHours() + 1)).toISOString(), status: 'scheduled', recurring: 'weekly' },
  { id: '2', patientId: 'p2', patientName: 'Bruno Costa', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo', startTime: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(), endTime: new Date(new Date(new Date().setDate(new Date().getDate() + 2)).setHours(new Date().getHours() + 1)).toISOString(), status: 'completed', recurring: 'none' },
  { id: '3', patientId: 'p1', patientName: 'Ana Silva', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo', startTime: new Date(new Date().setHours(new Date().getHours() - 2)).toISOString(), endTime: new Date(new Date().setHours(new Date().getHours() - 1)).toISOString(), status: 'scheduled', recurring: 'none' },
];

export default function SchedulingPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [currentDate, setCurrentDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true); // Manage online status locally for sync logic
  const { toast } = useToast();

  // Effect for managing online/offline status and initial load
  useEffect(() => {
    let isMounted = true;

    const updateOnlineStatus = () => {
      if (isMounted) {
        setIsOnline(navigator.onLine);
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus(); // Initial check

    const loadSessions = async () => {
      setIsLoading(true);
      try {
        const cachedSessions = await cacheService.sessions.getList();
        const pendingSessions = await cacheService.pendingSessions.getList();
        let combinedSessions = cachedSessions || [];
        if (pendingSessions) {
          // Merge pending sessions, giving preference to pending if IDs match
          const pendingSessionIds = new Set(pendingSessions.map(s => s.id));
          combinedSessions = combinedSessions.filter(s => !pendingSessionIds.has(s.id));
          combinedSessions = [...combinedSessions, ...pendingSessions];
        }
        
        if (isMounted && combinedSessions.length > 0) {
          setSessions(combinedSessions.sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime()));
        } else if (isMounted && initialMockSessions.length > 0 && !cachedSessions && !pendingSessions) {
           // Only use initial mocks if cache is completely empty
           const sortedMockSessions = initialMockSessions.sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime());
           setSessions(sortedMockSessions);
           await cacheService.sessions.setList(sortedMockSessions);
        }
      } catch (error) {
        // console.warn("Error loading sessions from cache:", error);
      }
      // No need to simulate fetch for initial mock data if cache is primary source now
      if (isMounted) {
        setIsLoading(false);
      }
    };

    loadSessions();

    return () => {
      isMounted = false;
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Effect for syncing pending sessions when online status changes to true
  useEffect(() => {
    const syncPendingSessions = async () => {
      if (isOnline) {
        const pending = await cacheService.pendingSessions.getList();
        if (pending && pending.length > 0) {
          // console.log("Attempting to sync pending sessions:", pending);
          let currentMainSessions = await cacheService.sessions.getList() || [];
          
          for (const pendingSession of pending) {
            const syncedSession = { ...pendingSession, isPendingSync: false };
            const indexInMain = currentMainSessions.findIndex(s => s.id === syncedSession.id);
            if (indexInMain > -1) {
              currentMainSessions[indexInMain] = syncedSession;
            } else {
              currentMainSessions.push(syncedSession);
            }
            // Visually update immediately
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
    syncPendingSessions();
  }, [isOnline, toast]);


  const handleNewSession = useCallback(() => {
    setSelectedSession(null);
    setIsFormOpen(true);
  }, []);

  const handleEditSession = useCallback((session: Session) => {
    setSelectedSession(session);
    setIsFormOpen(true);
  }, []);

  const handleDateChange = useCallback((date?: Date) => {
    setCurrentDate(date);
  }, []);

  const handleSaveSession = useCallback(async (sessionData: Partial<Session>) => {
    const isCurrentlyOnline = navigator.onLine; // Check current status at time of save
    setIsOnline(isCurrentlyOnline); // Update local state for UI consistency

    let sessionToSave: Session;
    let updatedSessionsList: Session[];

    if (selectedSession && sessionData.id) { // Editing existing session
      sessionToSave = { ...selectedSession, ...sessionData } as Session;
      updatedSessionsList = sessions.map(s => (s.id === sessionToSave.id ? sessionToSave : s));
    } else { // Creating new session
      const mainNewSession = { 
        ...sessionData, 
        id: `sess-${Date.now()}`, 
        patientName: sessionData.patientId === 'p1' ? 'Ana Silva' : sessionData.patientId === 'p2' ? 'Bruno Costa' : 'Novo Paciente',
        psychologistName: sessionData.psychologistId === 'psy1' ? 'Dr. Exemplo' : 'Outro Psicólogo',
      } as Session;
      
      // Handle recurrence only for new sessions
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
      // For simplicity, we'll only handle the first session of recurrence for offline.
      // Proper offline recurrence would be more complex.
      sessionToSave = sessionsToAdd[0];
      updatedSessionsList = [...sessions.filter(s => s.id !== sessionToSave.id), ...sessionsToAdd];

    }
    
    if (!isCurrentlyOnline) {
      sessionToSave.isPendingSync = true;
      await cacheService.pendingSessions.addOrUpdate(sessionToSave);
      toast({
        title: "Offline: Salvo Localmente",
        description: "A sessão foi salva localmente e será sincronizada quando houver conexão.",
        variant: "default",
        className: "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
      });
    } else {
      sessionToSave.isPendingSync = false; // Ensure it's marked as synced
      const allSessionsToCache = updatedSessionsList.map(s => s.id === sessionToSave.id ? sessionToSave : s);
      await cacheService.sessions.setList(allSessionsToCache.sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime()));
       toast({
        title: session ? "Sessão Atualizada" : "Sessão Agendada",
        description: "Os detalhes da sessão foram salvos.",
        className: "bg-primary text-primary-foreground"
      });
    }

    setSessions(updatedSessionsList.sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime()));
    setIsFormOpen(false);
    setSelectedSession(null); 
  }, [selectedSession, sessions, toast]);
  
  return (
    <div className="space-y-6">
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
        Visualize e gerencie os agendamentos de sessões. {isOnline ? "Clique em uma data para ver detalhes ou em um horário vago para agendar." : "Você está offline. As sessões criadas serão salvas localmente e sincronizadas quando a conexão retornar."}
      </p>
      
      {isLoading && sessions.length === 0 ? (
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <SessionCalendar 
          sessions={sessions} 
          onDateChange={handleDateChange}
          onSelectSession={handleEditSession}
          currentCalendarDate={currentDate}
        />
      )}

      <SessionFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        session={selectedSession}
        onSave={handleSaveSession}
      />
    </div>
  );
}

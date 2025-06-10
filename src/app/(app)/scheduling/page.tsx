
"use client";
import { SessionCalendar } from "@/features/scheduling/components/SessionCalendar";
import { SessionFormDialog } from "@/features/scheduling/components/SessionFormDialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import type { Session } from "@/types";
import { addDays, addWeeks, addMonths, parseISO } from 'date-fns';
import { cacheService } from '@/services/cacheService';

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

  useEffect(() => {
    let isMounted = true;
    const loadSessions = async () => {
      setIsLoading(true);
      try {
        const cachedSessions = await cacheService.sessions.getList();
        if (isMounted && cachedSessions) {
          setSessions(cachedSessions.sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime()));
        }
      } catch (error) {
        // console.warn("Error loading sessions from cache:", error);
      }

      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (isMounted) {
        const sortedMockSessions = initialMockSessions.sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime());
        setSessions(sortedMockSessions);
        try {
          await cacheService.sessions.setList(sortedMockSessions);
        } catch (error) {
          // console.warn("Error saving sessions to cache:", error);
        }
        setIsLoading(false);
      }
    };
    loadSessions();
    return () => { isMounted = false; };
  }, []);


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
    let updatedSessions;
    if (selectedSession && sessionData.id) { 
      updatedSessions = sessions.map(s => (s.id === sessionData.id ? { ...s, ...sessionData } as Session : s));
    } else { 
      const mainNewSession = { 
        ...sessionData, 
        id: `sess-${Date.now()}`, 
        patientName: sessionData.patientId === 'p1' ? 'Ana Silva' : sessionData.patientId === 'p2' ? 'Bruno Costa' : 'Novo Paciente',
        psychologistName: sessionData.psychologistId === 'psy1' ? 'Dr. Exemplo' : 'Outro Psicólogo',
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
      updatedSessions = [...sessions, ...sessionsToAdd];
    }
    const sortedSessions = updatedSessions.sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime());
    setSessions(sortedSessions);
    await cacheService.sessions.setList(sortedSessions); 

    setIsFormOpen(false);
    setSelectedSession(null); 
  }, [selectedSession, sessions]);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-headline font-semibold">Agendamentos</h1>
        <Button onClick={handleNewSession} className="shadow-md hover:shadow-lg transition-shadow">
          <PlusCircle className="mr-2 h-5 w-5" />
          Nova Sessão
        </Button>
      </div>
      <p className="text-muted-foreground font-body">
        Visualize e gerencie os agendamentos de sessões. Clique em uma data para ver detalhes ou em um horário vago para agendar.
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

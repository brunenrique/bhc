
"use client";
import { SessionCalendar } from "@/components/scheduling/SessionCalendar";
import { SessionFormDialog } from "@/components/scheduling/SessionFormDialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState, useCallback } from "react";
import type { Session } from "@/types";
import { addDays, addWeeks, addMonths, parseISO } from 'date-fns';

const initialMockSessions: Session[] = [
  { id: '1', patientId: 'p1', patientName: 'Ana Silva', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo', startTime: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), endTime: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(new Date().getHours() + 1)).toISOString(), status: 'scheduled', recurring: 'weekly' },
  { id: '2', patientId: 'p2', patientName: 'Bruno Costa', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo', startTime: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(), endTime: new Date(new Date(new Date().setDate(new Date().getDate() + 2)).setHours(new Date().getHours() + 1)).toISOString(), status: 'completed', recurring: 'none' },
  { id: '3', patientId: 'p1', patientName: 'Ana Silva', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo', startTime: new Date(new Date().setHours(new Date().getHours() - 2)).toISOString(), endTime: new Date(new Date().setHours(new Date().getHours() - 1)).toISOString(), status: 'scheduled', recurring: 'none' },
];

export default function SchedulingPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [sessions, setSessions] = useState<Session[]>(initialMockSessions);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [currentDate, setCurrentDate] = useState<Date | undefined>(new Date());

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

  const handleSaveSession = useCallback((sessionData: Partial<Session>) => {
    if (selectedSession && sessionData.id) { 
      // Editing existing session - only updates the specific instance for now
      setSessions(prev => 
        prev.map(s => (s.id === sessionData.id ? { ...s, ...sessionData } as Session : s))
            .sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime())
      );
    } else { 
      // Creating new session
      const mainNewSession = { 
        ...sessionData, 
        id: `sess-${Date.now()}`, 
        patientName: sessionData.patientId === 'p1' ? 'Ana Silva' : sessionData.patientId === 'p2' ? 'Bruno Costa' : 'Novo Paciente',
        psychologistName: sessionData.psychologistId === 'psy1' ? 'Dr. Exemplo' : 'Outro Psicólogo',
      } as Session;

      const sessionsToAdd = [mainNewSession];

      // Generate recurring sessions if applicable for the new session
      if (mainNewSession.recurring && mainNewSession.recurring !== 'none' && mainNewSession.startTime) {
        const baseStartTime = parseISO(mainNewSession.startTime);
        // Ensure endTime exists and is valid, default to 1 hour duration if not
        const baseEndTime = mainNewSession.endTime ? parseISO(mainNewSession.endTime) : new Date(baseStartTime.getTime() + 60 * 60 * 1000);
        const duration = baseEndTime.getTime() - baseStartTime.getTime();
        let occurrencesToCreate = 4; // Default for weekly/monthly

        if (mainNewSession.recurring === 'daily') {
          occurrencesToCreate = 6; // Next 6 days
        }

        for (let i = 1; i <= occurrencesToCreate; i++) {
          let nextStartTime: Date;
          if (mainNewSession.recurring === 'daily') {
            nextStartTime = addDays(baseStartTime, i);
          } else if (mainNewSession.recurring === 'weekly') {
            nextStartTime = addWeeks(baseStartTime, i);
          } else if (mainNewSession.recurring === 'monthly') {
            nextStartTime = addMonths(baseStartTime, i);
          } else {
            break; 
          }
          const nextEndTime = new Date(nextStartTime.getTime() + duration);
          
          sessionsToAdd.push({
            ...mainNewSession, // Copy details from main session
            id: `sess-${Date.now()}-recur-${i}`, // Unique ID for recurring instance
            startTime: nextStartTime.toISOString(),
            endTime: nextEndTime.toISOString(),
            status: 'scheduled', // Future recurring sessions are scheduled
            notes: mainNewSession.notes ? `${mainNewSession.notes} (Recorrência ${i})` : `Sessão recorrente ${i}`,
            recurring: 'none', // Individual instances do not recur further by themselves
          });
        }
      }
      setSessions(prev => [...prev, ...sessionsToAdd].sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime()));
    }
    setIsFormOpen(false);
    setSelectedSession(null); 
  }, [selectedSession]);
  
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
      
      <SessionCalendar 
        sessions={sessions} 
        onDateChange={handleDateChange}
        onSelectSession={handleEditSession}
        currentCalendarDate={currentDate}
      />

      <SessionFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        session={selectedSession}
        onSave={handleSaveSession}
      />
    </div>
  );
}

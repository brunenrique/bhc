"use client";
import { SessionCalendar } from "@/components/scheduling/SessionCalendar";
import { SessionFormDialog } from "@/components/scheduling/SessionFormDialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState, useCallback } from "react";
import type { Session } from "@/types";

const initialMockSessions: Session[] = [
  { id: '1', patientId: 'p1', patientName: 'Ana Silva', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo', startTime: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), endTime: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(new Date().getHours() + 1)).toISOString(), status: 'scheduled' },
  { id: '2', patientId: 'p2', patientName: 'Bruno Costa', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo', startTime: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(), endTime: new Date(new Date(new Date().setDate(new Date().getDate() + 2)).setHours(new Date().getHours() + 1)).toISOString(), status: 'completed' },
  { id: '3', patientId: 'p1', patientName: 'Ana Silva', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo', startTime: new Date(new Date().setHours(new Date().getHours() - 2)).toISOString(), endTime: new Date(new Date().setHours(new Date().getHours() - 1)).toISOString(), status: 'scheduled' },
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
    console.log("Saving session:", sessionData);
    if (selectedSession && sessionData.id) { // Editing existing
      setSessions(prev => prev.map(s => s.id === sessionData.id ? {...s, ...sessionData } as Session : s));
    } else { // Creating new
      const newSession = { 
        ...sessionData, 
        id: `sess-${Date.now()}`, 
        // Mock patient/psychologist names if IDs are present
        patientName: sessionData.patientId === 'p1' ? 'Ana Silva' : sessionData.patientId === 'p2' ? 'Bruno Costa' : 'Novo Paciente',
        psychologistName: sessionData.psychologistId === 'psy1' ? 'Dr. Exemplo' : 'Outro Psicólogo',
      } as Session;
      setSessions(prev => [newSession, ...prev]);
    }
    setIsFormOpen(false);
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

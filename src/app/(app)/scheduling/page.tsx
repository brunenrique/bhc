"use client";
import { SessionCalendar } from "@/components/features/scheduling/SessionCalendar";
import { SessionFormDialog } from "@/components/features/scheduling/SessionFormDialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import type { Session } from "@/types";

export default function SchedulingPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [currentDate, setCurrentDate] = useState<Date | undefined>(new Date());

  const handleNewSession = () => {
    setSelectedSession(null);
    setIsFormOpen(true);
  };

  const handleEditSession = (session: Session) => {
    setSelectedSession(session);
    setIsFormOpen(true);
  }

  const handleDateChange = (date?: Date) => {
    setCurrentDate(date);
    // Potentially fetch sessions for the new date/month
  };

  const mockSessions: Session[] = [
    { id: '1', patientId: 'p1', patientName: 'Ana Silva', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo', startTime: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), endTime: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(new Date().getHours() + 1)).toISOString(), status: 'scheduled' },
    { id: '2', patientId: 'p2', patientName: 'Bruno Costa', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo', startTime: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(), endTime: new Date(new Date(new Date().setDate(new Date().getDate() + 2)).setHours(new Date().getHours() + 1)).toISOString(), status: 'completed' },
  ];
  
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
        sessions={mockSessions} 
        onDateChange={handleDateChange}
        onSelectSession={handleEditSession}
        currentCalendarDate={currentDate}
      />

      <SessionFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        session={selectedSession}
        onSave={(sessionData) => {
          console.log("Saving session:", sessionData);
          // Add logic to save/update session (e.g., call API, update Zustand store)
          // For prototype, just close and log.
          setIsFormOpen(false);
        }}
      />
    </div>
  );
}

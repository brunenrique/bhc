
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventInput, EventDropArg, EventClickArg } from '@fullcalendar/core';
import { useAuth } from '@/hooks/useAuth';
import type { FirestoreSessionData, UserRole, MockTimestamp } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CalendarDays } from 'lucide-react';

// FullCalendar React components should handle their own CSS,
// or global CSS should be imported in layout.tsx if necessary.
// Removing these direct imports as they cause "Module not found".
// import '@fullcalendar/core/main.css';
// import '@fullcalendar/daygrid/main.css';
// import '@fullcalendar/timegrid/main.css';

// Helper to convert MockTimestamp to Date
const timestampToDate = (timestamp: MockTimestamp): Date => {
  return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
};

// Helper to create MockTimestamp (for mock data)
const dateToMockTimestamp = (date: Date): MockTimestamp => {
  const seconds = Math.floor(date.getTime() / 1000);
  const nanoseconds = (date.getTime() % 1000) * 1000000;
  return { seconds, nanoseconds, toDate: () => date };
};

// Mock Firestore data (replace with actual Firestore fetching)
const MOCK_SESSIONS: FirestoreSessionData[] = [
  { id: 'sess1', pacienteId: 'p1', psicologoId: 'psyA', data: dateToMockTimestamp(new Date(new Date().setDate(new Date().getDate() + 1))), status: 'agendada', patientName: 'João Silva', psychologistName: 'Dr. Carlos' },
  { id: 'sess2', pacienteId: 'p2', psicologoId: 'psyB', data: dateToMockTimestamp(new Date(new Date().setDate(new Date().getDate() + 2))), status: 'agendada', patientName: 'Maria Oliveira', psychologistName: 'Dra. Ana' },
  { id: 'sess3', pacienteId: 'p3', psicologoId: 'psyA', data: dateToMockTimestamp(new Date(new Date().setDate(new Date().getDate() -1))), status: 'concluída', titulo: 'Sessão de Acompanhamento - P3', patientName: 'Pedro Souza', psychologistName: 'Dr. Carlos' },
  { id: 'sess4', pacienteId: 'p4', psicologoId: 'psyC', data: dateToMockTimestamp(new Date()), status: 'agendada', patientName: 'Laura Costa', psychologistName: 'Dr. Ricardo (Admin)' },
];


export function InteractiveCalendar() {
  const { user, isLoading: authLoading } = useAuth();
  const [events, setEvents] = useState<EventInput[]>([]);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(true);
  const { toast } = useToast();

  const fetchAndSetSessions = useCallback(async () => {
    if (authLoading || !user) {
      setIsLoadingCalendar(true);
      return;
    }
    setIsLoadingCalendar(true);

    // --- TODO: Implement actual Firestore query ---
    // This is a MOCK implementation.
    await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API delay

    let filteredSessions: FirestoreSessionData[] = [];
    if (user.role === 'admin') {
      filteredSessions = MOCK_SESSIONS;
    } else if (user.role === 'psychologist') {
      filteredSessions = MOCK_SESSIONS.filter(session => session.psicologoId === user.id);
    } else {
      // Secretaries/Schedulers might see all or based on specific logic not defined in request
      // For now, let's assume they see all like admins for broad overview, or adjust as needed.
      filteredSessions = MOCK_SESSIONS;
    }
    // --- End of MOCK implementation ---

    const calendarEvents = filteredSessions.map((session: FirestoreSessionData) => ({
      id: session.id,
      title: session.titulo || `Sessão com ${session.patientName || 'Paciente'} (${session.psychologistName || 'Psicólogo'})`,
      start: timestampToDate(session.data),
      allDay: false, // Clinical sessions are typically not all-day
      extendedProps: {
        pacienteId: session.pacienteId,
        psicologoId: session.psicologoId,
        status: session.status,
      },
      // Optionally set event color based on status
      backgroundColor: session.status === 'concluída' ? 'hsl(var(--muted))' : session.status === 'cancelada' ? 'hsl(var(--destructive) / 0.7)' : 'hsl(var(--primary))',
      borderColor: session.status === 'concluída' ? 'hsl(var(--muted-foreground))' : session.status === 'cancelada' ? 'hsl(var(--destructive))' : 'hsl(var(--primary))',
      textColor: session.status === 'concluída' ? 'hsl(var(--muted-foreground))' : 'hsl(var(--primary-foreground))',
    }));

    setEvents(calendarEvents);
    setIsLoadingCalendar(false);
  }, [user, authLoading]);

  useEffect(() => {
    fetchAndSetSessions();
  }, [fetchAndSetSessions]);

  const handleEventDrop = async (dropInfo: EventDropArg) => {
    toast({
      title: "Sessão Reagendada (Simulado)",
      description: `Sessão "${dropInfo.event.title}" movida para ${dropInfo.event.start?.toLocaleString()}.`,
    });

    // --- TODO: Implement actual Firestore update ---
    // In a real app:
    // const sessionId = dropInfo.event.id;
    // const newStartDate = dropInfo.event.start;
    // if (sessionId && newStartDate) {
    //   const sessionRef = doc(db, "sessions", sessionId);
    //   try {
    //     await updateDoc(sessionRef, {
    //       data: Timestamp.fromDate(newStartDate) // Convert JS Date to Firestore Timestamp
    //     });
    //     // Optionally refetch events or update local state optimistically
    //     fetchAndSetSessions();
    //   } catch (error) {
    //     console.error("Error updating session: ", error);
    //     toast({ title: "Erro ao Reagendar", description: "Não foi possível salvar a alteração.", variant: "destructive"});
    //     dropInfo.revert(); // Revert the change in the calendar UI
    //   }
    // }
    // --- End of MOCK implementation ---

    // For simulation, update local state if not reverting
     setEvents(prevEvents => prevEvents.map(event => {
      if (event.id === dropInfo.event.id) {
        return { ...event, start: dropInfo.event.start, end: dropInfo.event.end };
      }
      return event;
    }));
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    toast({
      title: `Sessão: ${clickInfo.event.title}`,
      description: `Início: ${clickInfo.event.start?.toLocaleString()}. Status: ${clickInfo.event.extendedProps.status}. (Clique simulado)`,
      // TODO: Implement modal opening or redirect to session details page
      // Example: router.push(`/sessions/${clickInfo.event.id}`);
    });
  };

  if (authLoading || isLoadingCalendar) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><CalendarDays className="mr-2 h-6 w-6 text-primary" /> Calendário Interativo</CardTitle>
          <CardDescription>Carregando sessões...</CardDescription>
        </CardHeader>
        <CardContent className="h-[600px] flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline flex items-center"><CalendarDays className="mr-2 h-6 w-6 text-primary" /> Calendário Interativo</CardTitle>
        <CardDescription>Visualize, agende e arraste sessões. Os dados são simulados.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[600px] text-sm"> {/* Ensure parent has height for FullCalendar */}
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            initialView="timeGridWeek"
            locale="pt-br" // For Brazilian Portuguese button text and date formats
            buttonText={{
                today:    'Hoje',
                month:    'Mês',
                week:     'Semana',
                day:      'Dia',
            }}
            allDaySlot={false} // Usually sessions are not all-day
            events={events}
            editable={true} // Allows dragging
            droppable={false} // If you had external draggables
            eventDrop={handleEventDrop}
            eventClick={handleEventClick}
            selectable={true} // Allows selecting time slots
            // select={(selectInfo) => {
            //   // TODO: Implement logic to open a modal to create a new session
            //   toast({ title: "Seleção de Horário", description: `De ${selectInfo.startStr} a ${selectInfo.endStr}`});
            // }}
            height="100%" // Make calendar fill the container height
            contentHeight="auto"
            slotMinTime="08:00:00" // Example: Show hours from 8 AM
            slotMaxTime="21:00:00" // Example: Show hours until 9 PM
            nowIndicator={true}
            scrollTime={'09:00:00'} // Scroll to 9 AM on load
            eventTimeFormat={{ // Example: 10:30 AM
                hour: '2-digit',
                minute: '2-digit',
                meridiem: false,
                hour12: false
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

    
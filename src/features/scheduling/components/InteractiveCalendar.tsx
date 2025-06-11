
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
  { id: 'sess5', pacienteId: 'p1', psicologoId: 'psyA', data: dateToMockTimestamp(new Date(new Date().setDate(new Date().getDate() + 3))), status: 'cancelada', patientName: 'João Silva', psychologistName: 'Dr. Carlos' },
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

    await new Promise(resolve => setTimeout(resolve, 700)); 

    let filteredSessions: FirestoreSessionData[] = [];
    if (user.role === 'admin') {
      filteredSessions = MOCK_SESSIONS;
    } else if (user.role === 'psychologist') {
      filteredSessions = MOCK_SESSIONS.filter(session => session.psicologoId === user.id);
    } else {
      filteredSessions = MOCK_SESSIONS;
    }

    const calendarEvents = filteredSessions.map((session: FirestoreSessionData) => ({
      id: session.id,
      title: session.titulo || `Sessão com ${session.patientName || 'Paciente'} (${session.psychologistName || 'Psicólogo'})`,
      start: timestampToDate(session.data),
      allDay: false, 
      extendedProps: {
        pacienteId: session.pacienteId,
        psicologoId: session.psicologoId,
        status: session.status,
      },
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
    // TODO: Implement actual Firestore update
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
        <div className="h-[650px] text-sm"> {/* Increased height slightly */}
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            initialView="timeGridWeek"
            locale="pt-br"
            buttonText={{
                today:    'Hoje',
                month:    'Mês',
                week:     'Semana',
                day:      'Dia',
            }}
            allDaySlot={false} 
            events={events}
            editable={true} 
            droppable={false} 
            eventDrop={handleEventDrop}
            eventClick={handleEventClick}
            selectable={true} 
            select={(selectInfo) => {
              toast({ title: "Seleção de Horário (Simulado)", description: `Novo evento de ${selectInfo.startStr} a ${selectInfo.endStr}. Implementar abertura de modal.`});
            }}
            height="100%" 
            contentHeight="auto"
            slotMinTime="08:00:00" 
            slotMaxTime="21:00:00" 
            nowIndicator={true}
            scrollTime={'09:00:00'} 
            eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                meridiem: false,
                hour12: false
            }}
            slotLabelFormat={{ // Display time in slots in 24h format
                hour: '2-digit',
                minute: '2-digit',
                meridiem: false,
                hour12: false
            }}
            dayHeaderFormat={{ // Format for day headers in week/day views
                weekday: 'short', // 'Dom', 'Seg', etc.
                day: 'numeric',   // '1', '2', etc.
                month: 'numeric', // '6' for Junho, etc. - optional
                omitCommas: true
            }}
            weekends={true} // Explicitly show weekends
            businessHours={{ // Optionally highlight business hours
              daysOfWeek: [ 1, 2, 3, 4, 5 ], // Monday - Friday
              startTime: '09:00',
              endTime: '18:00',
            }}
            eventDisplay="block" // Ensures events take full width and stack nicely
            displayEventEnd={true} // Show event end times
          />
        </div>
      </CardContent>
    </Card>
  );
}


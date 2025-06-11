
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
import { addDays, subDays } from 'date-fns';

const timestampToDate = (timestamp: MockTimestamp): Date => {
  return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
};

const dateToMockTimestamp = (date: Date): MockTimestamp => {
  const seconds = Math.floor(date.getTime() / 1000);
  const nanoseconds = (date.getTime() % 1000) * 1000000;
  return { seconds, nanoseconds, toDate: () => date };
};

const createFutureDate = (daysInFuture: number, hour: number = 10, minute: number = 0): Date => {
  const date = addDays(new Date(), daysInFuture);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const createPastDate = (daysInPast: number, hour: number = 10, minute: number = 0): Date => {
  const date = subDays(new Date(), daysInPast);
  date.setHours(hour, minute, 0, 0);
  return date;
};


const MOCK_SESSIONS: FirestoreSessionData[] = [
  { id: 'cal_sess1', pacienteId: '1', psicologoId: 'psy1', data: dateToMockTimestamp(createFutureDate(1, 10)), status: 'agendada', patientName: 'Ana Beatriz Silva', psychologistName: 'Dr. Exemplo Silva' },
  { id: 'cal_sess2', pacienteId: '2', psicologoId: 'psy1', data: dateToMockTimestamp(createFutureDate(2, 14)), status: 'agendada', patientName: 'Bruno Almeida Costa', psychologistName: 'Dr. Exemplo Silva' },
  { id: 'cal_sess3', pacienteId: '3', psicologoId: 'psy2', data: dateToMockTimestamp(createPastDate(1, 11)), status: 'concluída', titulo: 'Sessão Concluída - Carla', patientName: 'Carla Dias Oliveira', psychologistName: 'Dra. Modelo Souza' },
  { id: 'cal_sess4', pacienteId: '4', psicologoId: 'psy1', data: dateToMockTimestamp(createFutureDate(0, 16)), status: 'agendada', patientName: 'Daniel Farias Lima', psychologistName: 'Dr. Exemplo Silva' },
  { id: 'cal_sess5', pacienteId: '1', psicologoId: 'psy1', data: dateToMockTimestamp(createFutureDate(3, 11)), status: 'cancelada', patientName: 'Ana Beatriz Silva', psychologistName: 'Dr. Exemplo Silva' },
  { id: 'cal_sess6', pacienteId: '7', psicologoId: 'psy1', data: dateToMockTimestamp(createFutureDate(1, 15)), status: 'agendada', patientName: 'Gabriela Martins Azevedo', psychologistName: 'Dr. Exemplo Silva' },
  { id: 'cal_sess7', pacienteId: '8', psicologoId: 'other-psy-uid', data: dateToMockTimestamp(createFutureDate(4, 9)), status: 'agendada', patientName: 'Hugo Pereira da Silva', psychologistName: 'Dr. Convidado' },
  { id: 'cal_sess8', pacienteId: '9', psicologoId: 'psy2', data: dateToMockTimestamp(createFutureDate(2, 17)), status: 'agendada', patientName: 'Isabela Santos Rocha', psychologistName: 'Dra. Modelo Souza' },
  { id: 'cal_sess9', pacienteId: '10', psicologoId: 'psy1', data: dateToMockTimestamp(createPastDate(3, 14)), status: 'concluída', patientName: 'Lucas Mendes Oliveira', psychologistName: 'Dr. Exemplo Silva' },
  { id: 'cal_sess10', pacienteId: '5', psicologoId: 'psy2', data: dateToMockTimestamp(createFutureDate(5, 10)), status: 'agendada', patientName: 'Eduarda Gomes Ferreira', psychologistName: 'Dra. Modelo Souza' },
  { id: 'cal_sess11', pacienteId: '1', psicologoId: 'psy1', data: dateToMockTimestamp(new Date(new Date().getFullYear(), new Date().getMonth(), 15, 11, 0)), status: 'agendada', patientName: 'Ana B. Silva (Mensal)', psychologistName: 'Dr. Exemplo Silva', titulo: 'Sessão Recorrente Ana' },
  { id: 'cal_sess12', pacienteId: '2', psicologoId: 'psy1', data: dateToMockTimestamp(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 2, 16, 0)), status: 'agendada', patientName: 'Bruno A. Costa (Próx. Mês)', psychologistName: 'Dr. Exemplo Silva' },
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
      // Mocking psychologist assignment, replace 'psy1'/'psy2' with actual logic or user.id
      const psychologistMockId = user.name === 'Dr. Exemplo Silva' ? 'psy1' : user.name === 'Dra. Modelo Souza' ? 'psy2' : user.id;
      filteredSessions = MOCK_SESSIONS.filter(session => session.psicologoId === psychologistMockId || session.psicologoId === user.id);
    } else { // Secretaries and Schedulers might see all or based on complex rules not mocked here
      filteredSessions = MOCK_SESSIONS;
    }

    const calendarEvents = filteredSessions.map((session: FirestoreSessionData) => ({
      id: session.id,
      title: session.titulo || `Sessão: ${session.patientName || 'Paciente'} (${session.psychologistName || 'Psicólogo'})`,
      start: timestampToDate(session.data),
      allDay: false, 
      extendedProps: {
        pacienteId: session.pacienteId,
        psicologoId: session.psicologoId,
        status: session.status,
        patientName: session.patientName,
        psychologistName: session.psychologistName,
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
     setEvents(prevEvents => prevEvents.map(event => {
      if (event.id === dropInfo.event.id) {
        return { ...event, start: dropInfo.event.start, end: dropInfo.event.end };
      }
      return event;
    }));
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const { patientName, psychologistName, status } = clickInfo.event.extendedProps;
    toast({
      title: `Sessão: ${patientName || 'Paciente'} com ${psychologistName || 'Psicólogo'}`,
      description: `Início: ${clickInfo.event.start?.toLocaleString()}. Status: ${status}. (Clique simulado para edição/detalhes)`,
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
        <div className="h-[650px] text-sm"> 
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
            slotLabelFormat={{ 
                hour: '2-digit',
                minute: '2-digit',
                meridiem: false,
                hour12: false
            }}
            dayHeaderFormat={{ 
                weekday: 'short', 
                day: 'numeric',   
                month: 'numeric', 
                omitCommas: true
            }}
            weekends={true} 
            businessHours={{ 
              daysOfWeek: [ 1, 2, 3, 4, 5 ], 
              startTime: '09:00',
              endTime: '18:00',
            }}
            eventDisplay="block" 
            displayEventEnd={true} 
          />
        </div>
      </CardContent>
    </Card>
  );
}
    
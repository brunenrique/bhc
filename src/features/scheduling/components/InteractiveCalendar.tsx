
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
import { Loader2, CalendarDays, MapPin } from 'lucide-react';
import { addDays, subDays, startOfWeek } from 'date-fns';

const timestampToDate = (timestamp: MockTimestamp): Date => {
  return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
};

const dateToMockTimestamp = (date: Date): MockTimestamp => {
  const seconds = Math.floor(date.getTime() / 1000);
  const nanoseconds = (date.getTime() % 1000) * 1000000;
  return { seconds, nanoseconds, toDate: () => date };
};

const createFutureDateISO = (daysInFuture: number, hour: number = 10, minute: number = 0): string => {
  const date = addDays(new Date(), daysInFuture);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const createPastDateISO = (daysInPast: number, hour: number = 10, minute: number = 0): string => {
  const date = subDays(new Date(), daysInPast);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const MOCK_SESSIONS: FirestoreSessionData[] = [
  { id: 'cal_sess1', pacienteId: '1', psicologoId: 'psy1', data: dateToMockTimestamp(new Date(createFutureDateISO(1, 10))), status: 'agendada', patientName: 'Ana Beatriz Silva', psychologistName: 'Dr. Exemplo Silva' },
  { id: 'cal_sess2', pacienteId: '2', psicologoId: 'psy1', data: dateToMockTimestamp(new Date(createFutureDateISO(2, 14))), status: 'agendada', patientName: 'Bruno Almeida Costa', psychologistName: 'Dr. Exemplo Silva' },
  { id: 'cal_sess3', pacienteId: '3', psicologoId: 'psy2', data: dateToMockTimestamp(new Date(createPastDateISO(1, 11))), status: 'concluída', titulo: 'Sessão Concluída - Carla', patientName: 'Carla Dias Oliveira', psychologistName: 'Dra. Modelo Souza' },
  { id: 'cal_sess4', pacienteId: '4', psicologoId: 'psy1', data: dateToMockTimestamp(new Date(createFutureDateISO(0, 16))), status: 'agendada', patientName: 'Daniel Farias Lima', psychologistName: 'Dr. Exemplo Silva' },
  { id: 'cal_sess5', pacienteId: '1', psicologoId: 'psy1', data: dateToMockTimestamp(new Date(createFutureDateISO(3, 11))), status: 'cancelada', patientName: 'Ana Beatriz Silva', psychologistName: 'Dr. Exemplo Silva' },
  { id: 'cal_sess6', pacienteId: '7', psicologoId: 'psy1', data: dateToMockTimestamp(new Date(createFutureDateISO(1, 15))), status: 'agendada', patientName: 'Gabriela Martins Azevedo', psychologistName: 'Dr. Exemplo Silva' },
  { id: 'cal_sess7', pacienteId: '8', psicologoId: 'other-psy-uid', data: dateToMockTimestamp(new Date(createFutureDateISO(4, 9))), status: 'agendada', patientName: 'Hugo Pereira da Silva', psychologistName: 'Dr. Convidado' },
  { id: 'cal_sess8', pacienteId: '9', psicologoId: 'psy2', data: dateToMockTimestamp(new Date(createFutureDateISO(2, 17))), status: 'agendada', patientName: 'Isabela Santos Rocha', psychologistName: 'Dra. Modelo Souza' },
  { id: 'cal_sess9', pacienteId: '10', psicologoId: 'psy1', data: dateToMockTimestamp(new Date(createPastDateISO(3, 14))), status: 'concluída', patientName: 'Lucas Mendes Oliveira', psychologistName: 'Dr. Exemplo Silva' },
  { id: 'cal_sess10', pacienteId: '5', psicologoId: 'psy2', data: dateToMockTimestamp(new Date(createFutureDateISO(5, 10))), status: 'agendada', patientName: 'Eduarda Gomes Ferreira', psychologistName: 'Dra. Modelo Souza' },
  { id: 'cal_sess11', pacienteId: '1', psicologoId: 'psy1', data: dateToMockTimestamp(new Date(new Date().getFullYear(), new Date().getMonth(), 15, 11, 0)), status: 'agendada', patientName: 'Ana B. Silva (Mensal)', psychologistName: 'Dr. Exemplo Silva', titulo: 'Sessão Recorrente Ana' },
  { id: 'cal_sess12', pacienteId: '2', psicologoId: 'psy1', data: dateToMockTimestamp(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 2, 16, 0)), status: 'agendada', patientName: 'Bruno A. Costa (Próx. Mês)', psychologistName: 'Dr. Exemplo Silva' },
];

interface InteractiveCalendarProps {
  locationName: 'Centro' | 'Fazendinha';
}

export function InteractiveCalendar({ locationName }: InteractiveCalendarProps) {
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

    // TODO: Adapt this logic to filter sessions/availability by `locationName`
    let filteredSessions: FirestoreSessionData[] = [];
    if (user.role === 'admin') {
      filteredSessions = MOCK_SESSIONS; // Admins see all for now
    } else if (user.role === 'psychologist') {
      const psychologistMockId = user.name === 'Dr. Exemplo Silva' ? 'psy1' : user.name === 'Dra. Modelo Souza' ? 'psy2' : user.id;
      filteredSessions = MOCK_SESSIONS.filter(session => session.psicologoId === psychologistMockId || session.psicologoId === user.id);
    } else { 
      filteredSessions = MOCK_SESSIONS; // Other roles see all for now
    }

    const calendarEvents = filteredSessions.map((session: FirestoreSessionData) => ({
      id: session.id + `_${locationName}`, // Make event IDs unique per calendar instance
      title: session.titulo || `Sessão: ${session.patientName || 'Paciente'} (${session.psychologistName || 'Psicólogo'})`,
      start: timestampToDate(session.data),
      allDay: false, 
      extendedProps: {
        pacienteId: session.pacienteId,
        psicologoId: session.psicologoId,
        status: session.status,
        patientName: session.patientName,
        psychologistName: session.psychologistName,
        location: locationName, // Add location to extendedProps
      },
      // For now, using same colors. Will change when showing availability.
      backgroundColor: session.status === 'concluída' ? 'hsl(var(--muted))' : session.status === 'cancelada' ? 'hsl(var(--destructive) / 0.7)' : 'hsl(var(--primary))',
      borderColor: session.status === 'concluída' ? 'hsl(var(--muted-foreground))' : session.status === 'cancelada' ? 'hsl(var(--destructive))' : 'hsl(var(--primary))',
      textColor: session.status === 'concluída' ? 'hsl(var(--muted-foreground))' : session.status === 'cancelada' ? 'hsl(var(--primary-foreground))' : 'hsl(var(--primary-foreground))',
    }));

    setEvents(calendarEvents);
    setIsLoadingCalendar(false);
  }, [user, authLoading, locationName]); // Add locationName to dependencies

  useEffect(() => {
    fetchAndSetSessions();
  }, [fetchAndSetSessions]);

  const handleEventDrop = async (dropInfo: EventDropArg) => {
    toast({
      title: "Sessão Reagendada (Simulado)",
      description: `Sessão "${dropInfo.event.title}" movida para ${dropInfo.event.start?.toLocaleString()} no local ${locationName}.`,
    });
     setEvents(prevEvents => prevEvents.map(event => {
      if (event.id === dropInfo.event.id) {
        return { ...event, start: dropInfo.event.start, end: dropInfo.event.end };
      }
      return event;
    }));
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const { patientName, psychologistName, status, location } = clickInfo.event.extendedProps;
    toast({
      title: `Sessão: ${patientName || 'Paciente'} com ${psychologistName || 'Psicólogo'} (${location})`,
      description: `Início: ${clickInfo.event.start?.toLocaleString()}. Status: ${status}. (Clique simulado para edição/detalhes)`,
    });
  };

  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }); 
  const startOfTwoWeeksLater = addDays(startOfCurrentWeek, 14);

  const validDateRange = {
    start: startOfCurrentWeek,
    end: startOfTwoWeeksLater,
  };

  if (authLoading || isLoadingCalendar) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><MapPin className="mr-2 h-5 w-5 text-muted-foreground" /> {locationName}</CardTitle>
          <CardDescription>Carregando horários...</CardDescription>
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
        <CardTitle className="font-headline flex items-center"><MapPin className="mr-2 h-5 w-5 text-muted-foreground" /> {locationName}</CardTitle>
        <CardDescription>Horários disponíveis (semana atual e próxima). Dados simulados.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[650px] text-sm"> 
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: '' 
            }}
            initialView="timeGridWeek"
            initialDate={today.toISOString()}
            validRange={validDateRange}
            locale="pt-br"
            buttonText={{
                today:    'Hoje',
            }}
            allDaySlot={false} 
            events={events} // Later, this will be availability slots
            editable={true} 
            droppable={false} 
            eventDrop={handleEventDrop} // Will need to adapt for availability
            eventClick={handleEventClick} // Will be "select availability slot"
            selectable={true} 
            select={(selectInfo) => {
              toast({ title: "Seleção de Horário (Simulado)", description: `Novo evento de ${selectInfo.startStr} a ${selectInfo.endStr} no local ${locationName}. Implementar abertura de modal.`});
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



"use client";

import React, { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventInput, EventDropArg, EventClickArg } from '@fullcalendar/core';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types'; 
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MapPin } from 'lucide-react';
import { addDays, subDays, startOfWeek } from 'date-fns';

// Helper para criar datas ISO para os mocks
const createIsoDateTime = (daysOffset: number, hour: number, minute: number = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

interface MockAvailabilitySlot {
  id: string;
  psychologistId: string;
  psychologistName: string;
  location: 'Centro' | 'Fazendinha';
  startTime: string; // ISO string
  endTime: string;   // ISO string
}

// Dados mockados para horários disponíveis
const MOCK_AVAILABILITY_SLOTS: MockAvailabilitySlot[] = [
  // Dr. Exemplo Silva (psy1)
  // Centro
  { id: 'avail_centro_psy1_1', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo Silva', location: 'Centro', startTime: createIsoDateTime(1, 9), endTime: createIsoDateTime(1, 10) },
  { id: 'avail_centro_psy1_2', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo Silva', location: 'Centro', startTime: createIsoDateTime(1, 10), endTime: createIsoDateTime(1, 11) },
  { id: 'avail_centro_psy1_3', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo Silva', location: 'Centro', startTime: createIsoDateTime(3, 14), endTime: createIsoDateTime(3, 15) },
  { id: 'avail_centro_psy1_4', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo Silva', location: 'Centro', startTime: createIsoDateTime(8, 9), endTime: createIsoDateTime(8, 12) }, // Bloco maior semana que vem
  // Fazendinha
  { id: 'avail_faz_psy1_1', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo Silva', location: 'Fazendinha', startTime: createIsoDateTime(2, 9), endTime: createIsoDateTime(2, 10) },
  { id: 'avail_faz_psy1_2', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo Silva', location: 'Fazendinha', startTime: createIsoDateTime(2, 10), endTime: createIsoDateTime(2, 11) },
  { id: 'avail_faz_psy1_3', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo Silva', location: 'Fazendinha', startTime: createIsoDateTime(9, 14), endTime: createIsoDateTime(9, 17) }, // Bloco maior semana que vem


  // Dra. Modelo Souza (psy2)
  // Centro
  { id: 'avail_centro_psy2_1', psychologistId: 'psy2', psychologistName: 'Dra. Modelo Souza', location: 'Centro', startTime: createIsoDateTime(1, 13), endTime: createIsoDateTime(1, 14) },
  { id: 'avail_centro_psy2_2', psychologistId: 'psy2', psychologistName: 'Dra. Modelo Souza', location: 'Centro', startTime: createIsoDateTime(1, 14), endTime: createIsoDateTime(1, 15) },
  { id: 'avail_centro_psy2_3', psychologistId: 'psy2', psychologistName: 'Dra. Modelo Souza', location: 'Centro', startTime: createIsoDateTime(4, 10), endTime: createIsoDateTime(4, 12) },
  { id: 'avail_centro_psy2_4', psychologistId: 'psy2', psychologistName: 'Dra. Modelo Souza', location: 'Centro', startTime: createIsoDateTime(10, 10), endTime: createIsoDateTime(10, 13) }, // Semana que vem
  // Fazendinha
  { id: 'avail_faz_psy2_1', psychologistId: 'psy2', psychologistName: 'Dra. Modelo Souza', location: 'Fazendinha', startTime: createIsoDateTime(2, 13), endTime: createIsoDateTime(2, 14) },
  { id: 'avail_faz_psy2_2', psychologistId: 'psy2', psychologistName: 'Dra. Modelo Souza', location: 'Fazendinha', startTime: createIsoDateTime(2, 14), endTime: createIsoDateTime(2, 15) },
  { id: 'avail_faz_psy2_3', psychologistId: 'psy2', psychologistName: 'Dra. Modelo Souza', location: 'Fazendinha', startTime: createIsoDateTime(11, 10), endTime: createIsoDateTime(11, 12) }, // Semana que vem

  // Dr. Convidado (other-psy-uid) - Somente Centro
  { id: 'avail_centro_other_1', psychologistId: 'other-psy-uid', psychologistName: 'Dr. Convidado', location: 'Centro', startTime: createIsoDateTime(5, 9), endTime: createIsoDateTime(5, 12) },
  { id: 'avail_centro_other_2', psychologistId: 'other-psy-uid', psychologistName: 'Dr. Convidado', location: 'Centro', startTime: createIsoDateTime(12, 9), endTime: createIsoDateTime(12, 12) }, // Semana que vem
];


interface InteractiveCalendarProps {
  locationName: 'Centro' | 'Fazendinha';
}

export function InteractiveCalendar({ locationName }: InteractiveCalendarProps) {
  const { user, isLoading: authLoading } = useAuth();
  const [availabilityEvents, setAvailabilityEvents] = useState<EventInput[]>([]);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(true);
  const { toast } = useToast();

  const fetchAndSetAvailability = useCallback(async () => {
    if (authLoading || !user) {
      setIsLoadingCalendar(true);
      return;
    }
    setIsLoadingCalendar(true);

    await new Promise(resolve => setTimeout(resolve, 500)); // Simula busca de dados

    let relevantSlots = MOCK_AVAILABILITY_SLOTS.filter(slot => slot.location === locationName);

    if (user.role === 'psychologist') {
      // Mapear nomes de psicólogos mockados para IDs, se necessário, ou usar user.id diretamente
      const psychologistMockId = user.name === 'Dr. Exemplo Silva' ? 'psy1' : 
                                 user.name === 'Dra. Modelo Souza' ? 'psy2' : 
                                 user.name === 'Dr. Convidado' ? 'other-psy-uid' : user.id;
      relevantSlots = relevantSlots.filter(slot => slot.psychologistId === psychologistMockId);
    }
    // Admins, Secretaries, Schedulers veem todos os slots do local

    const calendarEvents = relevantSlots.map((slot: MockAvailabilitySlot) => ({
      id: slot.id,
      title: `Disponível - ${slot.psychologistName}`,
      start: slot.startTime,
      end: slot.endTime,
      allDay: false,
      extendedProps: {
        psychologistId: slot.psychologistId,
        psychologistName: slot.psychologistName,
        location: slot.location,
      },
      backgroundColor: 'hsl(var(--accent))', // Cor para disponibilidade
      borderColor: 'hsl(var(--accent))',
      textColor: 'hsl(var(--accent-foreground))',
    }));

    setAvailabilityEvents(calendarEvents);
    setIsLoadingCalendar(false);
  }, [user, authLoading, locationName]);

  useEffect(() => {
    fetchAndSetAvailability();
  }, [fetchAndSetAvailability]);

  const handleEventDrop = async (dropInfo: EventDropArg) => {
    // Arrastar e soltar para slots de disponibilidade pode ser uma funcionalidade de admin para reajustar
    // horários de psicólogos. Por agora, um toast informativo.
    toast({
      title: "Disponibilidade Movida (Simulado)",
      description: `Horário de ${dropInfo.event.extendedProps.psychologistName} movido para ${dropInfo.event.start?.toLocaleString()} no local ${locationName}. (Esta ação seria restrita).`,
    });
    setAvailabilityEvents(prevEvents => prevEvents.map(event => {
      if (event.id === dropInfo.event.id) {
        return { ...event, start: dropInfo.event.start, end: dropInfo.event.end };
      }
      return event;
    }));
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const { psychologistName, location } = clickInfo.event.extendedProps;
    toast({
      title: `Horário Disponível: ${psychologistName} (${location})`,
      description: `Início: ${clickInfo.event.start?.toLocaleString()}. (Clique aqui abriria modal de agendamento).`,
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
          <CardDescription>Carregando horários disponíveis...</CardDescription>
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
        <CardDescription>Horários disponíveis dos psicólogos (semana atual e próxima).</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[600px] text-sm"> {/* Altura do container do calendário reduzida */}
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: '' // Apenas navegação de semana
            }}
            initialView="timeGridWeek"
            initialDate={today.toISOString()}
            validRange={validDateRange}
            locale="pt-br"
            buttonText={{
                today:    'Hoje',
            }}
            allDaySlot={false} 
            events={availabilityEvents} 
            editable={user?.role === 'admin'} // Somente admin pode arrastar/modificar disponibilidade (simulado)
            droppable={false} 
            eventDrop={handleEventDrop} 
            eventClick={handleEventClick} 
            selectable={true} // Permite selecionar slots de tempo
            select={(selectInfo) => {
              // Aqui, futuramente, abriria um modal para criar um AGENDAMENTO nesse slot selecionado
              toast({ title: "Seleção de Horário para Agendamento", description: `Horário selecionado de ${selectInfo.startStr} a ${selectInfo.endStr} no local ${locationName}. (Abriria modal de agendamento).`});
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
              daysOfWeek: [ 1, 2, 3, 4, 5 ], // Segunda a Sexta
              startTime: '08:00',
              endTime: '20:00', // Horário comercial expandido
            }}
            eventDisplay="block" 
            displayEventEnd={true} 
          />
        </div>
      </CardContent>
    </Card>
  );
}

    
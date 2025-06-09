"use client";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Session } from "@/types";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Edit2, User, Clock } from "lucide-react";
import { useState, useMemo } from "react";
import { format, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SessionCalendarProps {
  sessions: Session[];
  onDateChange: (date?: Date) => void;
  onSelectSession: (session: Session) => void;
  currentCalendarDate?: Date;
}

export function SessionCalendar({ sessions, onDateChange, onSelectSession, currentCalendarDate }: SessionCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(currentCalendarDate || new Date());

  const handleDateSelect = (date?: Date) => {
    setSelectedDate(date);
    onDateChange(date);
  };

  const sessionsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return sessions.filter(session => isSameDay(parseISO(session.startTime), selectedDate));
  }, [sessions, selectedDate]);

  const dayHasEvents = (date: Date) => {
    return sessions.some(session => isSameDay(parseISO(session.startTime), date));
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">Calendário de Sessões</CardTitle>
        <CardDescription>Selecione uma data para ver as sessões agendadas.</CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md border"
            locale={ptBR}
            modifiers={{ hasEvent: dayHasEvents }}
            modifiersStyles={{
              hasEvent: { 
                fontWeight: 'bold', 
                textDecoration: 'underline',
                textDecorationColor: 'hsl(var(--primary))',
                textUnderlineOffset: '3px'
              }
            }}
            footer={
              selectedDate ? (
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Você selecionou {format(selectedDate, "PPP", { locale: ptBR })}.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Selecione uma data.
                </p>
              )
            }
          />
        </div>
        <div className="md:col-span-1">
          <h3 className="font-headline text-lg mb-3">
            Sessões em {selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : "..."}
          </h3>
          {sessionsForSelectedDate.length > 0 ? (
            <ScrollArea className="h-72 pr-3">
              <ul className="space-y-3">
                {sessionsForSelectedDate.map(session => (
                  <li key={session.id} className="p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm flex items-center">
                          <User className="w-4 h-4 mr-1.5 text-primary" /> {session.patientName || 'Paciente não informado'}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center">
                          <Clock className="w-3 h-3 mr-1" /> {format(parseISO(session.startTime), "HH:mm", { locale: ptBR })} - {format(parseISO(session.endTime), "HH:mm", { locale: ptBR })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Com: {session.psychologistName || 'Psicólogo não informado'}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onSelectSession(session)}>
                        <Edit2 className="w-4 h-4" />
                        <span className="sr-only">Editar Sessão</span>
                      </Button>
                    </div>
                     <Badge 
                        variant={session.status === 'scheduled' ? 'default' : session.status === 'completed' ? 'secondary' : 'destructive'} 
                        className="mt-1.5 text-xs capitalize"
                      >
                        {session.status === 'scheduled' ? 'Agendada' : session.status === 'completed' ? 'Concluída' : session.status === 'cancelled' ? 'Cancelada' : 'Não Compareceu'}
                      </Badge>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <p className="text-sm text-muted-foreground mt-4">Nenhuma sessão para esta data.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

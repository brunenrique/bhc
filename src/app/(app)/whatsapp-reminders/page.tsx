
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, MessageSquare, Search } from "lucide-react";
import type { Patient, Session } from "@/types";
import { cacheService } from "@/services/cacheService";
import { format, parseISO, isFuture, differenceInHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import { WhatsAppReminderDialog } from "@/features/whatsapp-reminders/components/WhatsAppReminderDialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const createFutureDateISOString = (daysInFuture: number, hour: number = 10, minute: number = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysInFuture);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const createPastDateISOString = (daysInPast: number, hour: number = 10, minute: number = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysInPast);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const mockPatientsData: Patient[] = [
  { id: '1', name: 'Ana Beatriz Silva', email: 'ana.silva@example.com', phone: '(11) 98765-4321', dateOfBirth: '1990-05-15', createdAt: createPastDateISOString(10), updatedAt: new Date().toISOString(), assignedTo: 'psy1' },
  { id: '2', name: 'Bruno Almeida Costa', email: 'bruno.costa@example.com', phone: '(21) 91234-5678', dateOfBirth: '1985-11-20', createdAt: createPastDateISOString(5), updatedAt: new Date().toISOString(), assignedTo: 'psy1' },
  { id: '3', name: 'Carla Dias Oliveira', email: 'carla.oliveira@example.com', phone: '(31) 95555-5555', dateOfBirth: '2000-02-10', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), assignedTo: 'psy2' },
  { id: '4', name: 'Daniel Farias Lima', email: 'daniel.lima@example.com', phone: '(41) 94444-0000', dateOfBirth: '1992-07-22', createdAt: createPastDateISOString(2), updatedAt: new Date().toISOString(), assignedTo: 'psy1' },
  { id: '5', name: 'Eduarda Gomes Ferreira', email: 'eduarda.ferreira@example.com', phone: '(51) 93333-1111', dateOfBirth: '1998-03-30', createdAt: createPastDateISOString(45), updatedAt: new Date().toISOString(), assignedTo: 'psy2' },
  { id: '6', name: 'Felipe Moreira', email: 'felipe.moreira@example.com', phone: null, dateOfBirth: '1995-09-12', createdAt: createPastDateISOString(15), updatedAt: new Date().toISOString(), assignedTo: 'psy2' },
];

export const mockSessionsData: Session[] = [
  // Ana Silva
  { id: 's_ana_near', patientId: '1', patientName: 'Ana Beatriz Silva', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo Silva', startTime: createFutureDateISOString(1, 10), endTime: createFutureDateISOString(1, 11), status: 'scheduled', createdAt: createPastDateISOString(1) },
  { id: 's_ana_week', patientId: '1', patientName: 'Ana Beatriz Silva', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo Silva', startTime: createFutureDateISOString(7, 14), endTime: createFutureDateISOString(7, 15), status: 'scheduled', createdAt: createPastDateISOString(1) },
  { id: 's_ana_future_cancelled', patientId: '1', patientName: 'Ana Beatriz Silva', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo Silva', startTime: createFutureDateISOString(3, 11), endTime: createFutureDateISOString(3, 12), status: 'cancelled', createdAt: createPastDateISOString(1) },
  
  // Bruno Costa
  { id: 's_bruno_later_today_or_tomorrow', patientId: '2', patientName: 'Bruno Almeida Costa', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo Silva', startTime: createFutureDateISOString(0, new Date().getHours() + 3), endTime: createFutureDateISOString(0, new Date().getHours() + 4), status: 'scheduled', createdAt: createPastDateISOString(0) },
  { id: 's_bruno_two_days', patientId: '2', patientName: 'Bruno Almeida Costa', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo Silva', startTime: createFutureDateISOString(2, 16), endTime: createFutureDateISOString(2, 17), status: 'scheduled', createdAt: createPastDateISOString(0) },
  { id: 's_bruno_future_completed', patientId: '2', patientName: 'Bruno Almeida Costa', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo Silva', startTime: createFutureDateISOString(4, 10), endTime: createFutureDateISOString(4, 11), status: 'completed', createdAt: createPastDateISOString(0) },

  // Carla Dias Oliveira
  { id: 's_carla_tomorrow', patientId: '3', patientName: 'Carla Dias Oliveira', psychologistId: 'psy2', psychologistName: 'Dra. Modelo Souza', startTime: createFutureDateISOString(1, 9), endTime: createFutureDateISOString(1, 10), status: 'scheduled', createdAt: createPastDateISOString(1) },

  // Daniel Farias Lima
  { id: 's_daniel_far', patientId: '4', patientName: 'Daniel Farias Lima', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo Silva', startTime: createFutureDateISOString(10, 11), endTime: createFutureDateISOString(10, 12), status: 'scheduled', createdAt: createPastDateISOString(1) },

  // Eduarda Gomes Ferreira (sessão passada, não deve aparecer)
  { id: 's_edu_past', patientId: '5', patientName: 'Eduarda Gomes Ferreira', psychologistId: 'psy2', psychologistName: 'Dra. Modelo Souza', startTime: createPastDateISOString(3), endTime: new Date(new Date().getTime() - (3 * 24 * 60 * 60 * 1000) + (60 * 60 * 1000)).toISOString(), status: 'completed', createdAt: createPastDateISOString(4) }, 

  // Felipe Moreira (paciente sem telefone)
  { id: 's_felipe_no_phone', patientId: '6', patientName: 'Felipe Moreira', psychologistId: 'psy2', psychologistName: 'Dra. Modelo Souza', startTime: createFutureDateISOString(2, 14), endTime: createFutureDateISOString(2, 15), status: 'scheduled', createdAt: createPastDateISOString(1) },
];


interface ReminderItem {
  patient: Patient;
  session: Session;
}

export default function WhatsAppRemindersPage() {
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [allSessions, setAllSessions] = useState<Session[]>([]); // This will store only future, scheduled sessions
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReminderItem, setSelectedReminderItem] = useState<ReminderItem | null>(null);
  const [isWhatsAppReminderDialogOpen, setIsWhatsAppReminderDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState<"all" | "24h" | "48h">("all");


  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
      
      let loadedPatients: Patient[] | undefined;
      let loadedSessions: Session[] | undefined;

      try {
        loadedPatients = await cacheService.patients.getList();
      } catch (e) { console.warn("Cache read error for patients", e); }

      try {
        const cachedSessionsRaw = await cacheService.sessions.getList();
        const pendingSessionsRaw = await cacheService.pendingSessions.getList();
        let combinedSessionsRaw: Session[] = cachedSessionsRaw || [];

        if (pendingSessionsRaw && pendingSessionsRaw.length > 0) {
            const pendingIds = new Set(pendingSessionsRaw.map(s => s.id));
            combinedSessionsRaw = combinedSessionsRaw.filter(s => !pendingIds.has(s.id));
            combinedSessionsRaw = [...combinedSessionsRaw, ...pendingSessionsRaw];
        }
        loadedSessions = combinedSessionsRaw;
      } catch (e) { console.warn("Cache read error for sessions", e); }
      
      if (isMounted) {
        const finalPatients = (loadedPatients && loadedPatients.length > 0) ? loadedPatients : mockPatientsData;
        const finalSessionsSource = (loadedSessions && loadedSessions.length > 0) ? loadedSessions : mockSessionsData;

        setAllPatients(finalPatients);
        
        const futureScheduled = finalSessionsSource.filter(s => {
          try {
            // Ensure startTime is a valid string before parsing
            return s.status === 'scheduled' && typeof s.startTime === 'string' && isFuture(parseISO(s.startTime));
          } catch (parseError) {
            // console.error(`Reminder Page: Failed to parse date for session ${s.id}: ${s.startTime}`, parseError);
            return false;
          }
        });
        setAllSessions(futureScheduled);

        // If we ended up using mock data because cache was empty/problematic, populate cache
        if (!loadedPatients || loadedPatients.length === 0) {
          try {
            await cacheService.patients.setList(mockPatientsData);
          } catch (cacheError) { console.warn("Failed to save mock patients to cache", cacheError); }
        }
        // Save the original mockSessionsData to cache if loadedSessions was empty,
        // as it contains all statuses, not just future/scheduled.
        // Other pages might need the full list.
        if (!loadedSessions || loadedSessions.length === 0) {
          try {
            await cacheService.sessions.setList(mockSessionsData);
          } catch (cacheError) { console.warn("Failed to save mock sessions to cache", cacheError); }
        }
        
        setIsLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  const reminderItems = useMemo(() => {
    const items: ReminderItem[] = [];
    // allSessions should already be filtered for future and scheduled by the useEffect
    allSessions.forEach(session => { 
      const patient = allPatients.find(p => p.id === session.patientId);
      if (patient) {
        let sessionTime;
        try {
            sessionTime = parseISO(session.startTime);
        } catch (e) {
            // console.error("Invalid date for session in reminderItems:", session.startTime);
            return; // Skip this session if date is invalid
        }
        
        const now = new Date();
        const hoursDifference = differenceInHours(sessionTime, now);

        if (timeFilter === "24h" && hoursDifference > 24) {
          return;
        }
        if (timeFilter === "48h" && hoursDifference > 48) {
          return;
        }

        if (searchTerm && 
            !patient.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !(patient.phone && patient.phone.replace(/\D/g, '').includes(searchTerm.replace(/\D/g, '')))) {
          return;
        }
        items.push({ patient, session });
      }
    });
    return items.sort((a,b) => {
        try {
            return parseISO(a.session.startTime).getTime() - parseISO(b.session.startTime).getTime();
        } catch (e) {
            return 0;
        }
    });
  }, [allSessions, allPatients, searchTerm, timeFilter]);

  const handleOpenDialog = useCallback((item: ReminderItem) => {
    setSelectedReminderItem(item);
    setIsWhatsAppReminderDialogOpen(true);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-headline font-semibold">Lembretes de Consulta (WhatsApp)</h1>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar paciente ou telefone..."
              className="pl-8 w-full sm:w-[200px] md:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
           <Select value={timeFilter} onValueChange={(value) => setTimeFilter(value as "all" | "24h" | "48h")}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por proximidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Próximas</SelectItem>
              <SelectItem value="24h">Próximas 24h</SelectItem>
              <SelectItem value="48h">Próximas 48h</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <p className="text-muted-foreground font-body">
        Gere mensagens de lembrete personalizadas para enviar aos seus pacientes via WhatsApp.
      </p>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Consultas Agendadas Futuras</CardTitle>
          <CardDescription>Pacientes com consultas futuras que podem precisar de um lembrete.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : reminderItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma consulta agendada futura encontrada para os filtros atuais.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead className="hidden md:table-cell">Telefone</TableHead>
                    <TableHead>Próxima Consulta</TableHead>
                    <TableHead>Psicólogo(a)</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reminderItems.map((item) => (
                    <TableRow key={item.session.id}>
                      <TableCell>
                        <div className="font-medium">{item.patient.name}</div>
                        <div className="text-xs text-muted-foreground md:hidden">{item.patient.phone || "N/A"}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{item.patient.phone || "N/A"}</TableCell>
                      <TableCell>
                        {format(parseISO(item.session.startTime), "dd/MM/yy HH:mm", { locale: ptBR })}
                        <div className="text-xs text-muted-foreground">
                          ({format(parseISO(item.session.startTime), "EEEE", { locale: ptBR })})
                        </div>
                      </TableCell>
                      <TableCell>{item.session.psychologistName || "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(item)}
                          disabled={!item.patient.phone}
                          title={!item.patient.phone ? "Telefone não cadastrado" : "Criar lembrete"}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Lembrete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedReminderItem && (
        <WhatsAppReminderDialog
          isOpen={isWhatsAppReminderDialogOpen}
          onOpenChange={setIsWhatsAppReminderDialogOpen}
          reminderItem={selectedReminderItem}
        />
      )}
    </div>
  );
}

    

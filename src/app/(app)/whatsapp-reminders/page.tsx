
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, MessageSquare, Search } from "lucide-react";
import type { Patient, Session } from "@/types";
import { cacheService } from "@/services/cacheService";
import { format, parseISO, isFuture, differenceInHours, addDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { WhatsAppReminderDialog } from "@/features/whatsapp-reminders/components/WhatsAppReminderDialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const createFutureDateISOString = (daysInFuture: number, hour: number = 10, minute: number = 0): string => {
  const date = addDays(new Date(), daysInFuture);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const createPastDateISOString = (daysInPast: number, hour: number = 10, minute: number = 0): string => {
  const date = subDays(new Date(), daysInPast);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const mockPatientsData: Patient[] = [
  { id: '1', name: 'Ana Beatriz Silva', email: 'ana.silva@example.com', phone: '(11) 98765-4321', dateOfBirth: '1990-05-15', createdAt: createPastDateISOString(10), updatedAt: new Date().toISOString(), assignedTo: 'psy1' },
  { id: '2', name: 'Bruno Almeida Costa', email: 'bruno.costa@example.com', phone: '(21) 91234-5678', dateOfBirth: '1985-11-20', createdAt: createPastDateISOString(5), updatedAt: new Date().toISOString(), assignedTo: 'psy1' },
  { id: '3', name: 'Carla Dias Oliveira', email: 'carla.oliveira@example.com', phone: '(31) 95555-5555', dateOfBirth: '2000-02-10', createdAt: createPastDateISOString(0), updatedAt: new Date().toISOString(), assignedTo: 'psy2' },
  { id: '4', name: 'Daniel Farias Lima', email: 'daniel.lima@example.com', phone: '(41) 94444-0000', dateOfBirth: '1992-07-22', createdAt: createPastDateISOString(20), updatedAt: new Date().toISOString(), assignedTo: 'psy1' },
  { id: '5', name: 'Eduarda Gomes Ferreira', email: 'eduarda.ferreira@example.com', phone: '(51) 93333-1111', dateOfBirth: '1998-03-30', createdAt: createPastDateISOString(45), updatedAt: new Date().toISOString(), assignedTo: 'psy2' },
  { id: '6', name: 'Felipe Nogueira Moreira', email: 'felipe.moreira@example.com', phone: null, dateOfBirth: '1995-09-12', createdAt: createPastDateISOString(15), updatedAt: new Date().toISOString(), assignedTo: 'psy2' },
  { id: '7', name: 'Gabriela Martins Azevedo', email: 'gabriela.azevedo@example.com', phone: '(71) 91111-2222', dateOfBirth: '1993-01-25', createdAt: createPastDateISOString(60), updatedAt: new Date().toISOString(), assignedTo: 'psy1' },
  { id: '8', name: 'Hugo Pereira da Silva', email: 'hugo.pereira@example.com', phone: '(81) 90000-3333', dateOfBirth: '1988-08-05', createdAt: createPastDateISOString(3), updatedAt: new Date().toISOString(), assignedTo: 'other-psy-uid' },
  { id: '9', name: 'Isabela Santos Rocha', email: 'isabela.santos@example.com', phone: '(91) 98888-4444', dateOfBirth: '2002-12-12', createdAt: createPastDateISOString(90), updatedAt: new Date().toISOString(), assignedTo: 'psy2' },
  { id: '10', name: 'Lucas Mendes Oliveira', email: 'lucas.mendes@example.com', phone: '(12) 97777-5555', dateOfBirth: '1975-06-18', createdAt: createPastDateISOString(120), updatedAt: new Date().toISOString(), assignedTo: 'psy1' },
];

export const mockSessionsData: Session[] = [
  // Ana Silva (ID 1)
  { id: 's_ana_near', patientId: '1', patientName: 'Ana Beatriz Silva', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo Silva', startTime: createFutureDateISOString(1, 10), endTime: createFutureDateISOString(1, 11), status: 'scheduled', createdAt: createPastDateISOString(1) },
  { id: 's_ana_week', patientId: '1', patientName: 'Ana Beatriz Silva', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo Silva', startTime: createFutureDateISOString(7, 14), endTime: createFutureDateISOString(7, 15), status: 'scheduled', createdAt: createPastDateISOString(1) },
  { id: 's_ana_future_cancelled', patientId: '1', patientName: 'Ana Beatriz Silva', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo Silva', startTime: createFutureDateISOString(3, 11), endTime: createFutureDateISOString(3, 12), status: 'cancelled', createdAt: createPastDateISOString(1) },
  
  // Bruno Costa (ID 2)
  { id: 's_bruno_later_today', patientId: '2', patientName: 'Bruno Almeida Costa', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo Silva', startTime: createFutureDateISOString(0, Math.min(22, new Date().getHours() + 3) ), endTime: createFutureDateISOString(0, Math.min(23, new Date().getHours() + 4)), status: 'scheduled', createdAt: createPastDateISOString(0) },
  { id: 's_bruno_two_days', patientId: '2', patientName: 'Bruno Almeida Costa', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo Silva', startTime: createFutureDateISOString(2, 16), endTime: createFutureDateISOString(2, 17), status: 'scheduled', createdAt: createPastDateISOString(0) },
  { id: 's_bruno_future_completed', patientId: '2', patientName: 'Bruno Almeida Costa', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo Silva', startTime: createFutureDateISOString(4, 10), endTime: createFutureDateISOString(4, 11), status: 'completed', createdAt: createPastDateISOString(0) },

  // Carla Dias Oliveira (ID 3)
  { id: 's_carla_tomorrow', patientId: '3', patientName: 'Carla Dias Oliveira', psychologistId: 'psy2', psychologistName: 'Dra. Modelo Souza', startTime: createFutureDateISOString(1, 9), endTime: createFutureDateISOString(1, 10), status: 'scheduled', createdAt: createPastDateISOString(1) },
  { id: 's_carla_next_week', patientId: '3', patientName: 'Carla Dias Oliveira', psychologistId: 'psy2', psychologistName: 'Dra. Modelo Souza', startTime: createFutureDateISOString(8, 11), endTime: createFutureDateISOString(8, 12), status: 'scheduled', createdAt: createPastDateISOString(1) },


  // Daniel Farias Lima (ID 4)
  { id: 's_daniel_far', patientId: '4', patientName: 'Daniel Farias Lima', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo Silva', startTime: createFutureDateISOString(10, 11), endTime: createFutureDateISOString(10, 12), status: 'scheduled', createdAt: createPastDateISOString(1) },
  { id: 's_daniel_48h', patientId: '4', patientName: 'Daniel Farias Lima', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo Silva', startTime: createFutureDateISOString(2, 10, 30), endTime: createFutureDateISOString(2, 11, 30), status: 'scheduled', createdAt: createPastDateISOString(1) },


  // Eduarda Gomes Ferreira (ID 5) (sessão passada, não deve aparecer nos lembretes)
  { id: 's_edu_past', patientId: '5', patientName: 'Eduarda Gomes Ferreira', psychologistId: 'psy2', psychologistName: 'Dra. Modelo Souza', startTime: createPastDateISOString(3), endTime: new Date(new Date().getTime() - (3 * 24 * 60 * 60 * 1000) + (60 * 60 * 1000)).toISOString(), status: 'completed', createdAt: createPastDateISOString(4) }, 
  { id: 's_edu_future_noshow', patientId: '5', patientName: 'Eduarda Gomes Ferreira', psychologistId: 'psy2', psychologistName: 'Dra. Modelo Souza', startTime: createFutureDateISOString(5, 15), endTime: createFutureDateISOString(5, 16), status: 'no-show', createdAt: createPastDateISOString(1) },


  // Felipe Nogueira Moreira (ID 6) (paciente sem telefone, mas sessão aparece)
  { id: 's_felipe_no_phone', patientId: '6', patientName: 'Felipe Nogueira Moreira', psychologistId: 'psy2', psychologistName: 'Dra. Modelo Souza', startTime: createFutureDateISOString(2, 14), endTime: createFutureDateISOString(2, 15), status: 'scheduled', createdAt: createPastDateISOString(1) },

  // Gabriela Martins Azevedo (ID 7)
  { id: 's_gabriela_today_evening', patientId: '7', patientName: 'Gabriela Martins Azevedo', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo Silva', startTime: createFutureDateISOString(0, 18), endTime: createFutureDateISOString(0, 19), status: 'scheduled', createdAt: createPastDateISOString(2) },
  { id: 's_gabriela_next_month', patientId: '7', patientName: 'Gabriela Martins Azevedo', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo Silva', startTime: createFutureDateISOString(35, 10), endTime: createFutureDateISOString(35, 11), status: 'scheduled', createdAt: createPastDateISOString(2) },

  // Hugo Pereira da Silva (ID 8)
  { id: 's_hugo_24h', patientId: '8', patientName: 'Hugo Pereira da Silva', psychologistId: 'other-psy-uid', psychologistName: 'Dr. Outro Exemplo', startTime: createFutureDateISOString(1, 15), endTime: createFutureDateISOString(1, 16), status: 'scheduled', createdAt: createPastDateISOString(1) },
  
  // Isabela Santos Rocha (ID 9)
  { id: 's_isabela_upcoming', patientId: '9', patientName: 'Isabela Santos Rocha', psychologistId: 'psy2', psychologistName: 'Dra. Modelo Souza', startTime: createFutureDateISOString(6, 13), endTime: createFutureDateISOString(6, 14), status: 'scheduled', createdAt: createPastDateISOString(3) },

  // Lucas Mendes Oliveira (ID 10)
  { id: 's_lucas_tomorrow_afternoon', patientId: '10', patientName: 'Lucas Mendes Oliveira', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo Silva', startTime: createFutureDateISOString(1, 16, 30), endTime: createFutureDateISOString(1, 17, 30), status: 'scheduled', createdAt: createPastDateISOString(5) },
  { id: 's_lucas_completed_recent', patientId: '10', patientName: 'Lucas Mendes Oliveira', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo Silva', startTime: createPastDateISOString(2, 10), endTime: createPastDateISOString(2, 11), status: 'completed', createdAt: createPastDateISOString(5) },
];


interface ReminderItem {
  patient: Patient;
  session: Session;
}

export default function WhatsAppRemindersPage() {
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [allSessions, setAllSessions] = useState<Session[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReminderItem, setSelectedReminderItem] = useState<ReminderItem | null>(null);
  const [isWhatsAppReminderDialogOpen, setIsWhatsAppReminderDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState<"all" | "24h" | "48h">("all");


  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
      
      if (isMounted) {
        setAllPatients(mockPatientsData);
        const futureScheduledFromMock = mockSessionsData.filter(s => {
          try {
            if (typeof s.startTime !== 'string') return false;
            const sessionDate = parseISO(s.startTime);
            // Only show 'scheduled' sessions for reminders. Others are for context in performance page etc.
            return s.status === 'scheduled' && isFuture(sessionDate);
          } catch (parseError) {
            return false;
          }
        });
        setAllSessions(futureScheduledFromMock);
        setIsLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  const reminderItems = useMemo(() => {
    const items: ReminderItem[] = [];
    allSessions.forEach(session => { 
      const patient = allPatients.find(p => p.id === session.patientId);
      if (patient) {
        let sessionTime;
        try {
            if (typeof session.startTime !== 'string') return; 
            sessionTime = parseISO(session.startTime);
        } catch (e) {
            return; 
        }
        
        const now = new Date();
        const hoursDifference = differenceInHours(sessionTime, now);

        if (timeFilter === "24h" && (hoursDifference < 0 || hoursDifference > 24)) {
          return;
        }
        if (timeFilter === "48h" && (hoursDifference < 0 || hoursDifference > 48)) {
          return;
        }
        // For "all", we still only want future sessions, which is already filtered in `allSessions` state.

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
            if (typeof a.session.startTime !== 'string' || typeof b.session.startTime !== 'string') return 0;
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
                  {reminderItems.map((item) => {
                    let sessionDateDisplay = "Data inválida";
                    try {
                      if (typeof item.session.startTime === 'string') {
                        sessionDateDisplay = format(parseISO(item.session.startTime), "dd/MM/yy HH:mm", { locale: ptBR });
                      }
                    } catch (e) { /* console.error("Error formatting date for display:", item.session.startTime, e); */ }
                    
                    let dayOfWeekDisplay = "";
                     try {
                      if (typeof item.session.startTime === 'string') {
                        dayOfWeekDisplay = format(parseISO(item.session.startTime), "EEEE", { locale: ptBR });
                      }
                    } catch (e) { /* console.error("Error formatting day of week for display:", item.session.startTime, e); */ }


                    return (
                      <TableRow key={item.session.id}>
                        <TableCell>
                          <div className="font-medium">{item.patient.name}</div>
                          <div className="text-xs text-muted-foreground md:hidden">{item.patient.phone || "N/A"}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{item.patient.phone || "N/A"}</TableCell>
                        <TableCell>
                          {sessionDateDisplay}
                          {dayOfWeekDisplay && <div className="text-xs text-muted-foreground">({dayOfWeekDisplay})</div>}
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
                    );
                  })}
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
    
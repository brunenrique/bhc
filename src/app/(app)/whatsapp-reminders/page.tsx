
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

const mockPatientsData: Patient[] = [
  { id: '1', name: 'Ana Beatriz Silva', email: 'ana.silva@example.com', phone: '(11) 98765-4321', dateOfBirth: '1990-05-15', createdAt: subDays(new Date(), 10).toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', name: 'Bruno Almeida Costa', email: 'bruno.costa@example.com', phone: '(21) 91234-5678', dateOfBirth: '1985-11-20', createdAt: subDays(new Date(), 5).toISOString(), updatedAt: new Date().toISOString() },
  { id: '3', name: 'Carla Dias Oliveira', email: 'carla.oliveira@example.com', phone: '(31) 95555-5555', dateOfBirth: '2000-02-10', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '4', name: 'Daniel Farias Lima', email: 'daniel.lima@example.com', phone: '(41) 94444-0000', dateOfBirth: '1992-07-22', createdAt: subDays(new Date(), 2).toISOString(), updatedAt: new Date().toISOString() },
  { id: '5', name: 'Eduarda Gomes Ferreira', email: 'eduarda.ferreira@example.com', phone: '(51) 93333-1111', dateOfBirth: '1998-03-30', createdAt: subDays(new Date(), 45).toISOString(), updatedAt: new Date().toISOString() },
];

export const mockSessionsData: Session[] = [
  // Ana Silva
  { id: 's_ana_near', patientId: '1', patientName: 'Ana Beatriz Silva', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo Silva', startTime: addDays(new Date(), 1).setHours(10,0,0,0).toString(), endTime: new Date(addDays(new Date(), 1).setHours(11,0,0,0)).toISOString(), status: 'scheduled' }, // Amanhã às 10h
  { id: 's_ana_week', patientId: '1', patientName: 'Ana Beatriz Silva', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo Silva', startTime: addDays(new Date(), 7).setHours(14,0,0,0).toString(), endTime: new Date(addDays(new Date(), 7).setHours(15,0,0,0)).toISOString(), status: 'scheduled' }, // Próxima semana às 14h
  
  // Bruno Costa
  { id: 's_bruno_later_today', patientId: '2', patientName: 'Bruno Almeida Costa', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo Silva', startTime: new Date().setHours(new Date().getHours() + 3, 0,0,0).toString(), endTime: new Date(new Date().setHours(new Date().getHours() + 4,0,0,0)).toISOString(), status: 'scheduled' }, // Hoje, daqui a 3 horas
  { id: 's_bruno_two_days', patientId: '2', patientName: 'Bruno Almeida Costa', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo Silva', startTime: addDays(new Date(), 2).setHours(16,30,0,0).toString(), endTime: new Date(addDays(new Date(), 2).setHours(17,30,0,0)).toISOString(), status: 'scheduled' }, // Daqui a 2 dias às 16:30

  // Carla Dias Oliveira
  { id: 's_carla_tomorrow', patientId: '3', patientName: 'Carla Dias Oliveira', psychologistId: 'psy2', psychologistName: 'Dra. Modelo Souza', startTime: addDays(new Date(), 1).setHours(9,0,0,0).toString(), endTime: new Date(addDays(new Date(), 1).setHours(10,0,0,0)).toISOString(), status: 'scheduled' }, // Amanhã às 9h

  // Daniel Farias Lima
  { id: 's_daniel_far', patientId: '4', patientName: 'Daniel Farias Lima', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo Silva', startTime: addDays(new Date(), 10).setHours(11,0,0,0).toString(), endTime: new Date(addDays(new Date(), 10).setHours(12,0,0,0)).toISOString(), status: 'scheduled' },

  // Eduarda Gomes Ferreira (no upcoming sessions for variety)
  { id: 's_edu_past', patientId: '5', patientName: 'Eduarda Gomes Ferreira', psychologistId: 'psy2', psychologistName: 'Dra. Modelo Souza', startTime: subDays(new Date(), 3).toISOString(), endTime: new Date(subDays(new Date(), 3).getTime() + 60*60*1000).toISOString(), status: 'completed' }, 
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
      
      let patientsData = mockPatientsData;
      try {
        const cachedPatients = await cacheService.patients.getList();
        if (isMounted && cachedPatients && cachedPatients.length > 0) {
          patientsData = cachedPatients;
        } else if (isMounted) {
          await cacheService.patients.setList(mockPatientsData);
        }
      } catch (e) { /* ignore */ }
      if(isMounted) setAllPatients(patientsData);

      let sessionsData = mockSessionsData;
      try {
        const cachedSessions = await cacheService.sessions.getList();
        if (isMounted && cachedSessions && cachedSessions.length > 0) {
          sessionsData = cachedSessions;
        } // No else, as scheduling page manages initial session mock data caching
      } catch (e) { /* ignore */ }
      
      if(isMounted) {
        setAllSessions(sessionsData.filter(s => s.status === 'scheduled' && isFuture(parseISO(s.startTime))));
        setIsLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  const reminderItems = useMemo(() => {
    const items: ReminderItem[] = [];
    allSessions.forEach(session => {
      if (session.status === 'scheduled' && isFuture(parseISO(session.startTime))) {
        const patient = allPatients.find(p => p.id === session.patientId);
        if (patient) {
          const sessionTime = parseISO(session.startTime);
          const now = new Date();
          if (timeFilter === "24h" && differenceInHours(sessionTime, now) > 24) {
            return;
          }
          if (timeFilter === "48h" && differenceInHours(sessionTime, now) > 48) {
            return;
          }

          if (searchTerm && 
              !patient.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
              !(patient.phone && patient.phone.replace(/\D/g, '').includes(searchTerm.replace(/\D/g, '')))) { // Compare numeric parts of phone
            return;
          }
          items.push({ patient, session });
        }
      }
    });
    return items.sort((a,b) => parseISO(a.session.startTime).getTime() - parseISO(b.session.startTime).getTime());
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
          <CardTitle className="font-headline">Consultas Agendadas</CardTitle>
          <CardDescription>Pacientes com consultas futuras que podem precisar de um lembrete.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : reminderItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma consulta agendada encontrada para os filtros atuais.
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

    

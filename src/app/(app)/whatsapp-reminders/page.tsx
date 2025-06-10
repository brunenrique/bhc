
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

// Mock data (simulating fetching from Firestore)
const mockPatientsData: Patient[] = [
  { id: '1', name: 'Ana Beatriz Silva', email: 'ana.silva@example.com', phone: '(11) 98765-4321', dateOfBirth: '1990-05-15', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', name: 'Bruno Almeida Costa', email: 'bruno.costa@example.com', phone: '(21) 91234-5678', dateOfBirth: '1985-11-20', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), updatedAt: new Date().toISOString() },
  { id: '3', name: 'Carla Dias Oliveira', email: 'carla.oliveira@example.com', phone: '(31) 95555-5555', dateOfBirth: '2000-02-10', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '4', name: 'Daniel Farias Lima', email: 'daniel.lima@example.com', phone: '(41) 94444-0000', dateOfBirth: '1992-07-22', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), updatedAt: new Date().toISOString() },
];

const mockSessionsData: Session[] = [
  { id: 's1', patientId: '1', patientName: 'Ana Beatriz Silva', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo', startTime: new Date(Date.now() + 1000 * 60 * 60 * 20).toISOString(), endTime: new Date(Date.now() + 1000 * 60 * 60 * 21).toISOString(), status: 'scheduled' }, // Approx 20 hours from now
  { id: 's2', patientId: '2', patientName: 'Bruno Almeida Costa', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo', startTime: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(), endTime: new Date(Date.now() + 1000 * 60 * 60 * 49).toISOString(), status: 'scheduled' }, // Approx 2 days from now
  { id: 's3', patientId: '1', patientName: 'Ana Beatriz Silva', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo', startTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), endTime: new Date(Date.now() + 1000 * 60 * 60 * (24 * 7 + 1)).toISOString(), status: 'scheduled' }, // Approx 1 week from now
  { id: 's4', patientId: '3', patientName: 'Carla Dias Oliveira', psychologistId: 'psy2', psychologistName: 'Dra. Modelo', startTime: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(), endTime: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(), status: 'scheduled' }, // Approx 5 hours from now
  { id: 's5', patientId: '4', patientName: 'Daniel Farias Lima', psychologistId: 'psy1', psychologistName: 'Dr. Exemplo', startTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), endTime: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(), status: 'completed' }, // Past session
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
  const [isDialogOpeng, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState<"all" | "24h" | "48h">("all");


  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
      // Simulate fetching patients
      const cachedPatients = await cacheService.patients.getList();
      if (isMounted && cachedPatients) {
        setAllPatients(cachedPatients);
      } else if (isMounted) {
        setAllPatients(mockPatientsData);
        await cacheService.patients.setList(mockPatientsData);
      }

      // Simulate fetching sessions
      const cachedSessions = await cacheService.sessions.getList();
      // For WhatsApp reminders, we might want to combine with a general sessions list
      // or fetch specifically "upcoming scheduled" sessions in a real app.
      // Here, we use a mock list that includes various scenarios.
      if (isMounted && cachedSessions && cachedSessions.length > 0) { // Simple check if cache is populated
         setAllSessions(cachedSessions.filter(s => s.status === 'scheduled' && isFuture(parseISO(s.startTime))));
      } else if (isMounted) {
        setAllSessions(mockSessionsData.filter(s => s.status === 'scheduled' && isFuture(parseISO(s.startTime))));
        // No need to save mockSessionsData to general sessions cache here as it's specific for this page's demo
      }
      if(isMounted) setIsLoading(false);
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
          // Apply time filter
          const sessionTime = parseISO(session.startTime);
          const now = new Date();
          if (timeFilter === "24h" && differenceInHours(sessionTime, now) > 24) {
            return;
          }
          if (timeFilter === "48h" && differenceInHours(sessionTime, now) > 48) {
            return;
          }

          // Apply search term filter
          if (searchTerm && 
              !patient.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
              !(patient.phone && patient.phone.includes(searchTerm))) {
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
    setIsDialogOpen(true);
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
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedReminderItem && (
        <WhatsAppReminderDialog
          isOpen={isDialogOpeng}
          onOpenChange={setIsDialogOpen}
          reminderItem={selectedReminderItem}
        />
      )}
    </div>
  );
}

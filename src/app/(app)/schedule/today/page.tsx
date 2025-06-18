
"use client";
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, PlusCircle, ChevronLeft, ChevronRight, ListFilter, Download, CheckSquare, Clock, UserCheck, CheckCircle, AlertTriangle, Ban, UserX, Repeat as RepeatIcon } from "lucide-react";
import Link from "next/link";
import AppointmentCalendar, { type AppointmentsByDate, getInitialMockAppointments } from "@/components/schedule/appointment-calendar";
import TaskItem from '@/components/tasks/task-item';
import { getTasksForDate } from '@/services/taskService'; // Importar o serviço
import type { Task } from '@/types'; // Importar o tipo Task
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar"; 
import { Label } from '@/components/ui/label';
import { format, getDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { generateICS } from '@/services/ics-generator';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const mockPsychologists = [
  { id: "psy1", name: "Dr. Silva" },
  { id: "psy2", name: "Dra. Jones" },
  { id: "all", name: "Todos os Psicólogos" },
];

const appointmentStatuses = [
    {value: "All", label: "Todos"},
    {value: "Scheduled", label: "Agendado"},
    {value: "Confirmed", label: "Confirmado"},
    {value: "Completed", label: "Realizada"},
    {value: "CancelledByPatient", label: "Cancelado (Paciente)"},
    {value: "CancelledByClinic", label: "Cancelado (Clínica)"},
    {value: "NoShow", label: "Falta"},
    {value: "Rescheduled", label: "Remarcado"},
    {value: "Blocked", label: "Bloqueado"}
] as const;

type AppointmentStatusFilter = typeof appointmentStatuses[number]["value"];

type ScheduleFilters = {
  psychologistId: string;
  status: AppointmentStatusFilter;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
};

const getStatusIcon = (status: AppointmentStatusFilter) => {
  switch (status) {
    case "Scheduled":
      return <Clock className="w-3 h-3 mr-1 inline-block" />;
    case "Confirmed":
      return <UserCheck className="w-3 h-3 mr-1 inline-block" />;
    case "Completed":
      return <CheckCircle className="w-3 h-3 mr-1 inline-block" />;
    case "CancelledByPatient":
    case "NoShow":
      return <UserX className="w-3 h-3 mr-1 inline-block" />;
    case "CancelledByClinic":
      return <Ban className="w-3 h-3 mr-1 inline-block" />;
    case "Blocked":
      return <AlertTriangle className="w-3 h-3 mr-1 inline-block" />;
    case "Rescheduled":
      return <RepeatIcon className="w-3 h-3 mr-1 inline-block" />;
    default:
      return <Clock className="w-3 h-3 mr-1 inline-block" />;
  }
};

const getStatusLabel = (status: AppointmentStatusFilter): string => {
  const labels: Record<AppointmentStatusFilter, string> = {
    All: "Todos",
    Scheduled: "Agendado",
    Confirmed: "Confirmado",
    Completed: "Realizada",
    CancelledByPatient: "Cancelado (Paciente)",
    CancelledByClinic: "Cancelado (Clínica)",
    NoShow: "Falta",
    Rescheduled: "Remarcado",
    Blocked: "Bloqueado",
  };
  return labels[status] || status;
};


export default function TodaySchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<"Month" | "Week" | "Day">("Day"); 
  const [appointmentsData, setAppointmentsData] = useState<AppointmentsByDate>(() => getInitialMockAppointments());
  const { toast } = useToast();

  const [filters, setFilters] = useState<ScheduleFilters>({
    psychologistId: "all",
    status: "All",
    dateFrom: undefined,
    dateTo: undefined,
  });

  const [tasksForCurrentDate, setTasksForCurrentDate] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  const todayAppointments = useMemo(() => {
    const todayKey = format(currentDate, 'yyyy-MM-dd');
    return (appointmentsData[todayKey] || []).sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );
  }, [appointmentsData, currentDate]);

  useEffect(() => {
    async function fetchTasksForDate() {
      setIsLoadingTasks(true);
      try {
        const tasks = await getTasksForDate(currentDate);
        setTasksForCurrentDate(tasks);
      } catch (error) {
        
        toast({
          title: "Erro ao Carregar Tarefas",
          description: "Não foi possível buscar as tarefas para hoje.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingTasks(false);
      }
    }
    fetchTasksForDate();
  }, [currentDate, toast]);


  const handleFilterChange = <K extends keyof ScheduleFilters>(
    filterName: K,
    value: ScheduleFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };
  
  const currentMonthYear = format(currentDate, 'MMMM yyyy', { locale: ptBR });

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (currentView === "Month") {
        newDate.setMonth(currentDate.getMonth() + (direction === 'prev' ? -1 : 1));
    } else if (currentView === "Week") {
        newDate.setDate(currentDate.getDate() + (direction === 'prev' ? -7 : 7));
    } else { 
        newDate.setDate(currentDate.getDate() + (direction === 'prev' ? -1 : 1));
    }
    setCurrentDate(newDate);
  };

  const displayDateRange = () => {
    if (currentView === "Month") return currentMonthYear.charAt(0).toUpperCase() + currentMonthYear.slice(1);
    if (currentView === "Week") {
        const startOfWeekDate = startOfWeek(currentDate, { weekStartsOn: 1, locale: ptBR });
        const endOfWeekDate = endOfWeek(currentDate, { weekStartsOn: 1, locale: ptBR});
        return `${format(startOfWeekDate, "d MMM", {locale: ptBR})} - ${format(endOfWeekDate, "d MMM, yyyy", {locale: ptBR})}`;
    }
    return format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  }

  const handleExportICS = () => {
    const appointmentsToExport: AppointmentsByDate = {};
    const dateKeys = Object.keys(appointmentsData);

    if (currentView === "Day") {
        const dayKey = format(currentDate, "yyyy-MM-dd");
        if (appointmentsData[dayKey]) {
            appointmentsToExport[dayKey] = appointmentsData[dayKey];
        }
    } else if (currentView === "Week") {
        const weekSt = startOfWeek(currentDate, { weekStartsOn: 1, locale: ptBR });
        const weekEn = endOfWeek(currentDate, { weekStartsOn: 1, locale: ptBR });
        const weekDays = eachDayOfInterval({ start: weekSt, end: weekEn });
        weekDays.forEach(day => {
            const dayKey = format(day, "yyyy-MM-dd");
            if (appointmentsData[dayKey]) {
                appointmentsToExport[dayKey] = appointmentsData[dayKey];
            }
        });
    } else { 
        const monthSt = startOfMonth(currentDate);
        const monthEn = endOfMonth(currentDate);
         dateKeys.forEach(dateKey => {
            const apptDate = parse(dateKey, 'yyyy-MM-dd', new Date());
            if (isWithinInterval(apptDate, { start: monthSt, end: monthEn })) {
                if (appointmentsData[dateKey]) {
                    appointmentsToExport[dateKey] = appointmentsData[dateKey];
                }
            }
        });
    }
    
    const finalAppointmentsToExport: AppointmentsByDate = {};
    for (const dateKey in appointmentsToExport) {
        finalAppointmentsToExport[dateKey] = (appointmentsToExport[dateKey] || []).filter(appt => {
            const matchesPsychologist = filters.psychologistId === "all" || appt.psychologistId === filters.psychologistId;
            const matchesStatus = filters.status === "All" || appt.status === filters.status;
            return matchesPsychologist && matchesStatus;
        });
         if (finalAppointmentsToExport[dateKey].length === 0) {
            delete finalAppointmentsToExport[dateKey];
        }
    }

    if (Object.keys(finalAppointmentsToExport).length === 0) {
      toast({ title: "Nenhum Agendamento", description: "Não há agendamentos para exportar na visualização atual com os filtros aplicados." });
      return;
    }

    const icsString = generateICS(finalAppointmentsToExport);
    const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `psiguard_agenda_${currentView.toLowerCase()}_${format(currentDate, "yyyyMMdd")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Agenda Exportada", description: "O arquivo .ics foi baixado com sucesso." });
  };
  
  const handleAppointmentsUpdate = useCallback((updatedAppointments: AppointmentsByDate) => {
    setAppointmentsData(updatedAppointments);
  }, []);


  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-var(--header-height,4rem)-2rem)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-headline font-bold">Agenda de Hoje</h1>
        </div>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href="/schedule/new">
            <span>
              <PlusCircle className="mr-2 h-4 w-4" /> Novo Agendamento
            </span>
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between p-3 sm:p-4 border rounded-lg shadow-sm bg-card gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateDate('prev')} aria-label="Visualização anterior da agenda"><ChevronLeft className="h-4 w-4" /></Button>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground min-w-[150px] sm:min-w-[240px] text-center capitalize">{displayDateRange()}</h2>
          <Button variant="outline" size="icon" onClick={() => navigateDate('next')} aria-label="Próxima visualização da agenda"><ChevronRight className="h-4 w-4" /></Button>
        </div>
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Hoje</Button>
          
          <div className="flex items-center rounded-md border overflow-hidden">
            <Button 
              variant={currentView === "Day" ? "secondary" : "ghost"} 
              size="sm" 
              onClick={() => setCurrentView("Day")}
              className="rounded-none border-r"
            >
              Dia
            </Button>
            <Button 
              variant={currentView === "Week" ? "secondary" : "ghost"} 
              size="sm" 
              onClick={() => setCurrentView("Week")}
              className="rounded-none border-r"
            >
              Semana
            </Button>
            <Button 
              variant={currentView === "Month" ? "secondary" : "ghost"} 
              size="sm" 
              onClick={() => setCurrentView("Month")}
              className="rounded-none"
            >
              Mês
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportICS} title="Exportar visualização atual para .ics" aria-label="Exportar visualização atual da agenda para arquivo ICS">
              <Download className="mr-0 sm:mr-1 h-4 w-4" /> <span className="hidden sm:inline">Exportar</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Filtrar agendamentos">
                  <ListFilter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 p-2" align="end">
                <DropdownMenuLabel>Filtrar Por</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <div className="space-y-2 px-2 py-1.5">
                    <Label htmlFor="filterPsychologist">Psicólogo(a)</Label>
                    <Select
                      value={filters.psychologistId}
                      onValueChange={(value) => handleFilterChange("psychologistId", value)}
                    >
                      <SelectTrigger id="filterPsychologist">
                        <SelectValue placeholder="Selecione psicólogo(a)" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockPsychologists.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 px-2 py-1.5">
                    <Label htmlFor="filterStatus">Status</Label>
                    <Select
                      value={filters.status}
                      onValueChange={(value) => handleFilterChange("status", value)}
                    >
                      <SelectTrigger id="filterStatus">
                        <SelectValue placeholder="Selecione status" />
                      </SelectTrigger>
                      <SelectContent>
                        {appointmentStatuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 px-2 py-1.5">
                      <Label>Intervalo de Datas</Label>
                      <div className="flex gap-2">
                          <Popover>
                              <PopoverTrigger asChild>
                                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                                      {filters.dateFrom ? format(filters.dateFrom, "P", {locale: ptBR}) : <span>De</span>}
                                  </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                  <CalendarComponent locale={ptBR} mode="single" selected={filters.dateFrom} onSelect={(date) => handleFilterChange("dateFrom", date)} initialFocus />
                              </PopoverContent>
                          </Popover>
                           <Popover>
                              <PopoverTrigger asChild>
                                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                                      {filters.dateTo ? format(filters.dateTo, "P", {locale: ptBR}) : <span>Até</span>}
                                  </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                  <CalendarComponent locale={ptBR} mode="single" selected={filters.dateTo} onSelect={(date) => handleFilterChange("dateTo", date)} initialFocus />
                              </PopoverContent>
                          </Popover>
                      </div>
                  </div>
                </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                      <Button className="w-full" size="sm" onClick={() => { /* Aplicar filtros */ }}>Aplicar Filtros</Button>
                  </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-auto border rounded-lg shadow-sm bg-card border-t border-zinc-200 mt-4 pt-4">
        <AppointmentCalendar 
            view={currentView} 
            currentDate={currentDate} 
            filters={filters} 
        onAppointmentsUpdate={handleAppointmentsUpdate}
        />
      </div>

      <Card className="shadow-sm border-t border-zinc-200 mt-4 pt-4">
        <CardHeader>
          <CardTitle className="font-headline flex items-center">
            <CalendarDays className="mr-2 h-5 w-5 text-primary" />
            Agendamentos de {format(currentDate, "P", { locale: ptBR })}
          </CardTitle>
          <CardDescription>{todayAppointments.length} agendamento(s) para hoje.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {todayAppointments.length === 0 && (
            <p className="text-muted-foreground">Nenhum agendamento para hoje.</p>
          )}
          {todayAppointments.map((appt) => (
            <div key={appt.id} className="p-3 border rounded-md flex items-center justify-between">
              <div>
                <p className="font-medium">{appt.patient}</p>
                <p className="text-sm text-muted-foreground">{appt.startTime}</p>
              </div>
              <Badge variant="outline" className="capitalize flex items-center">
                {getStatusIcon(appt.status)}
                {getStatusLabel(appt.status as AppointmentStatusFilter)}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-sm border-t border-zinc-200 mt-4 pt-4">
        <CardHeader>
          <CardTitle className="font-headline flex items-center">
            <CheckSquare className="mr-2 h-5 w-5 text-primary"/>
            Tarefas para {format(currentDate, "P", { locale: ptBR })}
            </CardTitle>
          <CardDescription>Tarefas com vencimento hoje ({isLoadingTasks ? '...' : tasksForCurrentDate.length}).</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTasks ? (
            Array.from({ length: 2 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="p-3 border rounded-md bg-secondary/30 mb-2">
                    <Skeleton className="h-5 w-3/4 mb-1" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            ))
          ) : tasksForCurrentDate.length > 0 ? (
            <div className="space-y-3 divide-y divide-zinc-200">
              {tasksForCurrentDate.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Nenhuma tarefa para hoje.</p>
          )}
        </CardContent>
      </Card>

    </div>
  );
}


"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { CheckSquare, PlusCircle, Search, Filter, CalendarClock, UserCog, AlertTriangle, CheckCircle2, CalendarIcon } from "lucide-react";
import Link from "next/link";
import TaskItem from "@/components/tasks/task-item";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import dynamic from "next/dynamic";
const CalendarComponent = dynamic(() => import("@/components/ui/calendar").then(m => m.Calendar), { ssr: false });
import { Label } from '@/components/ui/label';
import { format, isEqual, startOfDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Task, TaskStatus, TaskPriority } from "@/types";
import { getTasks } from '@/services/taskService'; // Importar o serviço
import { Skeleton } from '@/components/ui/skeleton';

const taskStatusOptions: {value: TaskStatus | "All", label: string}[] = [
    {value: "All", label: "Todos os Status"},
    {value: "Pendente", label: "Pendente"},
    {value: "Em Progresso", label: "Em Progresso"},
    {value: "Concluída", label: "Concluída"},
];
const taskPriorityOptions: {value: TaskPriority | "All", label: string}[] = [
    {value: "All", label: "Todas as Prioridades"},
    {value: "Alta", label: "Alta"},
    {value: "Média", label: "Média"},
    {value: "Baixa", label: "Baixa"},
];

type TaskFilters = {
  status: TaskStatus | "All";
  priority: TaskPriority | "All";
  assignedTo: string;
  dueDate?: Date;
};

export default function TasksPage() {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<TaskFilters>({
    status: "All",
    priority: "All",
    assignedTo: "Todos",
    dueDate: undefined,
  });

  useEffect(() => {
    async function fetchTasks() {
      setIsLoadingTasks(true);
      try {
        const tasks = await getTasks();
        setAllTasks(tasks);
      } catch (error) {
        console.error("Erro ao buscar tarefas:", error);
        // Tratar erro, talvez com um toast
      } finally {
        setIsLoadingTasks(false);
      }
    }
    fetchTasks();
  }, []);

  const handleFilterChange = <K extends keyof TaskFilters>(
    filterName: K,
    value: TaskFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const resetFilters = () => {
    setFilters({
        status: "All",
        priority: "All",
        assignedTo: "Todos",
        dueDate: undefined,
    });
    setSearchTerm("");
  }

  const uniqueAssignees = useMemo(() => {
    if (isLoadingTasks) return ["Todos"];
    const assignees = new Set(allTasks.map(task => task.assignedTo));
    return ["Todos", ...Array.from(assignees)];
  }, [allTasks, isLoadingTasks]);

  const filteredTasks = useMemo(() => {
    if (isLoadingTasks) return [];
    return allTasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (task.patientId && `paciente:${task.patientId}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filters.status === "All" || task.status === filters.status;
      const matchesPriority = filters.priority === "All" || task.priority === filters.priority;
      const matchesAssignee = filters.assignedTo === "Todos" || task.assignedTo === filters.assignedTo;
      
      let taskDueDateValid = false;
      try {
          taskDueDateValid = !filters.dueDate || isEqual(startOfDay(parseISO(task.dueDate)), startOfDay(filters.dueDate));
      } catch (e) {
          // console.error("Data inválida para tarefa:", task.title, task.dueDate); // Debug log removed
      }
      
      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee && taskDueDateValid;
    });
  }, [searchTerm, filters, allTasks, isLoadingTasks]);

  const pendingTasks = filteredTasks.filter(task => task.status === "Pendente" || task.status === "Em Progresso").sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const completedTasks = filteredTasks.filter(task => task.status === "Concluída").sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

  const renderTaskItems = (tasks: Task[]) => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );

  const renderSkeletons = (count: number = 3) => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="shadow-sm">
          <CardHeader className="p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-5 w-5 mt-0.5" />
              <div className="flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2 mt-2" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          </CardHeader>
          <CardFooter className="p-3 border-t flex justify-end gap-1.5">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-7 w-20" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-headline font-bold">Tarefas</h1>
        </div>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href="/tasks/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Nova Tarefa
          </Link>
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="font-headline">Gerenciar Tarefas</CardTitle>
          <CardDescription>Acompanhe e gerencie as tarefas da sua equipe.</CardDescription>
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar tarefas por título, responsável ou 'paciente:id'..." 
                className="pl-8" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" /> Filtros
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 p-2" align="end">
                <DropdownMenuLabel>Filtrar Tarefas</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <div className="space-y-2 px-2 py-1.5">
                    <Label htmlFor="filterStatus">Status</Label>
                    <Select value={filters.status} onValueChange={(value: TaskStatus | "All") => handleFilterChange("status", value)}>
                      <SelectTrigger id="filterStatus"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {taskStatusOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 px-2 py-1.5">
                    <Label htmlFor="filterPriority">Prioridade</Label>
                    <Select value={filters.priority} onValueChange={(value: TaskPriority | "All") => handleFilterChange("priority", value)}>
                      <SelectTrigger id="filterPriority"><SelectValue /></SelectTrigger>
                      <SelectContent>
                         {taskPriorityOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 px-2 py-1.5">
                    <Label htmlFor="filterAssignee">Responsável</Label>
                    <Select value={filters.assignedTo} onValueChange={(value) => handleFilterChange("assignedTo", value)}>
                      <SelectTrigger id="filterAssignee"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {uniqueAssignees.map(assignee => <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 px-2 py-1.5">
                    <Label htmlFor="filterDueDate">Data de Vencimento</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button id="filterDueDate" variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.dueDate ? format(filters.dueDate, "P", {locale: ptBR}) : <span>Escolha uma data</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent locale={ptBR} mode="single" selected={filters.dueDate} onSelect={(date) => handleFilterChange("dueDate", date)} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                 <DropdownMenuItem>
                    <Button className="w-full" size="sm" variant="ghost" onClick={resetFilters}>Limpar Filtros</Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending">
                <AlertTriangle className="mr-2 h-4 w-4" /> Pendentes ({isLoadingTasks ? '...' : pendingTasks.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                <CheckCircle2 className="mr-2 h-4 w-4" /> Concluídas ({isLoadingTasks ? '...' : completedTasks.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="mt-4">
              {isLoadingTasks ? renderSkeletons() : 
                pendingTasks.length > 0 ? renderTaskItems(pendingTasks) : (
                <div className="text-center py-10">
                    <Search className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <p className="mt-2 text-muted-foreground">Nenhuma tarefa pendente corresponde aos seus filtros.</p>
                    { (filters.status !== "All" || filters.priority !== "All" || filters.assignedTo !== "Todos" || filters.dueDate || searchTerm) &&
                        <Button variant="link" onClick={resetFilters} className="mt-2">Limpar filtros</Button>
                    }
                </div>
              )}
            </TabsContent>
            <TabsContent value="completed" className="mt-4">
              {isLoadingTasks ? renderSkeletons() :
                completedTasks.length > 0 ? renderTaskItems(completedTasks) : (
                <div className="text-center py-10">
                    <Search className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <p className="mt-2 text-muted-foreground">Nenhuma tarefa concluída corresponde aos seus filtros.</p>
                     { (filters.status !== "All" || filters.priority !== "All" || filters.assignedTo !== "Todos" || filters.dueDate || searchTerm) &&
                        <Button variant="link" onClick={resetFilters} className="mt-2">Limpar filtros</Button>
                    }
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
    

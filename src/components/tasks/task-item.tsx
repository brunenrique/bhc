
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarClock, UserCog, Edit, Trash2, AlertTriangle, CheckCircle2, LinkIcon, ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Import useRouter
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Task } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/shared/utils';

interface TaskItemProps {
  task: Task;
}

function TaskItemComponent({ task }: TaskItemProps) {
  const { toast } = useToast();
  const router = useRouter(); // Initialize useRouter
  const [isExpanded, setIsExpanded] = React.useState(false);

  const getPriorityBadgeVariant = (): "destructive" | "secondary" | "outline" => {
    if (task.priority === "Alta") return "destructive";
    if (task.priority === "Média") return "secondary";
    return "outline";
  };

  const getStatusIcon = (sizeClass = "h-4 w-4") => {
    if (task.status === "Concluída") return <CheckCircle2 className={cn(sizeClass, "text-green-500")} />;
    if (task.status === "Em Progresso") return <UserCog className={cn(sizeClass, "text-blue-500")} />; 
    return <AlertTriangle className={cn(sizeClass, "text-yellow-500")} />;
  };

  const handleDeleteTask = () => {
    toast({
      title: "Tarefa Excluída (Simulado)",
      description: `A tarefa "${task.title}" foi excluída.`,
      variant: "destructive"
    });
    // Em uma aplicação real, você precisaria atualizar o estado ou re-buscar os dados.
  };
  
  const handleToggleStatus = () => {
    const newStatus = task.status === "Concluída" ? "Pendente" : "Concluída";
     toast({
      title: "Status da Tarefa Alterado (Simulado)",
      description: `Tarefa "${task.title}" marcada como ${newStatus}.`,
    });
    // Em uma aplicação real, você precisaria atualizar o estado da tarefa.
  }

  return (
    <Card className={cn("shadow-sm hover:shadow-md transition-shadow", task.status === "Concluída" && "bg-muted/50 opacity-80")}>
      <CardHeader className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center space-x-2 pt-0.5">
            <Checkbox 
              id={`task-check-${task.id}`} 
              checked={task.status === "Concluída"}
              onCheckedChange={handleToggleStatus}
              aria-label={`Marcar tarefa "${task.title}" como ${task.status === "Concluída" ? 'pendente' : 'concluída'}`} 
            />
            {getStatusIcon()}
          </div>
          <div className="flex-1">
            <CardTitle
              className={cn(
                "text-base font-semibold leading-tight cursor-pointer hover:text-accent hover:bg-zinc-50 transition-colors",
                task.status === "Concluída" && "line-through text-muted-foreground"
              )}
              onClick={() => router.push(`/tasks/edit/${task.id}`)} // Navegar ao clicar no título
            >
              {task.title}
            </CardTitle>
            <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 mt-1">
              <span className="flex items-center"><CalendarClock className="mr-1 h-3 w-3" /> Venc.: {format(new Date(task.dueDate), "P", { locale: ptBR })}</span>
              <span className="flex items-center"><UserCog className="mr-1 h-3 w-3" /> Para: {task.assignedTo}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant={getPriorityBadgeVariant()} className="text-xs">{task.priority}</Badge>
             <Button
                variant="ghost"
                className="flex items-center gap-2 text-sm font-medium h-7"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label="Expandir/Recolher detalhes da tarefa"
             >
                <ChevronsUpDown className="h-4 w-4" /> Detalhes
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="px-4 pb-3 pt-0">
          {task.description && (
            <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap border-l-2 border-border pl-2">
              {task.description}
            </p>
          )}
          {task.patientId && (
            <Button variant="link" size="sm" className="p-0 h-auto text-accent text-xs" asChild>
              <Link href={`/patients/${task.patientId}`}>
                <span className="inline-flex items-center gap-2">
                  <LinkIcon className="h-3.5 w-3.5" />
                  Ver Paciente Relacionado
                </span>
              </Link>
            </Button>
          )}
        </CardContent>
      )}

      <CardFooter className="p-3 border-t flex justify-end gap-1.5">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/tasks/edit/${task.id}`}>
              <span className="inline-flex items-center gap-2">
                <Edit className="h-3.5 w-3.5" />
                Editar
              </span>
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:border-destructive/50">
                <span className="inline-flex items-center gap-2">
                  <Trash2 className="h-3.5 w-3.5" />
                  Excluir
                </span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Excluir Tarefa?</AlertDialogTitle>
                <AlertDialogDescription>
                    Tem certeza que deseja excluir a tarefa &quot;{task.title}&quot;? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteTask} className="bg-destructive hover:bg-destructive/90">
                    Excluir
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
      </CardFooter>
    </Card>
  );
}

const TaskItem = React.memo(TaskItemComponent);
export default TaskItem;

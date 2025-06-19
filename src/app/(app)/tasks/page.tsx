
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CheckSquare, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getTasks } from "@/services/taskService";
import { mockPatients } from "@/mocks/patients";
import type { Task } from "@/types";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTasks().then((t) => {
      setTasks(t);
      setLoading(false);
    });
  }, []);

  const getPatientName = (id?: string) => {
    if (!id) return "-";
    return mockPatients.find((p) => p.id === id)?.name || id;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-headline font-bold">Tarefas</h1>
        </div>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href="/tasks/new">
            <span className="inline-flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Nova Tarefa
            </span>
          </Link>
        </Button>
      </div>

      <Card className="shadow-sm border-t border-zinc-200 mt-4 pt-4">
        <CardHeader>
          <CardTitle className="font-headline">Lista de Tarefas</CardTitle>
          <CardDescription>Gerencie as tarefas registradas na aplicação.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma tarefa encontrada.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-zinc-200">
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">
                      <Link href={`/tasks/edit/${task.id}`} className="hover:underline">
                        {task.title}
                      </Link>
                    </TableCell>
                    <TableCell>{getPatientName(task.patientId)}</TableCell>
                    <TableCell>{format(new Date(task.dueDate), "P", { locale: ptBR })}</TableCell>
                    <TableCell>{task.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


"use client"; // Pode ser necessário se usarmos hooks ou se for chamado por client components. Por ora, seguro adicionar.

import type { Task, TaskStatus, TaskPriority } from "@/types";
import { format, isEqual, startOfDay, parse } from 'date-fns';

// Mock data for tasks - agora centralizado aqui.
export const mockTasksData: Task[] = [
  { id: "task1", title: "Acompanhar Alice W.", description: "Ligar para Alice para verificar seu progresso e agendar próxima consulta.", dueDate: "2024-07-25", assignedTo: "Dr. Silva", status: "Pendente", priority: "Alta", patientId: "1" },
  { id: "task2", title: "Preparar relatório de avaliação para Bob B.", description: "Compilar os resultados da avaliação GAD-7 e BDI para Bob.", dueDate: "2024-07-22", assignedTo: "Secretaria", status: "Em Progresso", priority: "Média", patientId: "2" },
  { id: "task3", title: "Revisar entrada de novo paciente - Charlie B.", description: "Verificar todos os documentos e informações de Charlie.", dueDate: "2024-07-20", assignedTo: "Dra. Jones", status: "Concluída", priority: "Alta", patientId: "3" },
  { id: "task4", title: "Enviar lembrete para Diana P. para avaliação", description: "Diana precisa completar a PCL-5 até o final da semana.", dueDate: "2024-07-28", assignedTo: "Secretaria", status: "Pendente", priority: "Baixa", patientId: "4" },
  { id: "task5", title: "Atualizar documento de políticas da clínica", description: "Incorporar novas diretrizes de teleatendimento.", dueDate: "2024-08-01", assignedTo: "Admin", status: "Pendente", priority: "Média" },
];

/**
 * Retrieves all tasks (mocked).
 */
export async function getTasks(): Promise<Task[]> {
  // Simula um delay de rede
  await new Promise(resolve => setTimeout(resolve, 100));
  return [...mockTasksData]; // Retorna uma cópia para evitar mutações diretas no mock
}

/**
 * Retrieves a task by id from the mock list.
 */
export async function getTaskById(id: string): Promise<Task | undefined> {
  // Simula um delay de rede
  await new Promise(resolve => setTimeout(resolve, 50));
  return mockTasksData.find(task => task.id === id);
}

/**
 * Returns tasks scheduled for a specific date (mocked).
 */
export async function getTasksForDate(date: Date): Promise<Task[]> {
  await new Promise(resolve => setTimeout(resolve, 80));
  return mockTasksData.filter(task => {
    try {
      const taskDueDate = parse(task.dueDate, 'yyyy-MM-dd', new Date());
      return isEqual(startOfDay(taskDueDate), startOfDay(date));
    } catch (e) {
      // console.error("Erro ao parsear data da tarefa:", task.dueDate, e); // Removido
      return false;
    }
  });
}

// Futuras funções para adicionar, atualizar, deletar tarefas podem ser adicionadas aqui.
// Exemplo:
// export async function createTask(taskData: Omit<Task, 'id'>): Promise<Task> {
//   const newTask: Task = { ...taskData, id: `task_${Date.now()}` };
//   mockTasksData.push(newTask);
//   return newTask;
// }

// export async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task | undefined> {
//   const taskIndex = mockTasksData.findIndex(task => task.id === taskId);
//   if (taskIndex === -1) return undefined;
//   mockTasksData[taskIndex] = { ...mockTasksData[taskIndex], ...updates };
//   return mockTasksData[taskIndex];
// }

// export async function deleteTask(taskId: string): Promise<boolean> {
//   const initialLength = mockTasksData.length;
//   mockTasksData = mockTasksData.filter(task => task.id !== taskId);
//   return mockTasksData.length < initialLength;
// }

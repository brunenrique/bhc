export type TaskStatus = 'Pendente' | 'Em Progresso' | 'Concluída';
export type TaskPriority = 'Alta' | 'Média' | 'Baixa';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  assignedTo: string;
  status: TaskStatus;
  priority: TaskPriority;
  patientId?: string;
}

export interface WaitingListEntry {
  id: string;
  name: string;
  requestedPsychologist?: string;
  requestedPsychologistId?: string;
  dateAdded: string; // ISO date
  priority: TaskPriority;
  notes?: string;
  contactPhone?: string;
  contactEmail?: string;
}
export * from './assessment';
export * from './cards';

'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon, Save, CheckSquare, Edit } from 'lucide-react';
import { cn } from '@/shared/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import type { Task, TaskPriority, TaskStatus } from '@/types';
import { createTask, updateTask } from '@/services/taskService';

const taskFormSchema = z.object({
  title: z.string().min(3, { message: 'O título deve ter pelo menos 3 caracteres.' }),
  description: z.string().optional(),
  dueDate: z.date({ required_error: 'Por favor, selecione uma data de vencimento.' }),
  assignedTo: z.string().min(1, { message: 'Por favor, selecione um responsável.' }),
  priority: z.enum(['Alta', 'Média', 'Baixa'], {
    required_error: 'Por favor, selecione uma prioridade.',
  }),
  status: z.enum(['Pendente', 'Em Progresso', 'Concluída'], {
    required_error: 'Por favor, selecione um status.',
  }),
  patientId: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

// Simplified mock data for selects within the form
const mockAssignees = ['Dr. Silva', 'Dra. Jones', 'Secretaria', 'Admin'];
const mockPriorities: TaskPriority[] = ['Alta', 'Média', 'Baixa'];
const mockStatuses: TaskStatus[] = ['Pendente', 'Em Progresso', 'Concluída'];
const mockPatientsForSelect = [
  { id: '1', name: 'Alice Wonderland' },
  { id: '2', name: 'Bob O Construtor' },
  { id: '3', name: 'Charlie Brown' },
  { id: '4', name: 'Diana Prince' },
];

interface TaskFormProps {
  initialData?: Task;
  isEditMode?: boolean;
}

export default function TaskForm({ initialData, isEditMode = false }: TaskFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      dueDate: initialData?.dueDate ? new Date(initialData.dueDate) : undefined, // Initialize as undefined
      assignedTo: initialData?.assignedTo || '',
      priority: initialData?.priority || 'Média',
      status: initialData?.status || 'Pendente',
      patientId: initialData?.patientId || '',
    },
  });

  React.useEffect(() => {
    // Set default dueDate on client-side if not already set by initialData
    if (!form.getValues('dueDate') && !initialData?.dueDate) {
      form.setValue('dueDate', new Date());
    }
  }, [form, initialData?.dueDate]);

  async function onSubmit(data: TaskFormValues) {
    setIsLoading(true);
    const sanitizedData = {
      ...data,
      patientId: data.patientId === 'none' ? undefined : data.patientId,
    };
    const dataToSave = {
      ...initialData, // Spread initialData first to retain 'id' if editing
      ...sanitizedData,
      dueDate: format(data.dueDate, 'yyyy-MM-dd'), // Format date to string for saving
    };

    try {
      if (isEditMode && initialData?.id) {
        await updateTask(initialData.id, dataToSave);
        toast({
          title: 'Tarefa Atualizada',
          description: `A tarefa "${data.title}" foi atualizada com sucesso.`,
        });
      } else {
        await createTask(dataToSave as Omit<Task, 'id'>);
        toast({
          title: 'Tarefa Criada',
          description: `A tarefa "${data.title}" foi criada com sucesso.`,
        });
      }
      router.push('/tasks');
    } catch (err) {
      console.error(err);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a tarefa.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="shadow-lg">
      <Form {...form}>
        <form role="form" onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              {isEditMode ? (
                <Edit className="mr-2 h-6 w-6 text-primary" />
              ) : (
                <CheckSquare className="mr-2 h-6 w-6 text-primary" />
              )}
              {isEditMode ? 'Editar Tarefa' : 'Nova Tarefa'}
            </CardTitle>
            <CardDescription>
              {isEditMode
                ? 'Modifique os detalhes da tarefa.'
                : 'Preencha os detalhes para criar uma nova tarefa.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da Tarefa *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Preparar relatório de avaliação" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      aria-label="Descrição da tarefa"
                      placeholder="Detalhes adicionais sobre a tarefa..."
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Vencimento *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'P', { locale: ptBR })
                            ) : (
                              <span>Escolha uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setDate(new Date().getDate() - 1))
                          } // Allow today
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um responsável" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockAssignees.map((assignee) => (
                          <SelectItem key={assignee} value={assignee}>
                            {assignee}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a prioridade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockPriorities.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paciente Relacionado (Opcional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value ?? ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um paciente (se aplicável)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem key="none" value="none">
                        Nenhum
                      </SelectItem>
                      {mockPatientsForSelect.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              type="submit"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={isLoading}
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading
                ? isEditMode
                  ? 'Salvando...'
                  : 'Criando...'
                : isEditMode
                  ? 'Salvar Alterações'
                  : 'Criar Tarefa'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

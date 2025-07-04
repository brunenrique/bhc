'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription as ShadCnCardDescription,
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
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Save, Repeat, User, Briefcase } from 'lucide-react';
import { cn } from '@/shared/utils';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import useAuth from '@/hooks/use-auth';
import { insertOrUpdateEvent, hasTokens } from '@/services/googleCalendar';
import * as Sentry from '@sentry/nextjs';
import logger from '@/lib/logger';

const mockPatients = [
  { id: '1', name: 'Alice Wonderland' },
  { id: '2', name: 'Bob O Construtor' },
  { id: '3', name: 'Charlie Brown' },
  { id: 'wl1', name: 'Edward Mãos de Tesoura' },
  { id: 'wl2', name: 'Fiona Gallagher' },
  { id: 'wl3', name: 'George Jetson' },
  { id: 'wl4', name: 'Harry Potter' },
  { id: 'apptToday1', name: 'Paciente Teste Hoje' },
  { id: 'apptToday2', name: 'Diana Prince' },
  { id: 'apptOld1', name: 'Old Patient' },
  { id: 'apptFuture1', name: 'Future Patient' },
];
const mockPsychologists = [
  { id: 'psy1', name: 'Dr. Silva' },
  { id: 'psy2', name: 'Dra. Jones' },
  { id: 'any', name: 'Qualquer Psicólogo(a)' },
];
const appointmentTypes = [
  'Consulta Inicial',
  'Acompanhamento',
  'Sessão de Terapia',
  'Revisão de Avaliação',
  'Sessão em Grupo',
];
const daysOfWeek = [
  { id: 'SU', label: 'Dom' },
  { id: 'MO', label: 'Seg' },
  { id: 'TU', label: 'Ter' },
  { id: 'WE', label: 'Qua' },
  { id: 'TH', label: 'Qui' },
  { id: 'FR', label: 'Sex' },
  { id: 'SA', label: 'Sáb' },
];

const appointmentFormSchema = z
  .object({
    patientId: z.string().optional(),
    psychologistId: z.string().min(1, { message: 'Por favor, selecione um(a) psicólogo(a).' }),
    appointmentDate: z.date({ required_error: 'Por favor, selecione uma data.' }),
    startTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Formato de hora inválido (HH:mm).' }),
    endTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Formato de hora inválido (HH:mm).' }),
    appointmentType: z.string().optional(),
    notes: z.string().optional(),
    isRecurring: z.boolean().default(false),
    recurrenceFrequency: z.enum(['none', 'daily', 'weekly', 'monthly']).optional(),
    recurrenceInterval: z.coerce.number().min(1).optional(),
    recurrenceEndDate: z.date().optional(),
    recurrenceDaysOfWeek: z.array(z.string()).optional(),
    isBlockTime: z.boolean().default(false),
    blockReason: z.string().optional(),
    prefilledPatientName: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.isBlockTime) return true;
      if (!data.patientId && !data.prefilledPatientName) return false;
      return true;
    },
    {
      message: 'Paciente é obrigatório a menos que seja um bloqueio de horário.',
      path: ['patientId'],
    }
  )
  .refine(
    (data) => {
      if (data.isBlockTime) return true;
      if (!data.appointmentType) return false;
      return true;
    },
    {
      message: 'Tipo de agendamento é obrigatório a menos que seja um bloqueio de horário.',
      path: ['appointmentType'],
    }
  )
  .refine(
    (data) => {
      if (data.isBlockTime) return true;
      if (!data.startTime || !data.endTime) return true;
      const [startHour, startMinute] = data.startTime.split(':').map(Number);
      const [endHour, endMinute] = data.endTime.split(':').map(Number);
      if (endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
        return false;
      }
      return true;
    },
    {
      message: 'A hora final deve ser após a hora inicial.',
      path: ['endTime'],
    }
  )
  .refine(
    (data) => {
      if (data.isBlockTime && !data.blockReason) return false;
      return true;
    },
    {
      message: 'O motivo é obrigatório para bloqueio de horário.',
      path: ['blockReason'],
    }
  )
  .refine(
    (data) => {
      if (data.isRecurring && data.recurrenceFrequency && data.recurrenceFrequency !== 'none') {
        if (!data.recurrenceInterval || data.recurrenceInterval < 1) {
          return false;
        }
        if (
          data.recurrenceFrequency === 'weekly' &&
          (!data.recurrenceDaysOfWeek || data.recurrenceDaysOfWeek.length === 0)
        ) {
          return false;
        }
      }
      return true;
    },
    {
      message: 'Detalhes da recorrência estão incompletos ou inválidos.',
      path: ['recurrenceInterval'],
    }
  );

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

interface AppointmentFormProps {
  appointmentData?: Partial<AppointmentFormValues & { id?: string }>;
}

export default function AppointmentForm({ appointmentData }: AppointmentFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const { user } = useAuth();

  const prefilledPatientNameParam = searchParams.get('patientName');
  const prefilledPsychologistIdParam = searchParams.get('psychologistId');
  const prefilledDateParam = searchParams.get('date');
  const prefilledIsBlockTime = searchParams.get('isBlockTime') === 'true';

  const initialDate = prefilledDateParam
    ? parse(prefilledDateParam, 'yyyy-MM-dd', new Date())
    : appointmentData?.appointmentDate
      ? new Date(appointmentData.appointmentDate)
      : undefined;

  const foundPatient = mockPatients.find((p) => p.name === prefilledPatientNameParam);
  const initialPatientId = appointmentData?.patientId || (foundPatient ? foundPatient.id : '');
  const initialPrefilledPatientName =
    !foundPatient && prefilledPatientNameParam
      ? prefilledPatientNameParam
      : appointmentData?.prefilledPatientName || '';

  const initialPsychologistId =
    appointmentData?.psychologistId || prefilledPsychologistIdParam || 'any';

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patientId: initialPatientId,
      prefilledPatientName: initialPrefilledPatientName,
      psychologistId: initialPsychologistId,
      appointmentDate: initialDate,
      startTime: appointmentData?.startTime || '09:00',
      endTime: appointmentData?.endTime || '10:00',
      appointmentType: appointmentData?.appointmentType || '',
      notes: appointmentData?.notes || '',
      isRecurring: appointmentData?.isRecurring || false,
      recurrenceFrequency: appointmentData?.recurrenceFrequency || 'none',
      recurrenceInterval: appointmentData?.recurrenceInterval || 1,
      recurrenceEndDate: appointmentData?.recurrenceEndDate
        ? new Date(appointmentData.recurrenceEndDate)
        : undefined,
      recurrenceDaysOfWeek: appointmentData?.recurrenceDaysOfWeek || [],
      isBlockTime: prefilledIsBlockTime || appointmentData?.isBlockTime || false,
      blockReason: appointmentData?.blockReason || '',
    },
  });

  React.useEffect(() => {
    if (!form.getValues('appointmentDate') && !initialDate) {
      form.setValue('appointmentDate', new Date());
    }
  }, [form, initialDate]);

  const isBlockTime = form.watch('isBlockTime');
  const isRecurring = form.watch('isRecurring');
  const recurrenceFrequency = form.watch('recurrenceFrequency');

  React.useEffect(() => {
    if (isBlockTime) {
      form.setValue('patientId', undefined);
      form.setValue('prefilledPatientName', undefined);
      form.setValue('appointmentType', undefined);
      form.setValue('isRecurring', false);
    } else {
      form.setValue('blockReason', undefined);
    }
  }, [isBlockTime, form]);

  async function onSubmit(data: AppointmentFormValues) {
    setIsLoading(true);

    const payload = {
      patient:
        data.prefilledPatientName ||
        mockPatients.find((p) => p.id === data.patientId)?.name ||
        'N/A',
      psychologistId: data.psychologistId,
      appointmentDate: format(data.appointmentDate, 'yyyy-MM-dd'),
      startTime: data.startTime,
      endTime: data.endTime,
      type: data.isBlockTime ? 'Blocked Slot' : data.appointmentType || 'Agendamento',
      notes: data.notes,
      isBlockTime: data.isBlockTime,
    };

    try {
      const res = await fetch('/api/createAppointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 409) {
        toast({
          title: 'Conflito de Horário',
          description:
            'Já existe um agendamento ou bloqueio para este(a) psicólogo(a) no intervalo selecionado. Por favor, escolha outro horário.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      if (!res.ok) {
        toast({
          title: 'Erro ao Salvar',
          description: 'Falha ao salvar o agendamento. Por favor, tente novamente.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      await res.json();
      if (user && hasTokens(user.uid)) {
        try {
          const start = parse(
            `${format(data.appointmentDate, 'yyyy-MM-dd')} ${data.startTime}`,
            'yyyy-MM-dd HH:mm',
            new Date()
          );
          const end = parse(
            `${format(data.appointmentDate, 'yyyy-MM-dd')} ${data.endTime}`,
            'yyyy-MM-dd HH:mm',
            new Date()
          );
          await insertOrUpdateEvent(user.uid, {
            summary: data.isBlockTime
              ? `Bloqueio: ${data.blockReason}`
              : `${payload.patient} - ${payload.type}`,
            description: data.notes,
            start: { dateTime: start.toISOString() },
            end: { dateTime: end.toISOString() },
          });
        } catch (err) {
          Sentry.captureException(err);
          logger.error({ action: 'calendar_sync_error', meta: { error: err } });
        }
      }
      toast({
        title: data.isBlockTime
          ? 'Horário Bloqueado'
          : appointmentData?.id
            ? 'Agendamento Atualizado'
            : 'Agendamento Criado',
        description: `O ${data.isBlockTime ? 'horário' : 'agendamento'} para ${data.isBlockTime ? data.blockReason : payload.patient} em ${format(data.appointmentDate, 'P', { locale: ptBR })} foi ${appointmentData?.id ? 'atualizado' : 'criado'} com sucesso.`,
      });
      router.push('/schedule');
    } catch (e) {
      Sentry.captureException(e);
      logger.error({ action: 'save_appointment_error', meta: { error: e } });
      toast({
        title: 'Erro Inesperado',
        description: 'Ocorreu uma falha inesperada ao salvar. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="shadow-lg">
      <Form {...form}>
        <form role="form" aria-busy={isLoading} onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="font-headline text-xl">
              {appointmentData?.id
                ? 'Editar Agendamento'
                : isBlockTime
                  ? 'Bloquear Horário na Agenda'
                  : 'Novo Agendamento'}
            </CardTitle>
            <ShadCnCardDescription>
              {isBlockTime
                ? 'Indique um período de indisponibilidade na agenda.'
                : 'Preencha os detalhes para criar ou editar uma consulta.'}
            </ShadCnCardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="isBlockTime"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm bg-muted/30">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="isBlockTime"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel htmlFor="isBlockTime" className="font-medium cursor-pointer">
                      Marcar como bloqueio (ex: reunião, almoço, indisponibilidade)
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {!isBlockTime && (
              <>
                {form.getValues('prefilledPatientName') ? (
                  <FormField
                    control={form.control}
                    name="prefilledPatientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Paciente *</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly className="bg-muted/50" />
                        </FormControl>
                        <FormDescription>
                          Paciente selecionado da lista de espera. Se não existir, um novo cadastro
                          pode ser necessário.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="patientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Paciente *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <User className="mr-2 h-4 w-4 text-muted-foreground" />
                              <SelectValue placeholder="Nome do paciente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mockPatients.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="appointmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Agendamento *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Finalidade da consulta" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {appointmentTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {isBlockTime && (
              <FormField
                control={form.control}
                name="blockReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo do Bloqueio *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Reunião de Equipe, Intervalo Pessoal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="psychologistId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Psicólogo(a) *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <User className="mr-2 h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Psicólogo(a) responsável" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockPsychologists.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
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
                name="appointmentDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data *</FormLabel>
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
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de Início *</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de Término *</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informações adicionais sobre este agendamento ou bloqueio..."
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isBlockTime && (
              <FormField
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="isRecurring"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel htmlFor="isRecurring" className="font-medium cursor-pointer">
                        Este é um agendamento recorrente
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            )}

            {isRecurring && !isBlockTime && (
              <Card className="p-4 space-y-4 bg-muted/30">
                <CardTitle className="text-md font-semibold flex items-center">
                  <Repeat className="mr-2 h-4 w-4" /> Regras de Recorrência
                </CardTitle>
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="recurrenceFrequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequência *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a frequência" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Nenhuma</SelectItem>
                            <SelectItem value="daily">Diariamente</SelectItem>
                            <SelectItem value="weekly">Semanalmente</SelectItem>
                            <SelectItem value="monthly">Mensalmente</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="recurrenceInterval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Repetir a cada *</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormDescription>
                          Ex: 1 para todo dia/semana/mês, 2 para alternado.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {recurrenceFrequency === 'weekly' && (
                  <FormField
                    control={form.control}
                    name="recurrenceDaysOfWeek"
                    render={() => (
                      <FormItem>
                        <FormLabel>Repetir nos dias *</FormLabel>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-2">
                          {daysOfWeek.map((day) => (
                            <FormField
                              key={day.id}
                              control={form.control}
                              name="recurrenceDaysOfWeek"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={day.id}
                                    className="flex flex-row items-center space-x-2 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(day.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...(field.value || []), day.id])
                                            : field.onChange(
                                                (field.value || []).filter(
                                                  (value) => value !== day.id
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {day.label}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="recurrenceEndDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Termina em (Opcional)</FormLabel>
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
                                <span>Nunca</span>
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
                              date < (form.getValues('appointmentDate') || new Date())
                            }
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              type="submit"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={isLoading || !form.formState.isValid}
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading
                ? appointmentData?.id
                  ? 'Salvando...'
                  : isBlockTime
                    ? 'Bloqueando...'
                    : 'Agendando...'
                : appointmentData?.id
                  ? 'Salvar Alterações'
                  : isBlockTime
                    ? 'Criar Bloqueio'
                    : 'Criar Agendamento'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

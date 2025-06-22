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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save, UserPlus2, UserCog } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createWaitingListEntry, updateWaitingListEntry } from '@/services/waitingListService';

const mockPsychologistsForSelect = [
  { id: 'any', name: 'Qualquer Psicólogo(a)' },
  { id: 'psy1', name: 'Dr. Silva' },
  { id: 'psy2', name: 'Dra. Jones' },
];

const priorityOptions = ['Alta', 'Média', 'Baixa'] as const;

const waitingListFormSchema = z.object({
  patientName: z
    .string()
    .min(3, { message: 'O nome do paciente deve ter pelo menos 3 caracteres.' }),
  contactPhone: z.string().optional(),
  contactEmail: z
    .string()
    .email({ message: 'Por favor, insira um e-mail válido.' })
    .optional()
    .or(z.literal('')),
  requestedPsychologistId: z.string().optional(),
  priority: z.enum(priorityOptions, { required_error: 'Por favor, selecione uma prioridade.' }),
  notes: z.string().optional(),
});

export type WaitingListFormValues = z.infer<typeof waitingListFormSchema>;

interface WaitingListFormProps {
  initialData?: WaitingListFormValues;
  entryId?: string;
}

export default function WaitingListForm({ initialData, entryId }: WaitingListFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<WaitingListFormValues>({
    resolver: zodResolver(waitingListFormSchema),
    defaultValues: initialData || {
      patientName: '',
      contactPhone: '',
      contactEmail: '',
      requestedPsychologistId: 'any',
      priority: 'Média',
      notes: '',
    },
  });

  async function onSubmit(data: WaitingListFormValues) {
    setIsLoading(true);
    try {
      if (entryId) {
        await updateWaitingListEntry(entryId, {
          name: data.patientName,
          requestedPsychologistId: data.requestedPsychologistId,
          priority: data.priority,
          notes: data.notes,
          contactPhone: data.contactPhone,
          contactEmail: data.contactEmail,
        });
        toast({
          title: 'Entrada Atualizada',
          description: `A entrada para "${data.patientName}" foi atualizada.`,
        });
      } else {
        await createWaitingListEntry({
          name: data.patientName,
          requestedPsychologistId: data.requestedPsychologistId,
          requestedPsychologist: mockPsychologistsForSelect.find(
            (p) => p.id === data.requestedPsychologistId
          )?.name,
          priority: data.priority,
          notes: data.notes,
          contactPhone: data.contactPhone,
          contactEmail: data.contactEmail,
        });
        toast({
          title: 'Paciente Adicionado',
          description: `${data.patientName} foi adicionado à lista de espera.`,
        });
      }
      router.push('/waiting-list');
    } catch (err) {
      console.error(err);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar os dados.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const TitleIcon = entryId ? UserCog : UserPlus2;

  return (
    <Card className="shadow-lg">
      <Form {...form}>
        <form role="form" onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              <TitleIcon className="mr-2 h-6 w-6 text-primary" />
              {entryId ? 'Editar Entrada na Lista de Espera' : 'Adicionar à Lista de Espera'}
            </CardTitle>
            <CardDescription>
              {entryId
                ? 'Modifique as informações da entrada.'
                : 'Preencha as informações abaixo para adicionar um paciente.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="patientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Paciente *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo do paciente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone de Contato</FormLabel>
                    <FormControl>
                      <Input placeholder="(XX) XXXXX-XXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email de Contato</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="requestedPsychologistId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Psicólogo(a) Solicitado(a)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um(a) psicólogo(a) ou qualquer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockPsychologistsForSelect.map((p) => (
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
                        {priorityOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Preferências de horário, motivo breve, etc."
                      {...field}
                      rows={3}
                    />
                  </FormControl>
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
                ? entryId
                  ? 'Salvando...'
                  : 'Adicionando...'
                : entryId
                  ? 'Salvar Alterações'
                  : 'Adicionar à Lista'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getBackupSettings,
  saveBackupSettings,
  type BackupSettings,
} from '@/services/backupService';

const formSchema = z
  .object({
    frequency: z.enum(['daily', 'weekly'], { required_error: 'Selecione a frequência.' }),
    dayOfWeek: z.coerce.number().min(0).max(6).optional(),
    destination: z.string().min(1, { message: 'Destino obrigatório.' }),
  })
  .refine((data) => data.frequency !== 'weekly' || data.dayOfWeek !== undefined, {
    message: 'Escolha o dia da semana.',
    path: ['dayOfWeek'],
  });

export type BackupSettingsFormValues = z.infer<typeof formSchema>;

export default function BackupSettingsForm() {
  const { toast } = useToast();
  const form = useForm<BackupSettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { frequency: 'daily', destination: 'storage' },
  });

  useEffect(() => {
    getBackupSettings().then((data) => {
      if (data) {
        form.reset(data as BackupSettingsFormValues);
      }
    });
  }, [form]);

  async function onSubmit(values: BackupSettingsFormValues) {
    try {
      await saveBackupSettings(values as BackupSettings);
      toast({ title: 'Configurações Salvas' });
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    }
  }

  const showDay = form.watch('frequency') === 'weekly';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline">Configurações de Backup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequência</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger id="frequency">
                        <SelectValue placeholder="Frequência" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {showDay && (
              <FormField
                control={form.control}
                name="dayOfWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia da semana</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(Number(v))}
                      value={field.value?.toString() ?? ''}
                    >
                      <FormControl>
                        <SelectTrigger id="dayOfWeek">
                          <SelectValue placeholder="Dia" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">Domingo</SelectItem>
                        <SelectItem value="1">Segunda</SelectItem>
                        <SelectItem value="2">Terça</SelectItem>
                        <SelectItem value="3">Quarta</SelectItem>
                        <SelectItem value="4">Quinta</SelectItem>
                        <SelectItem value="5">Sexta</SelectItem>
                        <SelectItem value="6">Sábado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destino</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger id="destination">
                        <SelectValue placeholder="Destino" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="storage">Storage</SelectItem>
                      <SelectItem value="drive">Google Drive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Save className="mr-2 h-4 w-4" /> Salvar
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

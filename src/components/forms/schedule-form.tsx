
"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const scheduleSchema = z.object({
  dateTime: z.coerce.date().refine((d) => d >= new Date(), {
    message: "Escolha uma data e hora futura",
  }),
  notes: z.string().min(5, { message: "Escreva pelo menos 5 caracteres" }),
});

export type ScheduleFormValues = z.infer<typeof scheduleSchema>;

export default function ScheduleForm() {
  const { toast } = useToast();
  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      dateTime: new Date(),
      notes: "",
    },
  });

  const onSubmit = (data: ScheduleFormValues) => {
    const date = data.dateTime;
    if (date.getHours() === 13) {
      toast({
        title: "Conflito de Horário",
        description: "Já existe um agendamento às 13:00." ,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Agendamento Registrado (Simulado)",
      description: date.toLocaleString(),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <fieldset className="space-y-4" role="group">
          <FormField
            control={form.control}
            name="dateTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data e Hora</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </fieldset>
        <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <CalendarPlus className="mr-2 h-4 w-4" />
          Agendar
        </Button>
      </form>
    </Form>
  );
}

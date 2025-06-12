
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save } from "lucide-react";
import { cn } from "@/shared/utils";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { createPatient, updatePatient } from '@/services/patientService';

const patientFormSchema = z.object({
  name: z.string().min(2, { message: "O nome completo deve ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um endereço de e-mail válido." }),
  phone: z.string().optional(),
  dob: z.date().optional(),
  address: z.string().optional(),
  // TODO: Adicionar campos para informações sensíveis que precisariam de criptografia
  // medicalHistory: z.string().optional(), // Exemplo
  // emergencyContact: z.string().optional(), // Exemplo
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

interface PatientFormProps {
  patientData?: Partial<PatientFormValues & { id?: string }>; 
}

export default function PatientForm({ patientData }: PatientFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      name: patientData?.name || "",
      email: patientData?.email || "",
      phone: patientData?.phone || "",
      dob: patientData?.dob ? new Date(patientData.dob) : undefined,
      address: patientData?.address || "",
      // TODO: Descriptografar dados sensíveis ao carregar para edição
      // medicalHistory: patientData?.medicalHistory ? decrypt(patientData.medicalHistory) : "",
    },
  });

  async function onSubmit(data: PatientFormValues) {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        dob: data.dob ? format(data.dob, 'yyyy-MM-dd') : undefined,
      };

      if (patientData?.id) {
        await updatePatient(patientData.id, payload);
      } else {
        await createPatient(payload as Omit<PatientFormValues, 'dob'> & { dob?: string });
      }

      toast({
        title: patientData?.id ? 'Paciente Atualizado' : 'Paciente Adicionado',
        description: `${data.name} foi ${patientData?.id ? 'atualizado(a)' : 'adicionado(a)'} com sucesso.`,
      });

      router.push(patientData?.id ? `/patients/${patientData.id}` : '/patients');
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar os dados do paciente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="shadow-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="font-headline">{patientData?.id ? "Editar Detalhes do Paciente" : "Informações do Novo Paciente"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: João da Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço de Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="nome@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(XX) XXXXX-XXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Nascimento</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "P", { locale: ptBR })
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
                            date > new Date() || date < new Date("1900-01-01")
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
            </div>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Rua Exemplo, 123, Bairro, Cidade - UF" {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* TODO: Adicionar aqui campos para dados sensíveis (ex: histórico médico) que seriam criptografados */}
            {/* Exemplo:
            <FormField
              control={form.control}
              name="medicalHistory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Histórico Médico Relevante (Dados Sensíveis)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Informações médicas confidenciais..." {...field} rows={4} />
                  </FormControl>
                  <FormDescription>Este campo será criptografado.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            */}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? (patientData?.id ? "Salvando Alterações..." : "Adicionando Paciente...") : (patientData?.id ? "Salvar Alterações" : "Adicionar Paciente")}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

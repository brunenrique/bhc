
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import dynamic from "next/dynamic";
const Calendar = dynamic(() => import("@/components/ui/calendar").then(m => m.Calendar), { ssr: false });
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ClipboardCheck, Save, CalendarIcon, User } from "lucide-react";
import { cn } from "@/shared/utils";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";

// Mock data (idealmente viria de um serviço/API)
const mockAssessmentTemplates = [
  { id: "tpl_bdi", name: "Inventário de Depressão de Beck (BDI)" },
  { id: "tpl_gad7", name: "Escala de Ansiedade GAD-7" },
  { id: "tpl_rosenberg", name: "Escala de Autoestima de Rosenberg" },
  { id: "tpl_pcl5", name: "Checklist de TEPT (PCL-5)" },
  { id: "custom_stress", name: "Questionário de Estresse Percebido (Custom)" },
];

const mockPatientsForSelect = [
  { id: "1", name: "Alice Wonderland" },
  { id: "2", name: "Bob O Construtor" },
  { id: "3", name: "Charlie Brown" },
  { id: "4", name: "Diana Prince" },
];


const assignAssessmentFormSchema = z.object({
  assessmentTemplateId: z.string().min(1, { message: "Por favor, selecione um modelo." }),
  patientId: z.string().min(1, { message: "Por favor, selecione um paciente." }),
  sendDate: z.date().optional(),
  dueDate: z.date().optional(),
  notesToPatient: z.string().optional(),
}).refine(data => {
    if (data.dueDate && data.sendDate && data.dueDate < data.sendDate) {
        return false;
    }
    return true;
}, {
    message: "A data de conclusão não pode ser anterior à data de envio.",
    path: ["dueDate"],
});

type AssignAssessmentFormValues = z.infer<typeof assignAssessmentFormSchema>;

export default function AssignInventoryScalePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<AssignAssessmentFormValues>({
    resolver: zodResolver(assignAssessmentFormSchema),
    defaultValues: {
      assessmentTemplateId: "",
      patientId: "",
      sendDate: new Date(),
      notesToPatient: "",
    },
  });

  async function onSubmit(data: AssignAssessmentFormValues) {
    setIsLoading(true);
    const templateName = mockAssessmentTemplates.find(t => t.id === data.assessmentTemplateId)?.name || "Inventário/Escala";
    const patientName = mockPatientsForSelect.find(p => p.id === data.patientId)?.name || "Paciente";

    await new Promise((resolve) => setTimeout(resolve, 1000)); 

    setIsLoading(false);
    toast({
      title: "Inventário/Escala Atribuído (Simulado)",
      description: `"${templateName}" atribuído(a) a ${patientName} com sucesso. Um link simulado foi enviado.`,
    });
    router.push("/inventories-scales"); 
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ClipboardCheck className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-headline font-bold">Atribuir Inventário/Escala a Paciente</h1>
      </div>

      <Card className="shadow-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="font-headline">Detalhes da Atribuição</CardTitle>
              <CardDescription>
                Selecione o modelo, o paciente e defina os detalhes do envio.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="assessmentTemplateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo de Inventário/Escala *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um modelo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockAssessmentTemplates.map(template => (
                          <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paciente *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <User className="mr-2 h-4 w-4 opacity-50" />
                          <SelectValue placeholder="Selecione um paciente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockPatientsForSelect.map(patient => (
                          <SelectItem key={patient.id} value={patient.id}>{patient.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="sendDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Envio (Opcional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                              {field.value ? format(field.value, "P", { locale: ptBR }) : <span>Escolha uma data</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={ptBR} />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Prazo para Conclusão (Opcional)</FormLabel>
                       <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                              {field.value ? format(field.value, "P", { locale: ptBR }) : <span>Defina um prazo</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < (form.getValues("sendDate") || new Date(new Date().setDate(new Date().getDate() -1))) }
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
                name="notesToPatient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações para o Paciente (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ex: Por favor, complete este instrumento antes de nossa próxima sessão." {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Atribuindo..." : "Atribuir Inventário/Escala"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}

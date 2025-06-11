
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { WaitingListEntry } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { isValidCPF, formatCPF, unformatCPF } from "@/utils/cpfValidator";
import { formatPhoneNumberToE164, isValidBrazilianPhoneNumber } from "@/utils/formatter";
import { useEffect, useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface WaitingListEntryDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  entry?: WaitingListEntry | null;
  onSave: (entryData: Omit<WaitingListEntry, 'id' | 'criadoEm' | 'criadoPor'>, id?: string) => void;
}

const waitingListSchema = z.object({
  nomeCompleto: z.string().min(3, { message: "Nome completo é obrigatório e deve ter ao menos 3 caracteres." }),
  cpf: z.string().refine(isValidCPF, { message: "CPF inválido." }),
  contato: z.string().refine(isValidBrazilianPhoneNumber, { message: "Número de telefone inválido. Use formato brasileiro (ex: 11999999999)." }),
  prioridade: z.enum(["normal", "urgente"]),
  motivo: z.string().optional(),
  status: z.enum(["pendente", "agendado", "removido"]).default("pendente"),
});

type WaitingListFormData = z.infer<typeof waitingListSchema>;

export function WaitingListEntryDialog({ isOpen, onOpenChange, entry, onSave }: WaitingListEntryDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, register, reset, setValue, formState: { errors } } = useForm<WaitingListFormData>({
    resolver: zodResolver(waitingListSchema),
    defaultValues: {
      nomeCompleto: "",
      cpf: "",
      contato: "",
      prioridade: "normal",
      motivo: "",
      status: "pendente",
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (entry) {
        reset({
          nomeCompleto: entry.nomeCompleto,
          cpf: formatCPF(entry.cpf), // Format for display
          contato: entry.contato.startsWith('+') ? entry.contato.substring(1) : entry.contato, // Remove '+' for display
          prioridade: entry.prioridade,
          motivo: entry.motivo || "",
          status: entry.status,
        });
      } else {
        reset({ // Reset to default values for new entry
          nomeCompleto: "",
          cpf: "",
          contato: "",
          prioridade: "normal",
          motivo: "",
          status: "pendente",
        });
      }
    }
  }, [entry, isOpen, reset]);

  const processSubmit = async (data: WaitingListFormData) => {
    if (!user) {
      toast({ title: "Erro de Autenticação", description: "Usuário não autenticado.", variant: "destructive" });
      return;
    }
    setIsLoading(true);

    const formattedCPF = unformatCPF(data.cpf);
    const formattedContato = formatPhoneNumberToE164(data.contato);

    if (!formattedContato) {
        toast({ title: "Erro de Formato", description: "Telefone de contato inválido ou não pode ser formatado para E.164.", variant: "destructive"});
        setIsLoading(false);
        return;
    }

    const dataToSave: Omit<WaitingListEntry, 'id' | 'criadoEm' | 'criadoPor'> = {
      ...data,
      cpf: formattedCPF,
      contato: formattedContato,
    };

    try {
      await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API call
      onSave(dataToSave, entry?.id); // Pass ID if editing
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Erro ao Salvar", description: "Não foi possível salvar a entrada na lista de espera.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!isLoading) onOpenChange(open); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center">
            <UserPlus className="mr-2 h-5 w-5 text-primary"/>
            {entry ? "Editar Entrada na Lista de Espera" : "Adicionar à Lista de Espera"}
          </DialogTitle>
          <DialogDescription>
            Preencha os detalhes do paciente. Campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(processSubmit)} className="space-y-4 py-2">
          <div>
            <Label htmlFor="nomeCompleto">Nome Completo*</Label>
            <Input id="nomeCompleto" {...register("nomeCompleto")} placeholder="Nome completo conforme documento"/>
            {errors.nomeCompleto && <p className="text-xs text-destructive mt-1">{errors.nomeCompleto.message}</p>}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cpf">CPF*</Label>
              <Input 
                id="cpf" 
                {...register("cpf")} 
                placeholder="000.000.000-00"
                onChange={(e) => setValue('cpf', formatCPF(e.target.value))}
              />
              {errors.cpf && <p className="text-xs text-destructive mt-1">{errors.cpf.message}</p>}
            </div>
            <div>
              <Label htmlFor="contato">Telefone (WhatsApp)*</Label>
              <Input id="contato" {...register("contato")} type="tel" placeholder="Ex: 11999999999"/>
              {errors.contato && <p className="text-xs text-destructive mt-1">{errors.contato.message}</p>}
            </div>
          </div>
          
          <div>
            <Label htmlFor="prioridade">Prioridade*</Label>
            <Controller
              name="prioridade"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="prioridade"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.prioridade && <p className="text-xs text-destructive mt-1">{errors.prioridade.message}</p>}
          </div>

          <div>
            <Label htmlFor="motivo">Motivo (opcional)</Label>
            <Textarea id="motivo" {...register("motivo")} rows={2} placeholder="Breve descrição do motivo da procura ou observações..."/>
            {errors.motivo && <p className="text-xs text-destructive mt-1">{errors.motivo.message}</p>}
          </div>
          
          {entry && ( // Only show status field when editing
            <div>
              <Label htmlFor="status">Status na Lista*</Label>
               <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="agendado">Agendado</SelectItem>
                      <SelectItem value="removido">Removido</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && <p className="text-xs text-destructive mt-1">{errors.status.message}</p>}
            </div>
          )}

          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {entry ? "Salvar Alterações" : "Adicionar à Lista"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

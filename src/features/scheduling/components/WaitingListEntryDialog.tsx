
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
import { useEffect, useState } from "react";
import { Loader2, UserPlus } from "lucide-react";

interface WaitingListEntryDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  entry?: WaitingListEntry | null;
  onSave: (entryData: Partial<WaitingListEntry>) => void;
}

const initialFormState: Partial<WaitingListEntry> = {
  patientName: "",
  contactPhone: "",
  reason: "",
  preferredPsychologistId: "",
  preferredPsychologistName: "",
  preferredDays: "",
  preferredTimes: "",
  status: "waiting",
  notes: "",
};

// Mock data for selects - in a real app, this would come from user/psychologist data
const mockPsychologists = [
  {id: 'psy1', name: 'Dr. Exemplo Silva'}, 
  {id: 'psy2', name: 'Dra. Modelo Souza'},
  {id: 'any', name: 'Qualquer um(a)'}
];


export function WaitingListEntryDialog({ isOpen, onOpenChange, entry, onSave }: WaitingListEntryDialogProps) {
  const [formData, setFormData] = useState<Partial<WaitingListEntry>>(initialFormState);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (entry) {
        setFormData(entry);
      } else {
        setFormData(initialFormState);
      }
    }
  }, [entry, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof WaitingListEntry, value: string) => {
     if (name === 'preferredPsychologistId') {
        const selectedPsy = mockPsychologists.find(p => p.id === value);
        setFormData(prev => ({ 
            ...prev, 
            preferredPsychologistId: value, 
            preferredPsychologistName: selectedPsy?.name === 'Qualquer um(a)' ? undefined : selectedPsy?.name
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 700));
    onSave(formData);
    setIsLoading(false);
    onOpenChange(false); // Close dialog on save
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center">
            <UserPlus className="mr-2 h-5 w-5 text-primary"/>
            {entry ? "Editar Entrada na Lista de Espera" : "Adicionar à Lista de Espera"}
          </DialogTitle>
          <DialogDescription>
            Preencha os detalhes do paciente e suas preferências.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <Label htmlFor="patientName">Nome do Paciente</Label>
            <Input id="patientName" name="patientName" value={formData.patientName || ''} onChange={handleChange} required placeholder="Nome completo"/>
          </div>
          <div>
            <Label htmlFor="contactPhone">Telefone de Contato</Label>
            <Input id="contactPhone" name="contactPhone" type="tel" value={formData.contactPhone || ''} onChange={handleChange} placeholder="(XX) XXXXX-XXXX"/>
          </div>
           <div>
            <Label htmlFor="preferredPsychologistId">Preferência de Psicólogo(a)</Label>
            <Select 
              value={formData.preferredPsychologistId || 'any'} 
              onValueChange={(value) => handleSelectChange('preferredPsychologistId', value)}
            >
              <SelectTrigger id="preferredPsychologistId"><SelectValue placeholder="Selecione se houver preferência" /></SelectTrigger>
              <SelectContent>
                {mockPsychologists.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="preferredDays">Dias de Preferência</Label>
                <Input id="preferredDays" name="preferredDays" value={formData.preferredDays || ''} onChange={handleChange} placeholder="Ex: Seg, Qua (Manhã)"/>
            </div>
            <div>
                <Label htmlFor="preferredTimes">Horários de Preferência</Label>
                <Input id="preferredTimes" name="preferredTimes" value={formData.preferredTimes || ''} onChange={handleChange} placeholder="Ex: 09:00 - 12:00"/>
            </div>
          </div>
          <div>
            <Label htmlFor="reason">Motivo/Observação (opcional)</Label>
            <Textarea id="reason" name="reason" value={formData.reason || ''} onChange={handleChange} rows={2} placeholder="Ex: Primeira consulta, aguardando horário específico..."/>
          </div>
           <div>
            <Label htmlFor="status">Status na Lista</Label>
            <Select 
              value={formData.status || 'waiting'} 
              onValueChange={(value) => handleSelectChange('status', value as WaitingListEntry['status'])}
            >
              <SelectTrigger id="status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="waiting">Aguardando</SelectItem>
                <SelectItem value="contacted">Contatado</SelectItem>
                <SelectItem value="scheduled">Agendado</SelectItem>
                <SelectItem value="archived">Arquivado</SelectItem>
              </SelectContent>
            </Select>
          </div>
           <div>
            <Label htmlFor="notes">Notas Internas (opcional)</Label>
            <Textarea id="notes" name="notes" value={formData.notes || ''} onChange={handleChange} rows={2} placeholder="Anotações internas sobre o contato, disponibilidade, etc."/>
          </div>

          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !formData.patientName}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {entry ? "Salvar Alterações" : "Adicionar à Lista"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

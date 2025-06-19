
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type { Session, SessionRecurrence } from "@/types";
import { useEffect, useState } from "react";
import { CalendarIcon, Loader2, Repeat } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from 'date-fns/locale';

interface SessionFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  session?: Session | null;
  onSave: (sessionData: Partial<Session>) => void;
}

const initialFormState: Partial<Session> = {
  patientId: "",
  psychologistId: "",
  startTime: new Date().toISOString(),
  endTime: new Date(new Date().setHours(new Date().getHours() + 1)).toISOString(),
  status: "scheduled",
  notes: "",
  recurring: "none",
};

export function SessionFormDialog({ isOpen, onOpenChange, session, onSave }: SessionFormDialogProps) {
  const [formData, setFormData] = useState<Partial<Session>>(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (session) {
      setFormData({
        ...session,
        startTime: session.startTime || initialFormState.startTime,
        endTime: session.endTime || initialFormState.endTime,
        recurring: session.recurring || "none",
      });
      setSelectedDate(session.startTime ? parseISO(session.startTime) : new Date());
    } else {
      setFormData(initialFormState);
      setSelectedDate(new Date());
    }
  }, [session, isOpen]);

  const handleDateChange = (date?: Date) => {
    if (date) {
      setSelectedDate(date);
      const currentStartTime = formData.startTime ? parseISO(formData.startTime) : new Date();
      const newStartTime = new Date(date);
      newStartTime.setHours(currentStartTime.getHours(), currentStartTime.getMinutes());

      const currentEndTime = formData.endTime ? parseISO(formData.endTime) : new Date(newStartTime.getTime() + 60 * 60 * 1000);
      const newEndTime = new Date(date);
      newEndTime.setHours(currentEndTime.getHours(), currentEndTime.getMinutes());
      
      setFormData(prev => ({ ...prev, startTime: newStartTime.toISOString(), endTime: newEndTime.toISOString() }));
    }
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', timeValue: string) => {
    const [hours, minutes] = timeValue.split(':').map(Number);
    const baseDate = field === 'startTime' ? formData.startTime : formData.endTime;
    const dateToUpdate = baseDate ? parseISO(baseDate) : new Date();
    
    if (selectedDate) {
      dateToUpdate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    }
    
    dateToUpdate.setHours(hours, minutes);
    setFormData(prev => ({ ...prev, [field]: dateToUpdate.toISOString() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSave(formData);
    setIsLoading(false);
    onOpenChange(false);
  };
  
  const mockPatients = [{id: 'p1', name: 'Ana Silva'}, {id: 'p2', name: 'Bruno Costa'}];
  const mockPsychologists = [{id: 'psy1', name: 'Dr. Exemplo Silva'}, {id: 'psy2', name: 'Dra. Modelo Souza'}];
  const recurrenceOptions: { value: SessionRecurrence, label: string }[] = [
    { value: "none", label: "Não se repete" },
    { value: "daily", label: "Diariamente" },
    { value: "weekly", label: "Semanalmente" },
    { value: "monthly", label: "Mensalmente" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-headline">{session ? "Editar Sessão" : "Nova Sessão"}</DialogTitle>
          <DialogDescription>
            {session ? "Modifique os detalhes da sessão." : "Preencha os dados para agendar uma nova sessão."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <Label htmlFor="patientId">Paciente</Label>
            <Select 
              value={formData.patientId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, patientId: value }))}
            >
              <SelectTrigger id="patientId"><SelectValue placeholder="Selecione o paciente" /></SelectTrigger>
              <SelectContent>
                {mockPatients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="psychologistId">Psicólogo(a)</Label>
             <Select 
              value={formData.psychologistId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, psychologistId: value }))}
            >
              <SelectTrigger id="psychologistId"><SelectValue placeholder="Selecione o(a) psicólogo(a)" /></SelectTrigger>
              <SelectContent>
                {mockPsychologists.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="sessionDate">Data da Sessão</Label>
            <Popover>
              <PopoverTrigger asChild><Button
                  id="sessionDate"
                  variant={"outline"}
                  className="w-full justify-start text-left font-normal"
                ><CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                </Button></PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateChange}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Horário de Início</Label>
              <Input 
                id="startTime" 
                type="time" 
                value={formData.startTime ? format(parseISO(formData.startTime), 'HH:mm') : ''}
                onChange={(e) => handleTimeChange('startTime', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endTime">Horário de Término</Label>
              <Input 
                id="endTime" 
                type="time" 
                value={formData.endTime ? format(parseISO(formData.endTime), 'HH:mm') : ''}
                onChange={(e) => handleTimeChange('endTime', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="recurring">Recorrência</Label>
            <Select 
              value={formData.recurring || "none"}
              onValueChange={(value) => setFormData(prev => ({ ...prev, recurring: value as SessionRecurrence }))}
            >
              <SelectTrigger id="recurring">
                <Repeat className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Definir recorrência" />
              </SelectTrigger>
              <SelectContent>
                {recurrenceOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Session["status"] }))}
            >
              <SelectTrigger id="status"><SelectValue placeholder="Status da sessão" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Agendada</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
                <SelectItem value="no-show">Não Compareceu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea 
              id="notes" 
              placeholder="Observações sobre a sessão (opcional)..." 
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {session ? "Salvar Alterações" : "Agendar Sessão"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

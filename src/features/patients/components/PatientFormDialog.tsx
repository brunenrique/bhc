
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
import type { Patient } from "@/types";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface PatientFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  patient?: Patient | null;
  onSave: (patientData: Partial<Patient>) => void;
}

const initialFormState: Partial<Patient> = {
  name: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  address: "",
  sessionNotes: "", 
};

export function PatientFormDialog({ isOpen, onOpenChange, patient, onSave }: PatientFormDialogProps) {
  const [formData, setFormData] = useState<Partial<Patient>>(initialFormState);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (patient) {
      setFormData(patient);
    } else {
      setFormData(initialFormState);
    }
  }, [patient, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSave(formData);
    setIsLoading(false);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-headline">{patient ? "Editar Paciente" : "Novo Paciente"}</DialogTitle>
          <DialogDescription>
            {patient ? "Modifique os dados do paciente." : "Preencha os dados do novo paciente."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <Label htmlFor="name">Nome Completo</Label>
            <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" name="phone" type="tel" value={formData.phone || ''} onChange={handleChange} />
            </div>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateOfBirth">Data de Nascimento</Label>
              <Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth || ''} onChange={handleChange} />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Endereço</Label>
            <Input id="address" name="address" value={formData.address || ''} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="sessionNotes">Histórico / Anotações Confidenciais</Label>
            <Textarea 
              id="sessionNotes" 
              name="sessionNotes" 
              placeholder="Anotações importantes sobre o paciente..." 
              value={formData.sessionNotes || ''} 
              onChange={handleChange}
              rows={4} 
            />
            <p className="text-xs text-muted-foreground mt-1">Estas notas serão armazenadas de forma segura (simulado).</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {patient ? "Salvar Alterações" : "Adicionar Paciente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

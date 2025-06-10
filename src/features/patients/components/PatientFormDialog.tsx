
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
// import { Textarea } from "@/components/ui/textarea"; // Replaced by RichTextEditor
import { RichTextEditor } from "@/components/shared/RichTextEditor";
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
  sessionNotes: "<p></p>", // Default to empty paragraph for TipTap
  caseStudyNotes: "<p></p>", // Default to empty paragraph for TipTap
};

export function PatientFormDialog({ isOpen, onOpenChange, patient, onSave }: PatientFormDialogProps) {
  const [formData, setFormData] = useState<Partial<Patient>>(initialFormState);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) { // Only update formData when dialog opens or patient prop changes
      if (patient) {
        setFormData({
          ...initialFormState, 
          ...patient,
          sessionNotes: patient.sessionNotes || "<p></p>", // Ensure valid HTML for TipTap
          caseStudyNotes: patient.caseStudyNotes || "<p></p>", // Ensure valid HTML for TipTap
        });
      } else {
        setFormData(initialFormState);
      }
    }
  }, [patient, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRichTextChange = (field: 'sessionNotes' | 'caseStudyNotes', content: string) => {
    setFormData(prev => ({ ...prev, [field]: content }));
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline">{patient ? "Editar Paciente" : "Novo Paciente"}</DialogTitle>
          <DialogDescription>
            {patient ? "Modifique os dados do paciente." : "Preencha os dados do novo paciente."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-2 overflow-y-auto flex-grow pr-2">
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
          
          <div className="space-y-2">
            <Label htmlFor="sessionNotesEditor">Evolução das Sessões (Anotações Confidenciais)</Label>
            <RichTextEditor
              initialContent={formData.sessionNotes || "<p></p>"}
              onUpdate={(content) => handleRichTextChange('sessionNotes', content)}
              placeholder="Detalhes da evolução do paciente nas sessões..."
              editorClassName="h-[400px] sm:h-[500px]" // Give fixed height to the editor wrapper
              pageClassName="min-h-[300px] sm:min-h-[400px]" // Adjust min-height of page within editor
            />
            <p className="text-xs text-muted-foreground mt-1">Estas notas serão armazenadas de forma segura (simulado).</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="caseStudyNotesEditor">Notas do Estudo de Caso</Label>
             <RichTextEditor
              initialContent={formData.caseStudyNotes || "<p></p>"}
              onUpdate={(content) => handleRichTextChange('caseStudyNotes', content)}
              placeholder="Anotações detalhadas e reflexões para o estudo de caso..."
              editorClassName="h-[400px] sm:h-[500px]"
              pageClassName="min-h-[300px] sm:min-h-[400px]"
            />
            <p className="text-xs text-muted-foreground mt-1">Utilize este espaço para aprofundar a análise do caso.</p>
          </div>

        </form>
        <DialogFooter className="mt-auto pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" form="patient-edit-form" disabled={isLoading} onClick={handleSubmit}> {/* Associate with form if outside */}
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {patient ? "Salvar Alterações" : "Adicionar Paciente"}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

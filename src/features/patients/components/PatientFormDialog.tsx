
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
import { RichTextEditor } from "@/components/shared/RichTextEditor";
import type { Patient, ProcedimentoAnaliseEntry } from "@/types";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea"; // For simpler text fields

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
  sessionNotes: "<p></p>", 
  caseStudyNotes: "<p></p>", 
  prontuario: { // Initialize prontuario fields
    demandaQueixaPrincipal: "",
    procedimentosAnalise: [],
    conclusaoEncaminhamentoGeral: "",
    identificacao: {},
    entradaUnidade: {},
    localAssinatura: "Santana de Parnaíba", // Default location
    signatureStatus: 'none',
    signatureDetails: {},
  }
};

export function PatientFormDialog({ isOpen, onOpenChange, patient, onSave }: PatientFormDialogProps) {
  const [formData, setFormData] = useState<Partial<Patient>>(initialFormState);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) { 
      if (patient) {
        setFormData({
          ...initialFormState, 
          ...patient,
          sessionNotes: patient.sessionNotes || "<p></p>", 
          caseStudyNotes: patient.caseStudyNotes || "<p></p>", 
          prontuario: { // Ensure prontuario and its sub-fields are initialized
            ...initialFormState.prontuario,
            ...(patient.prontuario || {}),
            identificacao: { 
                ...(initialFormState.prontuario?.identificacao || {}),
                ...(patient.prontuario?.identificacao || {}) 
            },
            entradaUnidade: {
                ...(initialFormState.prontuario?.entradaUnidade || {}),
                ...(patient.prontuario?.entradaUnidade || {})
            },
            procedimentosAnalise: patient.prontuario?.procedimentosAnalise || [],
          },
        });
      } else {
        setFormData(initialFormState);
      }
    }
  }, [patient, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith("prontuario.identificacao.")) {
      const field = name.split(".").pop() as keyof Patient["prontuario"]["identificacao"];
      setFormData(prev => ({
        ...prev,
        prontuario: {
          ...prev.prontuario,
          identificacao: {
            ...prev.prontuario?.identificacao,
            [field]: value,
          }
        }
      }));
    } else if (name.startsWith("prontuario.")) {
      const field = name.split(".").pop() as keyof Patient["prontuario"];
       setFormData(prev => ({
        ...prev,
        prontuario: {
          ...prev.prontuario,
          [field]: value,
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRichTextChange = (field: 'sessionNotes' | 'caseStudyNotes', content: string) => {
    setFormData(prev => ({ ...prev, [field]: content }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    let updatedPatientData = { ...formData };

    // Logic to append sessionNotes to prontuario.procedimentosAnalise
    if (updatedPatientData.sessionNotes && updatedPatientData.sessionNotes.trim() !== "<p></p>") {
      const currentProntuario = updatedPatientData.prontuario || { ...initialFormState.prontuario, procedimentosAnalise: [] };
      const newEntry: ProcedimentoAnaliseEntry = {
        entryId: `session-${new Date().toISOString()}`, // Simple unique ID
        date: new Date().toISOString(),
        content: updatedPatientData.sessionNotes,
      };

      // Check if this content is truly new compared to the last entry
      const lastEntry = currentProntuario.procedimentosAnalise && currentProntuario.procedimentosAnalise.length > 0 
                        ? currentProntuario.procedimentosAnalise[currentProntuario.procedimentosAnalise.length - 1] 
                        : null;
      
      if (!lastEntry || lastEntry.content !== newEntry.content) {
        updatedPatientData.prontuario = {
          ...currentProntuario,
          procedimentosAnalise: [...(currentProntuario.procedimentosAnalise || []), newEntry],
        };
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSave(updatedPatientData);
    setIsLoading(false);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline">{patient ? "Editar Paciente e Prontuário" : "Novo Paciente e Prontuário"}</DialogTitle>
          <DialogDescription>
            {patient ? "Modifique os dados do paciente e seu prontuário." : "Preencha os dados do novo paciente e inicie seu prontuário."}
          </DialogDescription>
        </DialogHeader>
        
        {/* The form ID is used by the DialogFooter button to trigger submit */}
        <form id="patient-prontuario-form" onSubmit={handleSubmit} className="space-y-6 py-2 overflow-y-auto flex-grow pr-2">
          <h3 className="text-lg font-semibold font-headline border-b pb-2">Dados Pessoais do Paciente</h3>
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
              <Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth ? formData.dateOfBirth.substring(0,10) : ''} onChange={handleChange} />
            </div>
             <div>
              <Label htmlFor="prontuario.identificacao.cpf">CPF</Label>
              <Input id="prontuario.identificacao.cpf" name="prontuario.identificacao.cpf" value={formData.prontuario?.identificacao?.cpf || ''} onChange={handleChange} placeholder="000.000.000-00"/>
            </div>
          </div>
          <div>
            <Label htmlFor="address">Endereço Completo</Label>
            <Input id="address" name="address" value={formData.address || ''} onChange={handleChange} />
          </div>
          
          <h3 className="text-lg font-semibold font-headline border-b pb-2 mt-6">Dados do Prontuário Psicológico</h3>
          <div>
            <Label htmlFor="prontuario.demandaQueixaPrincipal">Descrição da Demanda/Queixa Principal (Geral)</Label>
            <Textarea id="prontuario.demandaQueixaPrincipal" name="prontuario.demandaQueixaPrincipal" value={formData.prontuario?.demandaQueixaPrincipal || ''} onChange={handleChange} rows={3} placeholder="Queixa inicial ou principal que motivou o acompanhamento..."/>
          </div>
           <div>
            <Label htmlFor="prontuario.entradaUnidade.descricaoEntrada">Entrada na Unidade/Serviço</Label>
            <Textarea id="prontuario.entradaUnidade.descricaoEntrada" name="prontuario.entradaUnidade.descricaoEntrada" value={formData.prontuario?.entradaUnidade?.descricaoEntrada || ''} onChange={handleChange} rows={2} placeholder="Como o paciente chegou ao serviço (encaminhamento, busca espontânea, etc.)..."/>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessionNotesEditor">Evolução da Sessão ATUAL (Será adicionada ao histórico do prontuário ao salvar)</Label>
            <RichTextEditor
              initialContent={formData.sessionNotes || "<p></p>"}
              onUpdate={(content) => handleRichTextChange('sessionNotes', content)}
              placeholder="Detalhes da evolução do paciente nesta sessão..."
              editorClassName="h-[300px] sm:h-[400px]" 
              pageClassName="min-h-[200px] sm:min-h-[300px]" 
            />
            <p className="text-xs text-muted-foreground mt-1">Estas notas serão adicionadas ao "Procedimento/Análise" do prontuário ao salvar.</p>
          </div>

           <div>
            <Label htmlFor="prontuario.conclusaoEncaminhamentoGeral">Conclusão/Encaminhamento (Geral)</Label>
            <Textarea id="prontuario.conclusaoEncaminhamentoGeral" name="prontuario.conclusaoEncaminhamentoGeral" value={formData.prontuario?.conclusaoEncaminhamentoGeral || ''} onChange={handleChange} rows={3} placeholder="Conclusões gerais do caso, encaminhamentos, etc."/>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="caseStudyNotesEditor">Notas do Estudo de Caso (Opcional)</Label>
             <RichTextEditor
              initialContent={formData.caseStudyNotes || "<p></p>"}
              onUpdate={(content) => handleRichTextChange('caseStudyNotes', content)}
              placeholder="Anotações detalhadas e reflexões para o estudo de caso..."
              editorClassName="h-[300px] sm:h-[400px]"
              pageClassName="min-h-[200px] sm:min-h-[300px]"
            />
          </div>
        </form>
        <DialogFooter className="mt-auto pt-4 border-t sticky bottom-0 bg-background z-10">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" form="patient-prontuario-form" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {patient ? "Salvar Alterações" : "Adicionar Paciente e Prontuário"}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

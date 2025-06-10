
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Patient, User, ProntuarioGenerationDataDynamic } from "@/types";
import { useState, useEffect } from "react";
import { FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GenerateProntuarioButton } from "./GenerateProntuarioButton";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";


interface GenerateProntuarioDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  patient: Patient | null;
  currentUser: User | null;
  currentSessionNotesContent: string; // HTML content from RichTextEditor
}

const initialDynamicData: Omit<ProntuarioGenerationDataDynamic, "Descrição do Procedimento/Análise"> = {
  'Descrição da Demanda/Queixa': '',
  'Descrição da Conclusão/Encaminhamento': '',
};

export function GenerateProntuarioDialog({ 
    isOpen, 
    onOpenChange, 
    patient, 
    currentUser,
    currentSessionNotesContent 
}: GenerateProntuarioDialogProps) {
  const [dynamicData, setDynamicData] = useState(initialDynamicData);
  const [isFormValid, setIsFormValid] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      // Reset form when dialog opens
      setDynamicData(initialDynamicData);
    }
  }, [isOpen]);

  useEffect(() => {
    // Validate form
    setIsFormValid(
      dynamicData['Descrição da Demanda/Queixa'].trim() !== '' &&
      dynamicData['Descrição da Conclusão/Encaminhamento'].trim() !== ''
    );
  }, [dynamicData]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDynamicData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDialogClose = () => {
    onOpenChange(false);
  }

  if (!patient || !currentUser) {
    // This should ideally not happen if the button to open is disabled correctly
    if (isOpen) {
        toast({ title: "Erro", description: "Dados do paciente ou psicólogo ausentes.", variant: "destructive"});
        onOpenChange(false);
    }
    return null;
  }

  const patientDataForButton = {
    "Nome Completo do Paciente": patient.prontuario?.identificacao?.nomeCompleto || patient.name,
    "CPF do Paciente": patient.prontuario?.identificacao?.cpf,
    "Sexo do Paciente": patient.prontuario?.identificacao?.sexo,
    "Data de Nasc. do Paciente": patient.prontuario?.identificacao?.dataNascimento 
      ? format(parseISO(patient.prontuario.identificacao.dataNascimento), "dd/MM/yyyy", {locale: ptBR}) 
      : patient.dateOfBirth ? format(parseISO(patient.dateOfBirth), "dd/MM/yyyy", {locale: ptBR}) : undefined,
    "Estado Civil do Paciente": patient.prontuario?.identificacao?.estadoCivil,
    "Raça/Cor do Paciente": patient.prontuario?.identificacao?.racaCor,
    "Status Filhos": patient.prontuario?.identificacao?.possuiFilhos ? 'Sim' : 'Não',
    "Quantidade de Filhos": patient.prontuario?.identificacao?.quantosFilhos?.toString() || (patient.prontuario?.identificacao?.possuiFilhos ? '0' : undefined),
    "Situação Profissional do Paciente": patient.prontuario?.identificacao?.situacaoProfissional,
    "Profissão do Paciente": patient.prontuario?.identificacao?.profissao,
    "Escolaridade do Paciente": patient.prontuario?.identificacao?.escolaridade,
    "Renda do Paciente": patient.prontuario?.identificacao?.renda,
    "Endereço do Paciente": patient.prontuario?.identificacao?.enderecoCasa || patient.address,
    "Tipo de Moradia": patient.prontuario?.identificacao?.tipoMoradia,
    "Telefone do Paciente": patient.prontuario?.identificacao?.telefone || patient.phone,
    "Contato de Emergência": patient.prontuario?.identificacao?.contatoEmergencia,
    "Descrição da Entrada na Unidade": patient.prontuario?.entradaUnidade?.descricaoEntrada,
  };

  const psicologoDataForButton = {
    "Nome do Psicólogo": currentUser.name,
    "CRP do Psicólogo": currentUser.crp || 'N/A',
  };

  const sessionDataForButton = {
    "Descrição da Demanda/Queixa": dynamicData['Descrição da Demanda/Queixa'],
    "Descrição da Conclusão/Encaminhamento": dynamicData['Descrição da Conclusão/Encaminhamento'],
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center">
            <FileText className="mr-2 h-5 w-5 text-primary"/>Gerar Prontuário (Google Docs)
          </DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo com informações específicas da sessão atual para {patient?.name}. 
            As "Anotações de Evolução" serão usadas para o campo "Procedimento/Análise".
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2 overflow-y-auto flex-grow pr-2">
            <div>
                <Label htmlFor="demandaQueixa">Descrição da Demanda/Queixa (Sessão Atual)</Label>
                <Textarea 
                id="demandaQueixa" 
                name="Descrição da Demanda/Queixa" 
                value={dynamicData['Descrição da Demanda/Queixa']} 
                onChange={handleChange}
                rows={4} 
                required
                placeholder="Detalhes da queixa principal ou demanda trazida pelo paciente nesta sessão..."
                />
            </div>
            {/* "Procedimento/Análise" is now taken from main session notes (currentSessionNotesContent) */}
            <div>
                <Label htmlFor="conclusaoEncaminhamento">Conclusão/Encaminhamento (Sessão Atual)</Label>
                <Textarea 
                id="conclusaoEncaminhamento" 
                name="Descrição da Conclusão/Encaminhamento" 
                value={dynamicData['Descrição da Conclusão/Encaminhamento']} 
                onChange={handleChange}
                rows={4} 
                required
                placeholder="Conclusões da sessão, próximos passos, encaminhamentos, etc."
                />
            </div>
            <div className="mt-4 p-3 border rounded-md bg-muted/40">
                <p className="text-sm font-medium text-muted-foreground">
                    Nota sobre "Procedimento/Análise":
                </p>
                <p className="text-xs text-muted-foreground">
                    O conteúdo do campo "Procedimento/Análise" do prontuário será preenchido automaticamente com as suas "Anotações de Evolução" salvas para este paciente (o texto do editor principal).
                </p>
            </div>
        </div>

        <DialogFooter className="mt-auto pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleDialogClose}>
              Cancelar
            </Button>
            <GenerateProntuarioButton
                patientData={patientDataForButton}
                sessionData={sessionDataForButton}
                psicologoData={psicologoDataForButton}
                sessionNotesContent={currentSessionNotesContent || "<p>(Nenhuma anotação de evolução registrada)</p>"}
                onGenerationComplete={handleDialogClose} 
            />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

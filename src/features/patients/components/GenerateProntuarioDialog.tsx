
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
import { useState, useEffect, useCallback } from "react";
import { FileText, Loader2, CopyIcon, DownloadIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";


interface GenerateProntuarioDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  patient: Patient | null;
  currentUser: User | null;
  // currentSessionNotesContent: string; // No longer needed as input, will be fetched from patient.sessionNotes
}

const initialDynamicData: Omit<ProntuarioGenerationDataDynamic, "Descrição do Procedimento/Análise"> = {
  'Descrição da Demanda/Queixa': '', // This might be pre-filled from patient.prontuario.demandaQueixaPrincipal
  'Descrição da Conclusão/Encaminhamento': '', // This might be pre-filled from patient.prontuario.conclusaoEncaminhamentoGeral
};

const PRONTUARIO_TEMPLATE = `PRONTUÁRIO PSICOLÓGICO

Identificação
Nome Completo: [Nome Completo do Paciente]
Sexo: [Sexo do Paciente]
CPF: [CPF do Paciente]
Data de Nasc.: [Data de Nasc. do Paciente]
Estado Civil: [Estado Civil do Paciente]
Raça/Cor: [Raça/Cor do Paciente]
Possui filhos: [Status Filhos] Quantos: [Quantidade de Filhos]
Situação profissional: [Situação Profissional do Paciente]
Profissão: [Profissão do Paciente]
Escolaridade: [Escolaridade do Paciente]
Renda: [Renda do Paciente]
Endereço: [Endereço do Paciente]
Casa: [Tipo de Moradia]
Telefone: [Telefone do Paciente] / Contato emergência: [Contato de Emergência]

1.1. Entrada na Unidade
[Descrição da Entrada na Unidade]

1.2. Finalidade
Descrever a atuação profissional do técnico da psicologia no acolhimento e escuta humanizada, podendo gerar orientações, recomendações, encaminhamentos e intervenções pertinentes à atuação descrita no documento, não tendo como finalidade produzir diagnóstico psicológico.

1.3. Responsável Técnica
[Nome do Psicólogo]
Psicóloga CRP 06/[CRP do Psicólogo]

Descrição da demanda/queixa
[Descrição da Demanda/Queixa]

Procedimento/Análise
[Descrição do Procedimento/Análise]

Conclusão/Encaminhamento
[Descrição da Conclusão/Encaminhamento]

Obs: Este documento não poderá ser utilizado para fins diferentes do apontado na finalidade acima, possui caráter sigiloso e trata-se de documento extrajudicial e não responsabilizo-me pelo uso dado ao relatório por parte da pessoa, grupo ou instituição, após a sua entrega em entrevista devolutiva.

[Local da Assinatura], [Dia de Emissão] de [Mês de Emissão] de 20[Ano de Emissão].

____________________________________________________
[Nome do Psicólogo]
Psicóloga(o) 06/[CRP do Psicólogo]
`;


export function GenerateProntuarioDialog({ 
    isOpen, 
    onOpenChange, 
    patient, 
    currentUser,
}: GenerateProntuarioDialogProps) {
  const [dynamicData, setDynamicData] = useState(initialDynamicData);
  const [isFormValid, setIsFormValid] = useState(false);
  const [generatedProntuarioText, setGeneratedProntuarioText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && patient) {
      setDynamicData({
        'Descrição da Demanda/Queixa': patient.prontuario?.demandaQueixaPrincipal || '',
        'Descrição da Conclusão/Encaminhamento': patient.prontuario?.conclusaoEncaminhamentoGeral || '',
      });
      setGeneratedProntuarioText(null); // Reset generated text
    }
  }, [isOpen, patient]);

  useEffect(() => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient || !currentUser || !isFormValid) {
      toast({ title: "Erro", description: "Dados incompletos para gerar o prontuário.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setGeneratedProntuarioText(null);

    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing

    const prontuarioData = patient.prontuario || {};
    const identificacao = prontuarioData.identificacao || {};
    const entradaUnidade = prontuarioData.entradaUnidade || {};

    // Consolidate all "Procedimento/Análise" entries
    let procedimentosTexto = "";
    if (prontuarioData.procedimentosAnalise && prontuarioData.procedimentosAnalise.length > 0) {
        procedimentosTexto = prontuarioData.procedimentosAnalise
            .map(entry => `Data: ${format(parseISO(entry.date), "dd/MM/yyyy HH:mm", { locale: ptBR })}\n${stripHtml(entry.content)}\n`)
            .join("\n---\n\n");
    } else {
        procedimentosTexto = "(Nenhum procedimento/análise detalhado registrado nas evoluções)";
    }
    
    // Fallback for patient data if not in prontuario.identificacao
    const nomePaciente = identificacao.nomeCompleto || patient.name || '(não informado)';
    const dataNascPaciente = identificacao.dataNascimento ? format(parseISO(identificacao.dataNascimento), "dd/MM/yyyy", { locale: ptBR }) : patient.dateOfBirth ? format(parseISO(patient.dateOfBirth), "dd/MM/yyyy", { locale: ptBR }) : '(não informado)';
    const enderecoPaciente = identificacao.enderecoCasa || patient.address || '(não informado)';
    const telefonePaciente = identificacao.telefone || patient.phone || '(não informado)';


    const placeholders = {
      "[Nome Completo do Paciente]": nomePaciente,
      "[Sexo do Paciente]": identificacao.sexo || '(não informado)',
      "[CPF do Paciente]": identificacao.cpf || '(não informado)',
      "[Data de Nasc. do Paciente]": dataNascPaciente,
      "[Estado Civil do Paciente]": identificacao.estadoCivil || '(não informado)',
      "[Raça/Cor do Paciente]": identificacao.racaCor || '(não informado)',
      "[Status Filhos]": identificacao.possuiFilhos ? 'Sim' : identificacao.possuiFilhos === false ? 'Não' : '(não informado)',
      "[Quantidade de Filhos]": identificacao.quantosFilhos?.toString() || (identificacao.possuiFilhos ? '0' : '(não informado)'),
      "[Situação Profissional do Paciente]": identificacao.situacaoProfissional || '(não informado)',
      "[Profissão do Paciente]": identificacao.profissao || '(não informado)',
      "[Escolaridade do Paciente]": identificacao.escolaridade || '(não informado)',
      "[Renda do Paciente]": identificacao.renda || '(não informado)',
      "[Endereço do Paciente]": enderecoPaciente,
      "[Tipo de Moradia]": identificacao.tipoMoradia || '(não informado)',
      "[Telefone do Paciente]": telefonePaciente,
      "[Contato de Emergência]": identificacao.contatoEmergencia || '(não informado)',
      "[Descrição da Entrada na Unidade]": entradaUnidade.descricaoEntrada || '(não informado)',
      "[Nome do Psicólogo]": currentUser.name || '(não informado)',
      "[CRP do Psicólogo]": currentUser.crp || '(não informado)',
      "[Descrição da Demanda/Queixa]": dynamicData['Descrição da Demanda/Queixa'],
      "[Descrição do Procedimento/Análise]": procedimentosTexto,
      "[Descrição da Conclusão/Encaminhamento]": dynamicData['Descrição da Conclusão/Encaminhamento'],
      "[Local da Assinatura]": prontuarioData.localAssinatura || 'Santana de Parnaíba',
      "[Dia de Emissão]": new Date().getDate().toString(),
      "[Mês de Emissão]": new Date().toLocaleString("pt-BR", { month: "long" }),
      "[Ano de Emissão]": new Date().getFullYear().toString().slice(-2),
      "[Data do Atendimento]": new Date().toLocaleDateString("pt-BR"), // This should ideally be session specific if generating for one session
    };

    let finalProntuarioText = PRONTUARIO_TEMPLATE;
    for (const key in placeholders) {
      finalProntuarioText = finalProntuarioText.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), placeholders[key as keyof typeof placeholders]);
    }
    // Replace any remaining placeholders not found in data
    finalProntuarioText = finalProntuarioText.replace(/\[.*?\]/g, '(não informado)');

    setGeneratedProntuarioText(finalProntuarioText);
    setIsLoading(false);
    toast({ title: "Prontuário Gerado Localmente", description: "O texto do prontuário está pronto para visualização e cópia." });
  };

  const handleCopyText = () => {
    if (generatedProntuarioText) {
      navigator.clipboard.writeText(generatedProntuarioText)
        .then(() => toast({ description: "Texto do prontuário copiado!" }))
        .catch(() => toast({ description: "Falha ao copiar texto.", variant: "destructive" }));
    }
  };
  
  const handleDownloadText = () => {
    if (generatedProntuarioText && patient) {
      const blob = new Blob([generatedProntuarioText], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Prontuario_${patient.name.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast({ description: "Download do prontuário iniciado." });
    }
  };

  // Helper to strip HTML for plain text version (simple version)
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  }

  if (!patient || !currentUser) {
    if (isOpen) {
        toast({ title: "Erro", description: "Dados do paciente ou psicólogo ausentes.", variant: "destructive"});
        onOpenChange(false);
    }
    return null;
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center">
            <FileText className="mr-2 h-5 w-5 text-primary"/>Gerar Texto do Prontuário
          </DialogTitle>
          <DialogDescription>
            Preencha/revise os campos abaixo para {patient?.name}. 
            O "Procedimento/Análise" será preenchido com o histórico de evoluções.
          </DialogDescription>
        </DialogHeader>
        
        {!generatedProntuarioText ? (
            <form onSubmit={handleSubmit} className="space-y-4 py-2 overflow-y-auto flex-grow pr-2">
                <div>
                    <Label htmlFor="demandaQueixa">Descrição da Demanda/Queixa (Geral)</Label>
                    <Textarea 
                    id="demandaQueixa" 
                    name="Descrição da Demanda/Queixa" 
                    value={dynamicData['Descrição da Demanda/Queixa']} 
                    onChange={handleChange}
                    rows={4} 
                    required
                    placeholder="Queixa principal que motivou o acompanhamento ou resumo da demanda..."
                    />
                </div>
                <div>
                    <Label htmlFor="conclusaoEncaminhamento">Conclusão/Encaminhamento (Geral)</Label>
                    <Textarea 
                    id="conclusaoEncaminhamento" 
                    name="Descrição da Conclusão/Encaminhamento" 
                    value={dynamicData['Descrição da Conclusão/Encaminhamento']} 
                    onChange={handleChange}
                    rows={4} 
                    required
                    placeholder="Conclusões gerais do caso, próximos passos, encaminhamentos, etc."
                    />
                </div>
                 <p className="text-xs text-muted-foreground">
                    Nota: A seção "Procedimento/Análise" será preenchida automaticamente com todas as "Evoluções das Sessões" registradas para este paciente.
                 </p>
                <DialogFooter className="mt-auto pt-4 border-t sticky bottom-0 bg-background z-10">
                    <Button type="button" variant="outline" onClick={handleDialogClose} disabled={isLoading}>
                    Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading || !isFormValid}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                    Gerar Texto do Prontuário
                    </Button>
                </DialogFooter>
            </form>
        ) : (
            <div className="space-y-4 py-2 overflow-y-auto flex-grow pr-2 flex flex-col">
                <Label className="font-semibold">Texto do Prontuário Gerado:</Label>
                <Textarea
                    value={generatedProntuarioText}
                    readOnly
                    rows={15}
                    className="flex-grow min-h-[300px] text-xs"
                />
                <DialogFooter className="mt-auto pt-4 border-t sticky bottom-0 bg-background z-10">
                     <Button type="button" variant="outline" onClick={() => setGeneratedProntuarioText(null)} disabled={isLoading}>
                        Voltar para Edição
                    </Button>
                    <Button type="button" onClick={handleCopyText} variant="secondary">
                        <CopyIcon className="mr-2 h-4 w-4"/> Copiar Texto
                    </Button>
                    <Button type="button" onClick={handleDownloadText}>
                        <DownloadIcon className="mr-2 h-4 w-4"/> Baixar .txt
                    </Button>
                </DialogFooter>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// This component is no longer used for Google Docs generation.
// It's kept here as a reference or if needed for a different type of button in future.
// For now, its functionality is integrated into GenerateProntuarioDialog for local generation.
/*
export function GenerateProntuarioButton({
  patientData,
  sessionData,
  psicologoData,
  sessionNotesContent,
  onGenerationComplete,
}: GenerateProntuarioButtonProps) {
 // ... (previous Google Docs generation code)
}
*/

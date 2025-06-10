
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
import type { Patient, ProntuarioAppsScriptPayload, ProntuarioGenerationDataDynamic, User } from "@/types";
import { useState } from "react";
import { Loader2, FileText, Copy as CopyIcon, Download as DownloadIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

// Template do Prontuário (anteriormente no Apps Script)
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

Procedimento/ Análise
   [Data do Atendimento]
  [Descrição do Procedimento/Análise]

Conclusão/ Encaminhamento
[Descrição da Conclusão/Encaminhamento]

Obs: Este documento não poderá ser utilizado para fins diferentes do apontado na finalidade acima, possui caráter sigiloso e trata-se de documento extrajudicial e não responsabilizo-me pelo uso dado ao relatório por parte da pessoa, grupo ou instituição, após a sua entrega em entrevista devolutiva .

Santana de Parnaíba, [Dia de Emissão] de [Mês de Emissão] de 20[Ano de Emissão].

____________________________________________________
[Nome do Psicólogo]
Psicóloga(o) 06/[CRP do Psicólogo]`;


interface GenerateProntuarioDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  patient: Patient | null;
  currentUser: User | null;
}

const initialDynamicData: ProntuarioGenerationDataDynamic = {
  'Descrição da Demanda/Queixa': '',
  'Descrição do Procedimento/Análise': '',
  'Descrição da Conclusão/Encaminhamento': '',
};

export function GenerateProntuarioDialog({ isOpen, onOpenChange, patient, currentUser }: GenerateProntuarioDialogProps) {
  const [dynamicData, setDynamicData] = useState<ProntuarioGenerationDataDynamic>(initialDynamicData);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedProntuarioText, setGeneratedProntuarioText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDynamicData(prev => ({ ...prev, [name]: value }));
  };

  const fillTemplate = (template: string, data: ProntuarioAppsScriptPayload): string => {
    let filledTemplate = template;

    const allData: Record<string, any> = {
      ...(data.paciente || {}),
      ...(data.dinamico || {}),
      ...(data.psicologo || {}),
      ...(data.data || {}),
    };
    
    for (const key in allData) {
      const tag = `[${key}]`;
      filledTemplate = filledTemplate.replace(new RegExp(tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "g"), allData[key] || '(não informado)');
    }

    // Substitui quaisquer placeholders restantes
    filledTemplate = filledTemplate.replace(/\[.*?\]/g, '(não informado)');
    return filledTemplate;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient || !currentUser) {
      toast({ title: "Erro", description: "Dados do paciente ou do psicólogo não encontrados.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setGeneratedProntuarioText(null);
    setError(null);

    const today = new Date();
    const payload: ProntuarioAppsScriptPayload = {
      paciente: {
        'Nome Completo do Paciente': patient.prontuario?.identificacao?.nomeCompleto || patient.name,
        'Sexo do Paciente': patient.prontuario?.identificacao?.sexo,
        'CPF do Paciente': patient.prontuario?.identificacao?.cpf,
        'Data de Nasc. do Paciente': patient.prontuario?.identificacao?.dataNascimento ? format(parseISO(patient.prontuario.identificacao.dataNascimento), "dd/MM/yyyy", {locale: ptBR}) : patient.dateOfBirth ? format(parseISO(patient.dateOfBirth), "dd/MM/yyyy", {locale: ptBR}) : undefined,
        'Estado Civil do Paciente': patient.prontuario?.identificacao?.estadoCivil,
        'Raça/Cor do Paciente': patient.prontuario?.identificacao?.racaCor,
        'Status Filhos': patient.prontuario?.identificacao?.possuiFilhos ? 'Sim' : 'Não',
        'Quantidade de Filhos': patient.prontuario?.identificacao?.quantosFilhos?.toString() || (patient.prontuario?.identificacao?.possuiFilhos ? '0' : undefined),
        'Situação Profissional do Paciente': patient.prontuario?.identificacao?.situacaoProfissional,
        'Profissão do Paciente': patient.prontuario?.identificacao?.profissao,
        'Escolaridade do Paciente': patient.prontuario?.identificacao?.escolaridade,
        'Renda do Paciente': patient.prontuario?.identificacao?.renda,
        'Endereço do Paciente': patient.prontuario?.identificacao?.enderecoCasa || patient.address,
        'Tipo de Moradia': patient.prontuario?.identificacao?.tipoMoradia,
        'Telefone do Paciente': patient.prontuario?.identificacao?.telefone || patient.phone,
        'Contato de Emergência': patient.prontuario?.identificacao?.contatoEmergencia,
        'Descrição da Entrada na Unidade': patient.prontuario?.entradaUnidade?.descricaoEntrada,
      },
      dinamico: dynamicData,
      psicologo: {
        'Nome do Psicólogo': currentUser.name,
        'CRP do Psicólogo': currentUser.crp || 'Não informado',
      },
      data: {
        'Dia de Emissão': format(today, "d", {locale: ptBR}),
        'Mês de Emissão': format(today, "MMMM", {locale: ptBR}),
        'Ano de Emissão': format(today, "yy", {locale: ptBR}),
        'Data do Atendimento': format(today, "dd/MM/yyyy", {locale: ptBR}), // Data da sessão atual
      }
    };

    try {
      // Simula um pequeno atraso para a geração local
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const prontuarioText = fillTemplate(PRONTUARIO_TEMPLATE, payload);
      setGeneratedProntuarioText(prontuarioText);
      toast({ title: "Sucesso!", description: "Prontuário gerado localmente.", className: "bg-primary text-primary-foreground" });

    } catch (err: any) {
      setError(err.message || "Falha ao gerar o prontuário localmente.");
      toast({ title: "Erro na Geração", description: err.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (generatedProntuarioText) {
      navigator.clipboard.writeText(generatedProntuarioText)
        .then(() => toast({ description: "Prontuário copiado para a área de transferência!" }))
        .catch(() => toast({ description: "Erro ao copiar o texto.", variant: "destructive" }));
    }
  };

  const handleDownloadAsTxt = () => {
    if (generatedProntuarioText && patient) {
      const blob = new Blob([generatedProntuarioText], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      const fileName = `Prontuario_${patient.name.replace(/\s+/g, '_')}_${format(new Date(), "yyyyMMdd")}.txt`;
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast({ description: "Download do prontuário iniciado." });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
            setDynamicData(initialDynamicData); 
            setGeneratedProntuarioText(null);
            setError(null);
        }
        onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center">
            <FileText className="mr-2 h-5 w-5 text-primary"/>Gerar Prontuário Psicológico
          </DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo com as informações da sessão atual para {patient?.name}.
            O texto do prontuário será gerado para visualização e cópia.
          </DialogDescription>
        </DialogHeader>
        
        {!generatedProntuarioText ? (
            <form onSubmit={handleSubmit} className="space-y-4 py-2 overflow-y-auto flex-grow pr-2">
            <div>
                <Label htmlFor="demandaQueixa">Descrição da demanda/queixa</Label>
                <Textarea 
                id="demandaQueixa" 
                name="Descrição da Demanda/Queixa" 
                value={dynamicData['Descrição da Demanda/Queixa']} 
                onChange={handleChange}
                rows={4} 
                required
                />
            </div>
            <div>
                <Label htmlFor="procedimentoAnalise">Procedimento/Análise (da sessão atual)</Label>
                <Textarea 
                id="procedimentoAnalise" 
                name="Descrição do Procedimento/Análise" 
                value={dynamicData['Descrição do Procedimento/Análise']} 
                onChange={handleChange}
                rows={6} 
                required
                />
            </div>
            <div>
                <Label htmlFor="conclusaoEncaminhamento">Conclusão/Encaminhamento</Label>
                <Textarea 
                id="conclusaoEncaminhamento" 
                name="Descrição da Conclusão/Encaminhamento" 
                value={dynamicData['Descrição da Conclusão/Encaminhamento']} 
                onChange={handleChange}
                rows={4} 
                required
                />
            </div>

            {error && (
                <div className="p-3 border rounded-md bg-red-50 border-red-200 text-red-700">
                <p className="font-medium">Erro ao Gerar Documento:</p>
                <p className="text-sm">{error}</p>
                </div>
            )}
            </form>
        ) : (
          <div className="space-y-4 py-2 overflow-y-auto flex-grow pr-2">
            <Label className="text-lg font-semibold">Prontuário Gerado:</Label>
            <Textarea
              value={generatedProntuarioText}
              readOnly
              rows={15}
              className="text-sm bg-muted/30 font-mono"
            />
          </div>
        )}

        <DialogFooter className="mt-auto pt-4 border-t flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              {generatedProntuarioText ? "Fechar" : "Cancelar"}
            </Button>
            {!generatedProntuarioText ? (
                <Button type="submit" form="generate-prontuario-form" disabled={isLoading} onClick={handleSubmit}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                    Gerar Prontuário
                </Button>
            ) : (
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button type="button" onClick={handleCopyToClipboard} variant="secondary">
                        <CopyIcon className="mr-2 h-4 w-4" /> Copiar Texto
                    </Button>
                    <Button type="button" onClick={handleDownloadAsTxt}>
                        <DownloadIcon className="mr-2 h-4 w-4" /> Baixar .txt
                    </Button>
                </div>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

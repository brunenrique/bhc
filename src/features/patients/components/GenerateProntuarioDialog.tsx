
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
import { Loader2, FileText, ExternalLink as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

// IMPORTANT: User must replace this with their deployed Google Apps Script Web App URL
const GOOGLE_APPS_SCRIPT_WEB_APP_URL = process.env.NEXT_PUBLIC_PRONTUARIO_GENERATOR_URL || 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';

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
  const [generatedDocUrl, setGeneratedDocUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDynamicData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient || !currentUser) {
      toast({ title: "Erro", description: "Dados do paciente ou do psicólogo não encontrados.", variant: "destructive" });
      return;
    }
    if (GOOGLE_APPS_SCRIPT_WEB_APP_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
        toast({ title: "Configuração Necessária", description: "A URL do Web App do Google Apps Script precisa ser configurada.", variant: "destructive", duration: 7000 });
        return;
    }

    setIsLoading(true);
    setGeneratedDocUrl(null);
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
        'Ano de Emissão': format(today, "yy", {locale: ptBR}), // "20[Ano de Emissão]" -> "24"
        'Data do Atendimento': format(today, "dd/MM/yyyy", {locale: ptBR}), // Assuming current day for this session's record
      }
    };

    try {
      const response = await fetch(GOOGLE_APPS_SCRIPT_WEB_APP_URL, {
        method: 'POST',
        mode: 'cors', // Required for cross-origin requests to Apps Script Web App
        cache: 'no-cache',
        headers: {
           // 'Content-Type': 'application/json', // Apps Script doPost for text content often doesn't need this, handles plain text.
                                               // But sending JSON string, so this is more correct for e.postData.contents
           'Content-Type': 'text/plain;charset=utf-8', // As per typical Apps Script examples for JSON.parse(e.postData.contents)
        },
        body: JSON.stringify(payload) // Send the whole payload as a JSON string
      });

      const result = await response.json();

      if (result.status === 'success' && result.url) {
        setGeneratedDocUrl(result.url);
        toast({ title: "Sucesso!", description: "Prontuário gerado no Google Docs.", className: "bg-primary text-primary-foreground" });
        // onOpenChange(false); // Optionally close dialog on success
      } else {
        throw new Error(result.message || "Erro desconhecido ao gerar o documento.");
      }
    } catch (err: any) {
      setError(err.message || "Falha ao conectar com o serviço de geração de documentos.");
      toast({ title: "Erro na Geração", description: err.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
            setDynamicData(initialDynamicData); // Reset form on close
            setGeneratedDocUrl(null);
            setError(null);
        }
        onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center">
            <FileText className="mr-2 h-5 w-5 text-primary"/>Gerar Prontuário Psicológico (Google Doc)
          </DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo com as informações da sessão atual para {patient?.name}.
            O documento será gerado no Google Docs.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <Label htmlFor="demandaQueixa">Descrição da demanda/queixa</Label>
            <Textarea 
              id="demandaQueixa" 
              name="Descrição da Demanda/Queixa" 
              value={dynamicData['Descrição da Demanda/Queixa']} 
              onChange={handleChange}
              rows={3} 
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
              rows={5} 
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
              rows={3} 
              required
            />
          </div>

          {generatedDocUrl && (
            <div className="p-3 border rounded-md bg-green-50 border-green-200 text-green-700 space-y-2">
              <p className="font-medium">Documento gerado com sucesso!</p>
              <Button asChild variant="link" className="p-0 h-auto text-green-700 hover:text-green-800">
                <a href={generatedDocUrl} target="_blank" rel="noopener noreferrer">
                  Abrir Google Doc <LinkIcon className="ml-1.5 h-4 w-4" />
                </a>
              </Button>
            </div>
          )}

          {error && (
            <div className="p-3 border rounded-md bg-red-50 border-red-200 text-red-700">
              <p className="font-medium">Erro ao Gerar Documento:</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !!generatedDocUrl}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
              Gerar Documento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileUp } from "lucide-react";

interface GenerateProntuarioButtonProps {
  patientData: {
    "Nome Completo do Paciente": string | undefined;
    "CPF do Paciente": string | undefined;
    "Sexo do Paciente"?: string | undefined;
    "Data de Nasc. do Paciente"?: string | undefined;
    "Estado Civil do Paciente"?: string | undefined;
    "Raça/Cor do Paciente"?: string | undefined;
    "Status Filhos"?: string | undefined;
    "Quantidade de Filhos"?: string | undefined;
    "Situação Profissional do Paciente"?: string | undefined;
    "Profissão do Paciente"?: string | undefined;
    "Escolaridade do Paciente"?: string | undefined;
    "Renda do Paciente"?: string | undefined;
    "Endereço do Paciente"?: string | undefined;
    "Tipo de Moradia"?: string | undefined;
    "Telefone do Paciente"?: string | undefined;
    "Contato de Emergência"?: string | undefined;
    "Descrição da Entrada na Unidade"?: string | undefined;
  };
  sessionData: {
    "Descrição da Demanda/Queixa": string;
    "Descrição da Conclusão/Encaminhamento": string;
  };
  psicologoData: {
    "Nome do Psicólogo": string;
    "CRP do Psicólogo": string;
  };
  sessionNotesContent: string; // This will be used for "Descrição do Procedimento/Análise"
  onGenerationComplete?: () => void;
}

export function GenerateProntuarioButton({
  patientData,
  sessionData,
  psicologoData,
  sessionNotesContent,
  onGenerationComplete,
}: GenerateProntuarioButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setLoading(true);
    const WEB_APP_URL = process.env.NEXT_PUBLIC_GDOC_WEBHOOK_URL || "https://script.google.com/macros/s/AKfycbw8u9_mc2L5jATbWAZ4Tk4n8r5skw9BzeWFM7ZI19HWAx7kQWxzfZoEbFRJVrYeAWXFzw/exec";

    if (!WEB_APP_URL) {
        toast({
            title: "Configuração Incompleta",
            description: "A URL do serviço de geração de documentos não está configurada.",
            variant: "destructive",
        });
        setLoading(false);
        return;
    }
    
    const payload = {
      paciente: patientData,
      dinamico: {
        ...sessionData,
        "Descrição do Procedimento/Análise": sessionNotesContent, // Use main session notes here
      },
      psicologo: psicologoData,
      data: {
        "Dia de Emissão": new Date().getDate().toString(),
        "Mês de Emissão": new Date().toLocaleString("pt-BR", { month: "long" }),
        "Ano de Emissão": new Date().getFullYear().toString().slice(-2),
        "Data do Atendimento": new Date().toLocaleDateString("pt-BR"),
      }
    };

    try {
      const res = await fetch(WEB_APP_URL!, {
        method: "POST",
        // mode: 'cors', // Apps Script doPost usually requires this to be omitted or handled by server
        body: JSON.stringify(payload), // Apps Script expects raw string for e.postData.contents
      });
      
      // Apps Script ContentService returns JSON, so parse directly
      const json = await res.json();

      if (json.status === "success") {
        toast({
          title: "Documento Criado com Sucesso!",
          description: "O Prontuário foi gerado e está pronto para visualização.",
          action: (
            <Button variant="outline" size="sm" onClick={() => window.open(json.url, "_blank")}>
              Abrir Documento
            </Button>
          ),
          duration: 9000,
        });
        if (json.url) {
            window.open(json.url, "_blank");
        }
        if (onGenerationComplete) onGenerationComplete();
      } else {
        throw new Error(json.message || "Erro desconhecido do servidor de documentos.");
      }
    } catch (error: any) {
      toast({
        title: "Erro ao Gerar Prontuário",
        description: error.message || "Ocorreu um erro inesperado. Verifique o console do Apps Script para detalhes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleGenerate} disabled={loading} className="w-full">
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileUp className="mr-2 h-4 w-4" />}
      {loading ? "Gerando Documento..." : "Gerar e Abrir Prontuário no Google Docs"}
    </Button>
  );
}

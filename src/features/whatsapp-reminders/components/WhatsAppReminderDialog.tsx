
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
import type { Patient, Session } from "@/types";
import { formatPhoneNumberForWhatsApp } from "@/utils/formatter";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Copy, ExternalLink, Loader2, MessageSquare, Mailbox } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface ReminderItem {
  patient: Patient;
  session: Session;
}

interface WhatsAppReminderDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  reminderItem: ReminderItem | null;
}

const MOCK_CLINIC_ADDRESS = "Rua das Palmeiras, 123, Sala 4A, Bairro Feliz, Cidade Alegre - UF";
const MOCK_CLINIC_NAME = "Clínica PsicoBem";

interface MessageTemplate {
  id: string;
  name: string;
  content: string;
}

const messageTemplates: MessageTemplate[] = [
  {
    id: "default",
    name: "Lembrete Padrão",
    content: `Olá {{paciente_primeiro_nome}}, este é um lembrete da sua consulta na {{nome_clinica}}. Sua sessão com {{nome_psicologo}} está agendada para {{data_sessao_extenso}} às {{horario_sessao}}. Nosso endereço é: {{endereco_clinica}}. Até breve!`,
  },
  {
    id: "confirm_request",
    name: "Lembrete com Pedido de Confirmação",
    content: `Olá {{paciente_primeiro_nome}}! Lembramos da sua consulta com {{nome_psicologo}} na {{nome_clinica}}, agendada para {{data_sessao_extenso}} às {{horario_sessao}} (Endereço: {{endereco_clinica}}). Por favor, confirme sua presença respondendo "SIM" a esta mensagem. Obrigado!`,
  },
  {
    id: "friendly",
    name: "Lembrete Amigável",
    content: `Oi {{paciente_primeiro_nome}}! 😊 Tudo bem? Só para te lembrar da nossa sessão com {{nome_psicologo}} na {{data_sessao_extenso}}, às {{horario_sessao}}, aqui na {{nome_clinica}} ({{endereco_clinica}}). Estamos te esperando!`,
  },
  {
    id: "short",
    name: "Lembrete Curto",
    content: `Lembrete de consulta: {{paciente_primeiro_nome}}, sua sessão com {{nome_psicologo}} é {{data_sessao_curta}} às {{horario_sessao}}. {{nome_clinica}}, {{endereco_clinica}}.`,
  },
];

export function WhatsAppReminderDialog({
  isOpen,
  onOpenChange,
  reminderItem,
}: WhatsAppReminderDialogProps) {
  const [message, setMessage] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(messageTemplates[0].id);
  const [whatsAppUrl, setWhatsAppUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const populateMessageFromTemplate = useCallback((templateId: string) => {
    if (!reminderItem) return "";
    
    const template = messageTemplates.find(t => t.id === templateId);
    if (!template) return generateDefaultMessage(); // Fallback if template not found

    const { patient, session } = reminderItem;
    const sessionDate = parseISO(session.startTime);
    const patientFirstName = patient.name.split(" ")[0];
    
    // dd 'de' MMMM 'de' yyyy (e.g., "25 de junho de 2024")
    const fullDate = format(sessionDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    // EEEE, dd 'de' MMMM (e.g., "terça-feira, 25 de junho")
    const dayOfWeekAndDate = format(sessionDate, "EEEE, dd 'de' MMMM", { locale: ptBR });
    // dd/MM/yy (e.g., "25/06/24")
    const shortDate = format(sessionDate, "dd/MM/yy", { locale: ptBR });
    const time = format(sessionDate, "HH:mm", { locale: ptBR });
    const psychologistName = session.psychologistName || "seu/sua psicólogo(a)";

    let populatedMessage = template.content;
    populatedMessage = populatedMessage.replace(/{{paciente_primeiro_nome}}/g, patientFirstName);
    populatedMessage = populatedMessage.replace(/{{data_sessao_extenso}}/g, dayOfWeekAndDate);
    populatedMessage = populatedMessage.replace(/{{data_sessao_completa}}/g, fullDate);
    populatedMessage = populatedMessage.replace(/{{data_sessao_curta}}/g, shortDate);
    populatedMessage = populatedMessage.replace(/{{horario_sessao}}/g, time);
    populatedMessage = populatedMessage.replace(/{{nome_psicologo}}/g, psychologistName);
    populatedMessage = populatedMessage.replace(/{{endereco_clinica}}/g, MOCK_CLINIC_ADDRESS);
    populatedMessage = populatedMessage.replace(/{{nome_clinica}}/g, MOCK_CLINIC_NAME);
    
    return populatedMessage;

  }, [reminderItem]);

  const generateDefaultMessage = useCallback(() => { // Still useful as a fallback or initial state
    if (!reminderItem) return "";
    return populateMessageFromTemplate(messageTemplates[0].id); // Use the first template as default
  }, [reminderItem, populateMessageFromTemplate]);

  useEffect(() => {
    if (isOpen && reminderItem) {
      setMessage(populateMessageFromTemplate(selectedTemplateId));
      setWhatsAppUrl(null); 
    }
  }, [isOpen, reminderItem, selectedTemplateId, populateMessageFromTemplate]);


  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setMessage(populateMessageFromTemplate(templateId));
    setWhatsAppUrl(null); // Reset URL when template changes, as message content changes
  };

  const handleGenerateLink = () => {
    if (!reminderItem || !reminderItem.patient.phone || !message) {
      toast({
        title: "Erro",
        description: "Telefone do paciente ou mensagem estão ausentes.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    const formattedPhone = formatPhoneNumberForWhatsApp(
      reminderItem.patient.phone
    );
    if (!formattedPhone) {
      toast({
        title: "Erro",
        description: "Número de telefone inválido ou não formatável.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    setWhatsAppUrl(url);
    setIsLoading(false);
    toast({
      title: "Link Gerado!",
      description: "O link para o WhatsApp foi gerado com sucesso.",
    });
  };

  const handleCopyLink = () => {
    if (whatsAppUrl) {
      navigator.clipboard
        .writeText(whatsAppUrl)
        .then(() => {
          toast({ description: "Link copiado para a área de transferência!" });
        })
        .catch(() => {
          toast({
            description: "Erro ao copiar o link.",
            variant: "destructive",
          });
        });
    }
  };

  if (!reminderItem) return null;

  const { patient, session } = reminderItem;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-green-600" />
            Lembrete WhatsApp para {patient.name}
          </DialogTitle>
          <DialogDescription>
            Consulta em:{" "}
            {format(parseISO(session.startTime), "dd/MM/yyyy 'às' HH:mm", {
              locale: ptBR,
            })}
            <br />
            Telefone: {patient.phone || "Não informado"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-3">
          <div>
            <Label htmlFor="messageTemplate">Modelo de Mensagem</Label>
            <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
              <SelectTrigger id="messageTemplate" className="mt-1">
                <SelectValue placeholder="Selecione um modelo" />
              </SelectTrigger>
              <SelectContent>
                {messageTemplates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="whatsappMessage">Mensagem Personalizada</Label>
            <Textarea
              id="whatsappMessage"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={7}
              className="mt-1"
            />
          </div>

          {whatsAppUrl && (
            <div className="space-y-1">
              <Label htmlFor="whatsappLink">Link Gerado</Label>
              <div className="flex items-center gap-2">
                <Input id="whatsappLink" value={whatsAppUrl} readOnly />
                <Button type="button" variant="ghost" size="icon" onClick={handleCopyLink} title="Copiar link">
                    <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 pt-2">
          <Button
            type="button"
            onClick={handleGenerateLink}
            disabled={isLoading || !message}
            variant="outline"
            className="w-full sm:w-auto"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Mailbox className="mr-2 h-4 w-4" />
            {whatsAppUrl ? "Atualizar Link WhatsApp" : "Gerar Link WhatsApp"}
          </Button>
          {whatsAppUrl && (
            <Button asChild className="w-full sm:w-auto"><a href={whatsAppUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4" /> Abrir no WhatsApp</a></Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    
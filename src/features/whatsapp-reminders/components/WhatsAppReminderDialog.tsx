
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
import type { Patient, Session } from "@/types";
import { formatPhoneNumberForWhatsApp } from "@/utils/formatter";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Copy, ExternalLink, Loader2, MessageSquare } from "lucide-react";
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

export function WhatsAppReminderDialog({
  isOpen,
  onOpenChange,
  reminderItem,
}: WhatsAppReminderDialogProps) {
  const [message, setMessage] = useState("");
  const [whatsAppUrl, setWhatsAppUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateDefaultMessage = useCallback(() => {
    if (!reminderItem) return "";
    const { patient, session } = reminderItem;
    const sessionDate = parseISO(session.startTime);
    // Example: "terça-feira"
    const dayOfWeek = format(sessionDate, "EEEE", { locale: ptBR });
    // Example: "14:00"
    const time = format(sessionDate, "HH:mm", { locale: ptBR });

    return `Olá ${patient.name.split(" ")[0]}, aqui é da Clínica Equilíbrio. Lembramos que sua consulta está agendada para ${dayOfWeek}, às ${time}. Qualquer dúvida, estamos à disposição! ✅`;
  }, [reminderItem]);

  useEffect(() => {
    if (isOpen && reminderItem) {
      setMessage(generateDefaultMessage());
      setWhatsAppUrl(null); // Reset URL when dialog opens or item changes
    }
  }, [isOpen, reminderItem, generateDefaultMessage]);

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
            <Label htmlFor="whatsappMessage">Mensagem Personalizada</Label>
            <Textarea
              id="whatsappMessage"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="mt-1"
            />
          </div>

          {whatsAppUrl && (
            <div className="space-y-1">
              <Label htmlFor="whatsappLink">Link Gerado</Label>
              <Input id="whatsappLink" value={whatsAppUrl} readOnly />
            </div>
          )}
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            type="button"
            onClick={handleGenerateLink}
            disabled={isLoading || !message}
            variant="outline"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {whatsAppUrl ? "Atualizar Link" : "Gerar Link WhatsApp"}
          </Button>
          {whatsAppUrl && (
            <>
              <Button
                type="button"
                onClick={handleCopyLink}
                variant="secondary"
              >
                <Copy className="mr-2 h-4 w-4" /> Copiar Link
              </Button>
              <Button asChild>
                <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" /> Abrir no WhatsApp
                </a>
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

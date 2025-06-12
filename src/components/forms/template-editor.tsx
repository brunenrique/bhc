
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Save, Sparkles } from "lucide-react";
import { generateSessionNoteTemplate } from '@/services/aiService';
import type { GenerateSessionNoteTemplateOutput } from '@/ai/flows/generate-session-note-template';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

interface TemplateEditorProps {
  templateId?: string; 
  initialName?: string;
  initialContent?: string;
  initialPatientName?: string;
  initialSessionSummary?: string;
}

export default function TemplateEditor({
  templateId,
  initialName = "",
  initialContent = "",
  initialPatientName = "", // Used for AI generation context if creating new
  initialSessionSummary = "" // Used for AI generation context if creating new
}: TemplateEditorProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [templateName, setTemplateName] = useState(initialName);
  const [templateContent, setTemplateContent] = useState(initialContent);
  
  // AI Generation specific states
  const [patientNameForAI, setPatientNameForAI] = useState(initialPatientName);
  const [sessionSummaryForAI, setSessionSummaryForAI] = useState(initialSessionSummary);
  const [therapistInstructions, setTherapistInstructions] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Update state if initial props change (e.g., when navigating to edit page)
  useEffect(() => {
    setTemplateName(initialName);
    setTemplateContent(initialContent);
    // Reset AI fields if editing an existing template, unless they are also passed initially
    if (templateId) {
        setPatientNameForAI(initialPatientName || "");
        setSessionSummaryForAI(initialSessionSummary || "");
    }
  }, [initialName, initialContent, templateId, initialPatientName, initialSessionSummary]);


  const handleGenerateTemplate = async () => {
    if (!patientNameForAI || !sessionSummaryForAI) {
      toast({
        title: "Informação Faltando",
        description: "Por favor, forneça Nome do Paciente e Resumo da Sessão para gerar um modelo.",
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);
    try {
      const result: GenerateSessionNoteTemplateOutput = await generateSessionNoteTemplate({
        patientName: patientNameForAI,
        sessionSummary: sessionSummaryForAI,
        therapistInstructions,
      });
      setTemplateContent(result.template); // Overwrites current content with AI generated
      if (!templateName && patientNameForAI) { // Suggest a template name if not already set
        setTemplateName(`Modelo para ${patientNameForAI}`);
      }
      toast({
        title: "Modelo Gerado por IA",
        description: "Um rascunho de modelo foi gerado e preenchido no editor.",
      });
    } catch (error) {
      console.error("Erro ao gerar modelo:", error);
      toast({
        title: "Falha na Geração com IA",
        description: "Não foi possível gerar o modelo. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName || !templateContent) {
        toast({
            title: "Campos Obrigatórios",
            description: "O nome e o conteúdo do modelo não podem estar vazios.",
            variant: "destructive",
        });
        return;
    }
    setIsSaving(true);
    // Simula chamada de API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: templateId ? "Modelo Atualizado" : "Modelo Criado",
      description: `O modelo "${templateName}" foi ${templateId ? 'atualizado' : 'criado'} com sucesso.`,
    });
    setIsSaving(false);
    router.push("/templates"); // Redirect to templates list after saving
  };

  return (
    <Card className="shadow-lg mt-8">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center">
          <Brain className="mr-2 h-6 w-6 text-accent" />
          {templateId ? `Editando: ${initialName}` : "Criar Novo Modelo"}
        </CardTitle>
        <CardDescription>
          {templateId ? "Modifique os detalhes do modelo abaixo." : "Use o assistente de IA para ajudar a rascunhar seu modelo de anotação de sessão ou escreva o seu próprio."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="templateName">Nome do Modelo *</Label>
          <Input
            id="templateName"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Ex: Notas de Consulta Inicial"
          />
        </div>

        {!templateId && ( // Show AI generation section only for new templates
            <Card className="bg-muted/30 p-4 space-y-3">
                <p className="text-sm font-medium text-foreground">Assistente de Geração de Modelo com IA</p>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="patientNameForAI">Nome do Paciente (para assistência IA)</Label>
                        <Input id="patientNameForAI" value={patientNameForAI} onChange={(e) => setPatientNameForAI(e.target.value)} placeholder="Maria Silva" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="sessionSummaryForAI">Resumo da Sessão (para assistência IA)</Label>
                        <Input id="sessionSummaryForAI" value={sessionSummaryForAI} onChange={(e) => setSessionSummaryForAI(e.target.value)} placeholder="Breve resumo da sessão..." />
                    </div>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="therapistInstructions">Instruções Específicas (opcional)</Label>
                    <Textarea id="therapistInstructions" value={therapistInstructions} onChange={(e) => setTherapistInstructions(e.target.value)} placeholder="Ex: Focar no humor, incluir seção para plano de tratamento..." rows={2}/>
                </div>
                <Button onClick={handleGenerateTemplate} disabled={isGenerating || !patientNameForAI || !sessionSummaryForAI} variant="outline">
                {isGenerating ? <Sparkles className="mr-2 h-4 w-4 animate-pulse" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {isGenerating ? "Gerando..." : "Gerar com IA"}
                </Button>
            </Card>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="templateContent">Conteúdo do Modelo *</Label>
          {isGenerating ? (
            <Skeleton className="h-48 w-full" />
          ): (
            <Textarea
              id="templateContent"
              value={templateContent}
              onChange={(e) => setTemplateContent(e.target.value)}
              placeholder="Digite o conteúdo do seu modelo aqui... \n\nExemplo de Seções:\n- Apresentação do Paciente:\n- Pontos Chave da Discussão:\n- Intervenções Utilizadas:\n- Resposta do Paciente:\n- Avaliação de Risco:\n- Plano para Próxima Sessão:"
              rows={15}
              className="min-h-[300px] font-mono text-sm"
            />
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveTemplate} disabled={isSaving || !templateName || !templateContent} className="ml-auto bg-accent hover:bg-accent/90 text-accent-foreground">
          {isSaving ? <Save className="mr-2 h-4 w-4 animate-pulse" /> : <Save className="mr-2 h-4 w-4" />}
          {isSaving ? "Salvando..." : (templateId ? "Salvar Alterações" : "Criar Modelo")}
        </Button>
      </CardFooter>
    </Card>
  );
}

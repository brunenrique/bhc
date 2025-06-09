
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Assessment } from "@/types";
import { useState, useEffect, useCallback } from "react";
import { Loader2, LinkIcon, Send, Save } from "lucide-react"; // Changed Link to LinkIcon
import { useToast } from "@/hooks/use-toast";
import Link from "next/link"; // For navigating to the form

interface AssessmentCreatorProps {
  onSave: (data: Partial<Assessment>) => void;
  existingAssessment?: Assessment | null;
  onCancel?: () => void; // For edit mode
}

const initialFormState: Partial<Assessment> = {
  title: "",
  patientId: "",
  status: "pending",
};

const mockPatients = [{id: 'p1', name: 'Ana Silva'}, {id: 'p2', name: 'Bruno Costa'}, {id: 'p3', name: 'Carla Dias'}];
const mockAssessmentTemplates = [
  { id: 'beck_anxiety', name: 'Escala Beck de Ansiedade' },
  { id: 'beck_depression', name: 'Inventário de Depressão de Beck (BDI)' },
  { id: 'whoqol', name: 'Questionário de Qualidade de Vida (WHOQOL-BREF)' },
  { id: 'custom', name: 'Avaliação Personalizada' },
];


export function AssessmentCreator({ onSave, existingAssessment, onCancel }: AssessmentCreatorProps) {
  const [formData, setFormData] = useState<Partial<Assessment>>(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (existingAssessment) {
      setFormData({
        id: existingAssessment.id, // Keep ID for updates
        title: existingAssessment.title,
        patientId: existingAssessment.patientId,
        status: existingAssessment.status,
        formLink: existingAssessment.formLink, // Preserve existing link
      });
    } else {
      setFormData(initialFormState);
    }
  }, [existingAssessment]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = useCallback((name: keyof Assessment, value: string) => {
    setFormData(prev => {
      const newState = { ...prev, [name]: value };
      if (name === 'title' && value !== 'custom') {
        const template = mockAssessmentTemplates.find(t => t.id === value);
        if (template) {
          newState.title = template.name;
        }
      }
      return newState;
    });
  }, []);

  const generateLinkForAssessment = useCallback((assessmentData: Partial<Assessment>): string => {
    if (!assessmentData.title || !assessmentData.id) return "#"; // Should have ID by now
    return `/take-assessment?assessmentId=${assessmentData.id}&title=${encodeURIComponent(assessmentData.title)}`;
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId || !formData.title) {
      toast({ title: "Campos Obrigatórios", description: "Paciente e Título da Avaliação são obrigatórios.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    
    const assessmentId = formData.id || `assess${Date.now()}`;
    const dataToSave: Partial<Assessment> = {
      ...formData,
      id: assessmentId, // Ensure ID is set for new assessments
      formLink: formData.formLink || generateLinkForAssessment({ ...formData, id: assessmentId }), // Generate link if not present
      status: formData.status || 'pending',
    };

    await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API call
    onSave(dataToSave);
    setIsLoading(false);
    
    // Do not reset form if editing, onSave will handle tab switch
    if (!existingAssessment) {
      setFormData(initialFormState); // Reset only for new assessment creation AFTER save
    }
  };

  // This function is just illustrative for a "send" action, actual sending needs backend.
  const handleSendLink = async () => {
    if (!formData.formLink || !formData.patientId) {
       toast({ title: "Link ou Paciente Ausente", description: "Gere um link ou salve a avaliação primeiro e selecione um paciente.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setFormData(prev => ({ ...prev, status: 'sent' }));
    // Call onSave to update the status in the parent component
    onSave({ ...formData, status: 'sent' }); 
    toast({ title: "Link Enviado (Simulado)", description: `Link da avaliação para ${mockPatients.find(p => p.id === formData.patientId)?.name} foi 'enviado'.`, className: "bg-primary text-primary-foreground" });
  };


  const currentFormLink = formData.formLink || (formData.title && formData.id ? generateLinkForAssessment(formData) : null);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="assessmentTemplate">Modelo de Avaliação</Label>
        <Select 
          onValueChange={(value) => handleSelectChange('title' as keyof Assessment, value)} 
          value={mockAssessmentTemplates.find(t => t.name === formData.title)?.id || (formData.title ? 'custom' : '')}
        >
          <SelectTrigger id="assessmentTemplate"><SelectValue placeholder="Escolha um modelo ou defina um título" /></SelectTrigger>
          <SelectContent>
            {mockAssessmentTemplates.map(template => (
              <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      { (formData.title && !mockAssessmentTemplates.some(t => t.name === formData.title && t.id !== 'custom')) || (mockAssessmentTemplates.find(t=>t.name === formData.title)?.id === 'custom') || (existingAssessment && !mockAssessmentTemplates.some(t=>t.name === existingAssessment.title)) ? (
        <div>
          <Label htmlFor="title">Título da Avaliação Personalizada</Label>
          <Input id="title" name="title" value={formData.title || ''} onChange={handleChange} placeholder="Ex: Questionário de Ansiedade Infantil" required />
        </div>
      ) : null }


      <div>
        <Label htmlFor="patientId">Paciente</Label>
        <Select value={formData.patientId || ''} onValueChange={(value) => handleSelectChange('patientId' as keyof Assessment, value)} required>
          <SelectTrigger id="patientId"><SelectValue placeholder="Selecione o paciente" /></SelectTrigger>
          <SelectContent>
            {mockPatients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Instruções (Opcional)</Label>
        <Textarea id="description" name="description" placeholder="Instruções para o paciente ao preencher a avaliação..." rows={3} />
      </div>
      
      {currentFormLink && currentFormLink !== "#" && (
        <div className="space-y-2 p-3 border rounded-md bg-muted/50">
          <Label>Link de Preenchimento:</Label>
          <div className="flex items-center gap-2">
            <Input type="text" value={currentFormLink} readOnly className="bg-background"/>
            <Button type="button" variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(window.location.origin + currentFormLink)}>Copiar Link</Button>
            <Button asChild variant="secondary" size="sm">
              <Link href={currentFormLink} target="_blank">Abrir Link <ExternalLink className="ml-2 h-3 w-3" /></Link>
            </Button>
          </div>
           <p className="text-xs text-muted-foreground">Salve a avaliação para gerar ou atualizar o link. O link será "enviado" ao paciente (simulado).</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4">
        {onCancel && (
           <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
             Cancelar
           </Button>
        )}
        {/* Removed generate link button as link is generated/updated on save or shown if existing */}
        {currentFormLink && formData.status !== 'completed' && (
            <Button type="button" onClick={handleSendLink} disabled={isLoading || formData.status === 'sent' || !formData.patientId}>
              <Send className="mr-2 h-4 w-4" /> {formData.status === 'sent' ? "Link Já Enviado" : "Enviar Link ao Paciente"}
            </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          {existingAssessment ? "Salvar Alterações" : "Salvar e Gerar Link"}
        </Button>
      </div>
    </form>
  );
}

// Add ExternalLink icon for the "Abrir Link" button for clarity
const ExternalLink = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" x2="21" y1="14" y2="3" />
  </svg>
);

    
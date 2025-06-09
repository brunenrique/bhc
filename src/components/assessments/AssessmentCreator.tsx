"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Assessment } from "@/types";
import { useState, useEffect } from "react";
import { Loader2, Link, Send, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AssessmentCreatorProps {
  onSave: (data: Partial<Assessment>) => void;
  existingAssessment?: Assessment | null;
  onCancel?: () => void; // For edit mode
}

const initialFormState: Partial<Assessment> = {
  title: "",
  patientId: "",
  // formLink: "", // Generated on save/send
  status: "pending",
};

// Mock data for selects
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
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (existingAssessment) {
      setFormData({
        title: existingAssessment.title,
        patientId: existingAssessment.patientId,
        status: existingAssessment.status,
      });
      setGeneratedLink(existingAssessment.formLink || null);
    } else {
      setFormData(initialFormState);
      setGeneratedLink(null);
    }
  }, [existingAssessment]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: keyof Assessment, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
     if (name === 'title' && value !== 'custom') { // Auto-fill title from template if not custom
      const template = mockAssessmentTemplates.find(t => t.id === value);
      if (template) {
        setFormData(prev => ({ ...prev, title: template.name }));
      }
    }
  };

  const handleGenerateLink = () => {
    if (!formData.patientId || !formData.title) {
      toast({ title: "Erro", description: "Selecione um paciente e um título para a avaliação.", variant: "destructive" });
      return;
    }
    const link = `https://psiguard.app/assessment/${formData.patientId}/${Date.now()}`; // Mock link
    setGeneratedLink(link);
    setFormData(prev => ({ ...prev, formLink: link, status: 'pending' })); // Status becomes pending once link is generated
    toast({ title: "Link Gerado!", description: "Link da avaliação gerado com sucesso.", className: "bg-green-500 text-white" });
  };

  const handleSendLink = async () => {
    if (!generatedLink || !formData.patientId) {
       toast({ title: "Erro", description: "Gere um link primeiro e selecione um paciente.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    // Simulate API call to send link
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setFormData(prev => ({ ...prev, status: 'sent' }));
    onSave({ ...formData, formLink: generatedLink, status: 'sent' });
    toast({ title: "Avaliação Enviada!", description: `Link enviado para ${mockPatients.find(p => p.id === formData.patientId)?.name}.`, className: "bg-primary text-primary-foreground" });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId || !formData.title) {
      toast({ title: "Erro", description: "Paciente e Título são obrigatórios.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSave(formData); // Save current state (could be 'pending' or 'sent' if link was generated/sent)
    setIsLoading(false);
    if (!existingAssessment) { // Reset form only if it's a new assessment creation
      setFormData(initialFormState);
      setGeneratedLink(null);
    }
    toast({ title: "Avaliação Salva!", description: "Dados da avaliação salvos com sucesso." });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="assessmentTemplate">Modelo de Avaliação</Label>
        <Select onValueChange={(value) => handleSelectChange('title', value)} 
          // If title is custom, this won't match a template ID, so it will show placeholder
          value={mockAssessmentTemplates.find(t => t.name === formData.title)?.id || 'custom'}
        >
          <SelectTrigger id="assessmentTemplate"><SelectValue placeholder="Escolha um modelo ou crie um título personalizado" /></SelectTrigger>
          <SelectContent>
            {mockAssessmentTemplates.map(template => (
              <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      { (formData.title && !mockAssessmentTemplates.some(t => t.name === formData.title && t.id !== 'custom')) || (mockAssessmentTemplates.find(t=>t.name === formData.title)?.id === 'custom') || (existingAssessment && !mockAssessmentTemplates.some(t=>t.name === existingAssessment.title))? (
        <div>
          <Label htmlFor="title">Título da Avaliação Personalizada</Label>
          <Input id="title" name="title" value={formData.title || ''} onChange={handleChange} placeholder="Ex: Questionário de Ansiedade Infantil" required />
        </div>
      ) : null }


      <div>
        <Label htmlFor="patientId">Paciente</Label>
        <Select value={formData.patientId || ''} onValueChange={(value) => handleSelectChange('patientId', value)}>
          <SelectTrigger id="patientId"><SelectValue placeholder="Selecione o paciente" /></SelectTrigger>
          <SelectContent>
            {mockPatients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Optional: Description or instructions for the assessment */}
      <div>
        <Label htmlFor="description">Instruções (Opcional)</Label>
        <Textarea id="description" name="description" placeholder="Instruções para o paciente ao preencher a avaliação..." rows={3} />
      </div>
      
      {generatedLink && (
        <div className="space-y-2 p-3 border rounded-md bg-muted/50">
          <Label>Link Gerado:</Label>
          <div className="flex items-center gap-2">
            <Input type="text" value={generatedLink} readOnly className="bg-background"/>
            <Button type="button" variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(generatedLink)}>Copiar</Button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4">
        {existingAssessment && onCancel && (
           <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
             Cancelar Edição
           </Button>
        )}
        <Button type="button" variant="outline" onClick={handleGenerateLink} disabled={isLoading || !!generatedLink}>
          <Link className="mr-2 h-4 w-4" /> {generatedLink ? "Link Já Gerado" : "Gerar Link Tokenizado"}
        </Button>
        <Button type="button" onClick={handleSendLink} disabled={isLoading || !generatedLink || formData.status === 'sent'}>
          <Send className="mr-2 h-4 w-4" /> {formData.status === 'sent' ? "Link Enviado" : "Enviar Link"}
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {existingAssessment ? "Salvar Alterações" : "Salvar Avaliação"}
        </Button>
      </div>
    </form>
  );
}

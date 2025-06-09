
"use client";
import { AssessmentCreator } from "@/components/assessments/AssessmentCreator";
import { AssessmentResultsTable } from "@/components/assessments/AssessmentResultsTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Assessment } from "@/types";
import {ClipboardEdit, ListChecks} from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const mockAssessments: Assessment[] = [
  { id: 'assess1', title: 'Escala Beck de Ansiedade', patientId: 'p1', patientName: 'Ana Silva', status: 'completed', formLink: 'mock-link-123', results: { score: 25, level: 'Moderado', summary: 'Paciente reportou sintomas consistentes com ansiedade moderada, incluindo preocupação excessiva e tensão física.' }, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString() },
  { id: 'assess2', title: 'Inventário de Depressão de Beck (BDI)', patientId: 'p2', patientName: 'Bruno Costa', status: 'sent', formLink: 'mock-link-456', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() },
  { id: 'assess3', title: 'Questionário de Qualidade de Vida (WHOQOL-BREF)', patientId: 'p1', patientName: 'Ana Silva', status: 'pending', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
];


export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>(mockAssessments);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [activeTab, setActiveTab] = useState("results");
  const { toast } = useToast();

  useEffect(() => {
    const keysToRemove: string[] = [];
    const updatedAssessments = assessments.map(assessment => {
      const completedKey = `assessment_completed_${assessment.id}`;
      const storedResults = localStorage.getItem(completedKey);
      if (storedResults) {
        try {
          const results = JSON.parse(storedResults);
          keysToRemove.push(completedKey);
          toast({
            title: "Avaliação Concluída",
            description: `A avaliação "${assessment.title}" para ${assessment.patientName} foi marcada como concluída.`,
          });
          return { ...assessment, status: 'completed', results } as Assessment;
        } catch (e) {
          console.error("Failed to parse results from localStorage", e);
          // Optionally remove corrupted data
          // localStorage.removeItem(completedKey); 
        }
      }
      return assessment;
    });

    if (keysToRemove.length > 0) {
      setAssessments(updatedAssessments);
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount to check for any pending completions

  const handleCreateOrUpdateAssessment = useCallback((data: Partial<Assessment>) => {
    const patientNameMap: Record<string, string> = {
      p1: 'Ana Silva',
      p2: 'Bruno Costa',
      p3: 'Carla Dias',
    };

    if(editingAssessment) {
      setAssessments(prev => prev.map(a => a.id === editingAssessment.id ? {
        ...a, 
        ...data, 
        patientName: data.patientId ? patientNameMap[data.patientId] || 'Paciente Desconhecido' : a.patientName
      } as Assessment : a));
      toast({ title: "Avaliação Atualizada", description: "Os detalhes da avaliação foram atualizados." });
    } else {
      const newAssessmentId = `assess${Date.now()}`;
      const newAssessment: Assessment = {
        id: newAssessmentId,
        title: data.title || 'Nova Avaliação',
        patientId: data.patientId || '',
        patientName: data.patientId ? patientNameMap[data.patientId] || 'Paciente Desconhecido' : 'Paciente Desconhecido',
        status: 'pending',
        createdAt: new Date().toISOString(),
        formLink: `/take-assessment?assessmentId=${newAssessmentId}&title=${encodeURIComponent(data.title || 'Nova Avaliação')}`,
        ...data,
      };
      setAssessments(prev => [newAssessment, ...prev]);
      toast({ title: "Avaliação Criada", description: "Uma nova avaliação foi criada e está pendente." });
    }
    setEditingAssessment(null);
    setActiveTab("results"); // Switch to results tab after save
  }, [editingAssessment, toast]);

  const handleEditAssessment = useCallback((assessment: Assessment) => {
    setEditingAssessment(assessment);
    setActiveTab("create"); // Switch to create/edit tab
  }, []);
  
  const handleDeleteAssessment = useCallback((assessmentId: string) => {
    setAssessments(prev => prev.filter(a => a.id !== assessmentId));
    toast({ title: "Avaliação Excluída", description: "A avaliação foi removida.", variant: "destructive" });
  }, [toast]);

  const handleCancelEdit = useCallback(() => {
    setEditingAssessment(null);
    setActiveTab("results"); // Switch to results tab on cancel
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">Avaliações</h1>
      <p className="text-muted-foreground font-body">
        Crie, envie e gerencie avaliações psicológicas para seus pacientes.
      </p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="results" className="font-headline"><ListChecks className="mr-2 h-4 w-4"/>Resultados</TabsTrigger>
          <TabsTrigger value="create" className="font-headline"><ClipboardEdit className="mr-2 h-4 w-4"/>Criar/Editar Avaliação</TabsTrigger>
        </TabsList>
        
        <TabsContent value="results">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline">Avaliações Enviadas e Resultados</CardTitle>
              <CardDescription>Visualize o status e os resultados das avaliações dos pacientes.</CardDescription>
            </CardHeader>
            <CardContent>
              <AssessmentResultsTable 
                assessments={assessments} 
                onEdit={handleEditAssessment} 
                onDelete={handleDeleteAssessment}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="create">
           <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline">{editingAssessment ? "Editar Avaliação" : "Criar Nova Avaliação"}</CardTitle>
              <CardDescription>
                {editingAssessment ? "Modifique os detalhes da avaliação selecionada." : "Preencha os campos para criar e enviar uma nova avaliação."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AssessmentCreator 
                onSave={handleCreateOrUpdateAssessment} 
                existingAssessment={editingAssessment}
                onCancel={handleCancelEdit}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    
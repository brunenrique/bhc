"use client";
import { AssessmentCreator } from "@/components/assessments/AssessmentCreator";
import { AssessmentResultsTable } from "@/components/assessments/AssessmentResultsTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Assessment } from "@/types";
import {ClipboardEdit, ListChecks} from "lucide-react";
import { useState, useCallback } from "react";

const mockAssessments: Assessment[] = [
  { id: 'assess1', title: 'Escala Beck de Ansiedade', patientId: 'p1', patientName: 'Ana Silva', status: 'completed', formLink: 'mock-link-123', results: { score: 25, level: 'Moderado' }, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString() },
  { id: 'assess2', title: 'Inventário de Depressão de Beck (BDI)', patientId: 'p2', patientName: 'Bruno Costa', status: 'sent', formLink: 'mock-link-456', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() },
  { id: 'assess3', title: 'Questionário de Qualidade de Vida (WHOQOL-BREF)', patientId: 'p1', patientName: 'Ana Silva', status: 'pending', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
];


export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>(mockAssessments);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);

  const handleCreateOrUpdateAssessment = useCallback((data: Partial<Assessment>) => {
    if(editingAssessment) {
      setAssessments(prev => prev.map(a => a.id === editingAssessment.id ? {...a, ...data, patientName: data.patientId === 'p1' ? 'Ana Silva' : 'Bruno Costa'} as Assessment : a));
      console.log("Updating assessment:", data);
    } else {
      const newAssessment: Assessment = {
        id: `assess${Date.now()}`,
        title: data.title || 'Nova Avaliação',
        patientId: data.patientId || '',
        patientName: data.patientId === 'p1' ? 'Ana Silva' : data.patientId === 'p2' ? 'Bruno Costa' : 'Outro Paciente', 
        status: 'pending',
        createdAt: new Date().toISOString(),
        ...data,
      };
      setAssessments(prev => [newAssessment, ...prev]);
      console.log("Creating assessment:", newAssessment);
    }
    setEditingAssessment(null);
  }, [editingAssessment]);

  const handleEditAssessment = useCallback((assessment: Assessment) => {
    setEditingAssessment(assessment);
  }, []);
  
  const handleDeleteAssessment = useCallback((assessmentId: string) => {
    setAssessments(prev => prev.filter(a => a.id !== assessmentId));
    console.log("Deleting assessment:", assessmentId);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingAssessment(null);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">Avaliações</h1>
      <p className="text-muted-foreground font-body">
        Crie, envie e gerencie avaliações psicológicas para seus pacientes.
      </p>
      
      <Tabs defaultValue="results" className="space-y-4">
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


"use client";
import { AssessmentCreator } from "@/features/assessments/components/AssessmentCreator";
import { AssessmentResultsTable } from "@/features/assessments/components/AssessmentResultsTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Assessment, AssessmentResultDetails } from "@/types";
import {ClipboardEdit, ListChecks, Loader2} from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { cacheService } from "@/services/cacheService";
import { subDays, addDays } from 'date-fns'; // Import addDays

// Helper to create dates
const createDateISOString = (offsetDays: number, isPast: boolean = true): string => {
  const date = isPast ? subDays(new Date(), offsetDays) : addDays(new Date(), offsetDays);
  return date.toISOString();
};


export const mockAssessmentsData: Assessment[] = [
  { 
    id: 'assess_beck_ana_1', 
    title: 'Escala Beck de Ansiedade', 
    patientId: '1', 
    patientName: 'Ana Beatriz Silva', 
    status: 'completed', 
    formLink: 'mock-link-123', 
    results: { score: 25, level: 'Moderado', summary: 'Sintomas de ansiedade moderada, preocupação excessiva. Respondido via simulação.', answeredAt: createDateISOString(21), detailedAnswers: [{question: "Como se sente sobre o futuro?", answer:"Preocupada"}] }, 
    createdAt: createDateISOString(22)
  },
  { 
    id: 'assess_beck_ana_2', 
    title: 'Escala Beck de Ansiedade', 
    patientId: '1', 
    patientName: 'Ana Beatriz Silva', 
    status: 'completed', 
    formLink: 'mock-link-123b', 
    results: { score: 18, level: 'Leve', summary: 'Melhora na ansiedade, sono ainda irregular. Respondido via simulação.', answeredAt: createDateISOString(7), detailedAnswers: [{question: "Como se sente sobre o futuro?", answer:"Um pouco melhor"}] }, 
    createdAt: createDateISOString(8) 
  },
  { 
    id: 'assess_bdi_bruno_1', 
    title: 'Inventário de Depressão de Beck (BDI)', 
    patientId: '2', 
    patientName: 'Bruno Almeida Costa', 
    status: 'sent', 
    formLink: 'mock-link-456', 
    createdAt: createDateISOString(5) 
  },
   { 
    id: 'assess_bdi_ana_1', 
    title: 'Inventário de Depressão de Beck (BDI)', 
    patientId: '1', 
    patientName: 'Ana Beatriz Silva', 
    status: 'completed', 
    formLink: 'mock-link-bdi-p1', 
    results: { score: 12, level: 'Mínimo', summary: 'Sintomas depressivos mínimos. Respondido via simulação.', answeredAt: createDateISOString(14) , detailedAnswers: [{question: "Como está seu apetite?", answer:"Normal"}]}, 
    createdAt: createDateISOString(15) 
  },
  { 
    id: 'assess_whoqol_ana_1', 
    title: 'Questionário de Qualidade de Vida (WHOQOL-BREF)', 
    patientId: '1', 
    patientName: 'Ana Beatriz Silva', 
    status: 'pending', 
    formLink: 'mock-link-whoqol-p1',
    createdAt: createDateISOString(2) 
  },
  {
    id: 'assess_stai_carla_1',
    title: 'Inventário de Ansiedade Traço-Estado (STAI)',
    patientId: '3',
    patientName: 'Carla Dias Oliveira',
    status: 'sent',
    formLink: 'mock-link-stai-p3',
    createdAt: createDateISOString(3)
  },
  {
    id: 'assess_pcl5_bruno_1',
    title: 'Lista de Verificação de Sintomas de TEPT (PCL-5)',
    patientId: '2',
    patientName: 'Bruno Almeida Costa',
    status: 'completed',
    formLink: 'mock-link-pcl5-p2',
    results: { score: 45, level: 'Elevado', summary: 'Indicadores significativos de TEPT. Respondido via simulação.', answeredAt: createDateISOString(10), detailedAnswers: [{question: "Reviveu o evento?", answer:"Frequentemente"}] },
    createdAt: createDateISOString(11)
  },
  {
    id: 'assess_custom_carla_1',
    title: 'Questionário de Hábitos de Sono',
    patientId: '3',
    patientName: 'Carla Dias Oliveira',
    status: 'pending',
    formLink: 'mock-link-custom-p3',
    createdAt: createDateISOString(1)
  },
  // Novos dados de exemplo
  { 
    id: 'assess_burnout_daniel_1', 
    title: 'Inventário de Burnout de Maslach (MBI)', 
    patientId: '4', 
    patientName: 'Daniel Farias Lima', 
    status: 'sent', 
    formLink: 'mock-link-mbi-p4', 
    createdAt: createDateISOString(4) 
  },
  { 
    id: 'assess_adhd_eduarda_1', 
    title: 'Escala de Autoavaliação de TDAH (ASRS-18)', 
    patientId: '5', 
    patientName: 'Eduarda Gomes Ferreira', 
    status: 'completed', 
    formLink: 'mock-link-asrs-p5', 
    results: { score: 35, level: 'Sugestivo de TDAH', summary: 'Sintomas consistentes com TDAH, principalmente desatenção. Respondido via simulação.', answeredAt: createDateISOString(6), detailedAnswers: [{question: "Dificuldade em organizar tarefas?", answer:"Frequentemente"}] }, 
    createdAt: createDateISOString(7) 
  },
  { 
    id: 'assess_social_felipe_1', 
    title: 'Inventário de Fobia Social (SPIN)', 
    patientId: '6', 
    patientName: 'Felipe Nogueira Moreira', 
    status: 'pending', 
    formLink: 'mock-link-spin-p6',
    createdAt: createDateISOString(0) 
  },
  { 
    id: 'assess_resilience_gabriela_1', 
    title: 'Escala de Resiliência Connor-Davidson (CD-RISC)', 
    patientId: '7', 
    patientName: 'Gabriela Martins Azevedo', 
    status: 'completed', 
    formLink: 'mock-link-cdrisc-p7', 
    results: { score: 75, level: 'Resiliência Moderada', summary: 'Capacidade de enfrentamento em nível moderado. Respondido via simulação.', answeredAt: createDateISOString(9), detailedAnswers: [{question: "Lida bem com mudanças?", answer:"Às vezes"}] }, 
    createdAt: createDateISOString(10) 
  },
  { 
    id: 'assess_stress_hugo_1', 
    title: 'Escala de Estresse Percebido (PSS)', 
    patientId: '8', 
    patientName: 'Hugo Pereira da Silva', 
    status: 'sent', 
    formLink: 'mock-link-pss-p8',
    createdAt: createDateISOString(3) 
  },
  { 
    id: 'assess_selfesteem_isabela_1', 
    title: 'Escala de Autoestima de Rosenberg', 
    patientId: '9', 
    patientName: 'Isabela Santos Rocha', 
    status: 'pending', 
    formLink: 'mock-link-rosenberg-p9',
    createdAt: createDateISOString(1) 
  }
];


export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [activeTab, setActiveTab] = useState("results");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const patientNameMap: Record<string, string> = {
    '1': 'Ana Beatriz Silva',
    '2': 'Bruno Almeida Costa',
    '3': 'Carla Dias Oliveira',
    '4': 'Daniel Farias Lima',
    '5': 'Eduarda Gomes Ferreira',
    '6': 'Felipe Nogueira Moreira',
    '7': 'Gabriela Martins Azevedo',
    '8': 'Hugo Pereira da Silva',
    '9': 'Isabela Santos Rocha',
    '10': 'Lucas Mendes Oliveira',
  };

  useEffect(() => {
    let isMounted = true;
    const loadAssessments = async () => {
      setIsLoading(true);
      try {
        const cachedData = await cacheService.assessments.getList();
        if (isMounted && cachedData && cachedData.length > 0) {
          setAssessments(cachedData);
        } else if (isMounted) {
          setAssessments(mockAssessmentsData); 
          try {
            await cacheService.assessments.setList(mockAssessmentsData);
          } catch (error) {
            // console.warn("Error saving initial assessments to cache:", error);
          }
        }
      } catch (error) {
        // console.warn("Error loading assessments from cache:", error);
        if (isMounted) {
          setAssessments(mockAssessmentsData); 
        }
      }
      
      if (isMounted) {
        const keysToRemove: string[] = [];
        const currentAssessments = assessments.length > 0 ? assessments : mockAssessmentsData;
        
        const updatedAssessmentsFromStorage = currentAssessments.map(assessment => {
          const completedKey = `assessment_completed_${assessment.id}`;
          if (typeof window !== 'undefined') {
              const storedResults = localStorage.getItem(completedKey);
              if (storedResults) {
              try {
                  const results = JSON.parse(storedResults) as AssessmentResultDetails;
                  keysToRemove.push(completedKey);
                  if (isMounted) { 
                      toast({
                          title: "Avaliação Concluída",
                          description: `A avaliação "${assessment.title}" para ${assessment.patientName} foi marcada como concluída.`,
                      });
                  }
                  return { ...assessment, status: 'completed', results } as Assessment;
              } catch (e) {
                  // console.error("Failed to parse results from localStorage", e);
              }
              }
          }
          return assessment;
        });

        if (keysToRemove.length > 0) {
            setAssessments(updatedAssessmentsFromStorage);
            await cacheService.assessments.setList(updatedAssessmentsFromStorage); 
            if (typeof window !== 'undefined') {
                keysToRemove.forEach(key => localStorage.removeItem(key));
            }
        }
        setIsLoading(false);
      }
    };
    
    loadAssessments();
    return () => { isMounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleCreateOrUpdateAssessment = useCallback(async (data: Partial<Assessment>) => {
    let updatedAssessments;

    if(editingAssessment) {
      updatedAssessments = assessments.map(a => a.id === editingAssessment.id ? {
        ...a, 
        ...data, 
        patientName: data.patientId ? patientNameMap[data.patientId] || 'Paciente Desconhecido' : a.patientName
      } as Assessment : a);
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
      updatedAssessments = [newAssessment, ...assessments];
      toast({ title: "Avaliação Criada", description: "Uma nova avaliação foi criada e está pendente." });
    }
    setAssessments(updatedAssessments);
    await cacheService.assessments.setList(updatedAssessments);
    setEditingAssessment(null);
    setActiveTab("results"); 
  }, [editingAssessment, toast, assessments, patientNameMap]);

  const handleEditAssessment = useCallback((assessment: Assessment) => {
    setEditingAssessment(assessment);
    setActiveTab("create"); 
  }, []);
  
  const handleDeleteAssessment = useCallback(async (assessmentId: string) => {
    const updatedAssessments = assessments.filter(a => a.id !== assessmentId);
    setAssessments(updatedAssessments);
    await cacheService.assessments.setList(updatedAssessments);
    toast({ title: "Avaliação Excluída", description: "A avaliação foi removida.", variant: "destructive" });
  }, [toast, assessments]);

  const handleCancelEdit = useCallback(() => {
    setEditingAssessment(null);
    setActiveTab("results"); 
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
              {isLoading && assessments.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
               ) : (
                <AssessmentResultsTable 
                  assessments={assessments} 
                  onEdit={handleEditAssessment} 
                  onDelete={handleDeleteAssessment}
                />
              )}
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

    

"use client";

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState, useCallback, useRef, ChangeEvent, useMemo } from 'react';
import type { Patient, Session, PatientNoteVersion, ProntuarioData, DocumentSignatureStatus, DocumentSignatureDetails, Assessment, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/shared/RichTextEditor'; 
import { ArrowLeft, Edit, Mail, Phone, CalendarDays, FileText as FileTextIconLucide, PlusCircle, Repeat, Eye, EyeOff, Lock, History, Info, BookMarked, Fingerprint, ShieldCheck, ShieldX, ShieldAlert, SendToBack, UploadCloud, ListChecks, BarChart3, FileSignature, CalendarCheck2, CalendarX2, UserCheck, UserX, AlertTriangle, CaseSensitive, Bot, FileText as FileTextIcon } from 'lucide-react';
import { PatientFormDialog } from '@/features/patients/components/PatientFormDialog';
import { SessionFormDialog } from '@/features/scheduling/components/SessionFormDialog';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { format, parseISO, addDays, addWeeks, addMonths, isFuture, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter as UIDialogFooter } from "@/components/ui/dialog"; // Renamed DialogFooter to avoid conflict
import { cacheService } from '@/services/cacheService';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { PatientTherapeuticPlan } from '@/features/patients/components/PatientTherapeuticPlan';
import { PatientAssessmentsSection } from '@/features/patients/components/PatientAssessmentsSection';
import { PatientEvolutionChart } from '@/features/patients/components/PatientEvolutionChart';
import { mockAssessmentsData as allMockAssessments } from '@/app/(app)/assessments/page'; 
import { GenerateProntuarioDialog } from '@/features/patients/components/GenerateProntuarioDialog';
import { useAuth } from '@/hooks/useAuth';


const mockProntuarioAna: ProntuarioData = {
  identificacao: {
    nomeCompleto: 'Ana Beatriz Silva',
    sexo: 'Feminino',
    cpf: '123.456.789-00',
    dataNascimento: '1990-05-15',
    estadoCivil: 'Solteira',
    racaCor: 'Branca',
    possuiFilhos: true,
    quantosFilhos: 1,
    situacaoProfissional: 'Empregada',
    profissao: 'Designer Gráfica',
    escolaridade: 'Superior Completo',
    renda: 'R$ 5.000,00',
    enderecoCasa: 'Rua das Palmeiras, 45, Apto 101, Centro, Cidade Alegre - CA',
    telefone: '(11) 98765-4321',
    contatoEmergencia: 'Maria Silva (Mãe) - (11) 98888-7777',
    tipoMoradia: 'Apartamento',
  },
  entradaUnidade: {
    descricaoEntrada: 'Busca espontânea após recomendação de uma amiga. Relatou sentir-se ansiosa e com dificuldades para lidar com o estresse no trabalho.',
  },
  localAssinatura: 'Santana de Parnaíba', 
};

const mockProntuarioBruno: ProntuarioData = {
  identificacao: {
    nomeCompleto: 'Bruno Almeida Costa',
    cpf: '987.654.321-11',
    dataNascimento: '1985-11-20',
    sexo: 'Masculino',
    estadoCivil: 'Casado',
    racaCor: 'Parda',
    possuiFilhos: false,
    situacaoProfissional: 'Autônomo',
    profissao: 'Engenheiro de Software',
    escolaridade: 'Mestrado Completo',
    renda: 'R$ 8.500,00',
    enderecoCasa: 'Av. Principal, 789, Bairro Novo, Capital Estadual - ES',
    telefone: '(21) 91234-5678',
    contatoEmergencia: 'Juliana Costa (Esposa) - (21) 91234-0000',
    tipoMoradia: 'Casa',
  },
  entradaUnidade: {
    descricaoEntrada: 'Encaminhado pelo clínico geral devido a sintomas de estresse pós-traumático.',
  },
  localAssinatura: 'Santana de Parnaíba',
};


const fetchPatientDetailsMock = async (id: string): Promise<Patient | null> => {
  await new Promise(resolve => setTimeout(resolve, 300)); 
  const baseDate = new Date();
  const mockPatientBase = {
    id,
    email: id === '1' ? 'ana.silva@example.com' : id === '2' ? 'bruno.costa@example.com' : 'paciente.detalhe@example.com',
    phone: id === '1' ? '(11) 98765-4321' : id === '2' ? '(21) 91234-5678' : '(XX) XXXXX-XXXX',
    dateOfBirth: id === '1' ? '1990-05-15' : id === '2' ? '1985-11-20' : '1995-01-01',
    address: id === '1' ? 'Rua das Palmeiras, 45, Apto 101, Centro, Cidade Alegre - CA' : id === '2' ? 'Av. Principal, 789, Bairro Novo, Capital Estadual - ES' : 'Rua Fictícia, 123, Bairro Imaginário, Cidade Exemplo - UF',
    createdAt: subDays(baseDate, 30).toISOString(), 
    updatedAt: new Date().toISOString(),
  };
  
  let specificData: Partial<Patient> = {};
  if (id === '1') { // Ana Silva
    specificData = {
      name: 'Ana Beatriz Silva',
      sessionNotes: `<p>Sessão de <strong>${format(subDays(baseDate,1), "dd/MM")}</strong>: Paciente demonstrou melhora significativa na gestão de pensamentos automáticos.</p><p>Praticou as técnicas de respiração e relatou diminuição da insônia.</p><p><em>Próxima sessão focará em estratégias de manutenção e prevenção de recaídas.</em></p>`,
      previousSessionNotes: [
        { content: `<p>Sessão de ${format(subDays(baseDate,8), "dd/MM")}: Foco em reestruturação cognitiva de pensamentos automáticos negativos. Paciente identificou três padrões principais.</p><p>Recomendações: Continuar o diário de pensamentos, praticar técnicas de respiração diafragmática duas vezes ao dia.</p>`, timestamp: subDays(baseDate, 8).toISOString() },
        { content: `<p>Sessão de ${format(subDays(baseDate,15), "dd/MM")}: Paciente apresenta quadro de ansiedade generalizada, com picos de estresse relacionados ao trabalho.</p><p>Demonstra boa adesão às técnicas propostas em sessões anteriores.</p>`, timestamp: subDays(baseDate, 15).toISOString() },
        { content: `<p>Sessão de ${format(subDays(baseDate,22), "dd/MM")}: Anamnese e estabelecimento de contrato terapêutico. Queixa principal: ansiedade e insônia.</p>`, timestamp: subDays(baseDate, 22).toISOString() }
      ],
      prontuario: mockProntuarioAna,
      therapeuticPlan: {
        id: 'tp1_ana',
        patientId: '1',
        overallSummary: 'Foco em redução de sintomas ansiosos e melhoria da gestão do estresse laboral e qualidade do sono.',
        goals: [
          { id: 'g1_ana', description: 'Identificar e questionar 3 pensamentos automáticos negativos por dia.', status: 'active', createdAt: subDays(baseDate, 20).toISOString(), targetDate: addDays(baseDate, 30).toISOString() },
          { id: 'g2_ana', description: 'Praticar técnica de respiração diafragmática por 5 minutos diariamente.', status: 'active', createdAt: subDays(baseDate, 14).toISOString() },
          { id: 'g3_ana', description: 'Reduzir episódios de insônia para menos de 2 por semana.', status: 'achieved', createdAt: subDays(baseDate, 30).toISOString(), achievedAt: subDays(baseDate, 5).toISOString(), notes: 'Conseguido após 3 semanas de técnicas de higiene do sono e relaxamento.' },
          { id: 'g4_ana', description: 'Desenvolver e aplicar uma estratégia de comunicação assertiva no trabalho.', status: 'on_hold', createdAt: subDays(baseDate, 7).toISOString(), notes: 'Pausado para focar em reestruturação cognitiva primeiro.'},
        ],
        lastUpdatedAt: subDays(baseDate, 2).toISOString(),
      },
      caseStudyNotes: `<h1>Estudo de Caso - Ana Beatriz Silva</h1><p>Paciente apresenta histórico de <strong>ansiedade desde a adolescência</strong>, exacerbado por pressões no ambiente de trabalho atual. Responde bem à psicoeducação e técnicas cognitivas, mas demonstra dificuldade em manter a prática de relaxamento de forma consistente.</p><h2>Desafios:</h2><ul><li>Baixa tolerância à frustração.</li><li>Dificuldade em delegar tarefas no trabalho.</li></ul><h2>Hipóteses diagnósticas (a confirmar):</h2><ul><li>Transtorno de Ansiedade Generalizada.</li><li>Possíveis traços de personalidade anancástica.</li></ul><h2>Próximos passos:</h2><ol><li>Introduzir técnicas de mindfulness.</li><li>Explorar crenças centrais sobre autoexigência e perfeccionismo.</li><li>Trabalhar habilidades de comunicação assertiva e estabelecimento de limites.</li></ol>`
    };
  } else if (id === '2') { // Bruno Costa
    specificData = {
      name: 'Bruno Almeida Costa',
      sessionNotes: `<p>Sessão de ${format(subDays(baseDate,3), "dd/MM")}: Paciente relata dificuldades em manter a rotina de exercícios físicos, que é parte do plano de manejo do TEPT.</p><p>Exploramos barreiras e ajustamos o plano. Apresentou bom insight sobre procrastinação e evitação.</p>`,
      previousSessionNotes: [
        { content: `<p>Sessão de ${format(subDays(baseDate,10), "dd/MM")}: Trabalhando na exposição gradual a lembranças do evento traumático. Paciente demonstrou ansiedade, mas conseguiu permanecer na tarefa com apoio.</p>`, timestamp: subDays(baseDate, 10).toISOString()},
        { content: `<p>Sessão de ${format(subDays(baseDate,17), "dd/MM")}: Foco em psicoeducação sobre TEPT e técnicas de regulação emocional.</p>`, timestamp: subDays(baseDate, 17).toISOString()},
      ],
      prontuario: mockProntuarioBruno,
      therapeuticPlan: {
        id: 'tp2_bruno',
        patientId: '2',
        overallSummary: 'Tratamento para TEPT, com foco em redução de sintomas de revivescência, hipervigilância e evitação.',
        goals: [
          { id: 'g1_bruno', description: 'Reduzir a frequência de flashbacks para menos de 1 por dia.', status: 'active', createdAt: subDays(baseDate, 28).toISOString(), targetDate: addDays(baseDate, 15).toISOString() },
          { id: 'g2_bruno', description: 'Conseguir visitar o local do acidente (ou similar) sem crise de pânico.', status: 'active', createdAt: subDays(baseDate, 14).toISOString(), targetDate: addDays(baseDate, 45).toISOString(), notes: 'Exposição gradual planejada.' },
          { id: 'g3_bruno', description: 'Melhorar a qualidade do sono (pelo menos 6 horas contínuas).', status: 'on_hold', createdAt: subDays(baseDate, 21).toISOString(), notes: 'Aguardando melhora dos pesadelos.'},
        ],
        lastUpdatedAt: subDays(baseDate, 3).toISOString(),
      },
      caseStudyNotes: `<h1>Estudo de Caso - Bruno Almeida Costa</h1><p>Paciente com diagnóstico de <strong>TEPT</strong> após acidente de trânsito há 8 meses. Apresenta sintomas clássicos de revivescência (flashbacks, pesadelos), evitação fóbica e hipervigilância.</p><p>Boa rede de apoio familiar, mas com dificuldades de engajamento em atividades sociais que antes eram prazerosas.</p><h2>Tratamento atual:</h2><p>Focado em <em>Terapia de Exposição Prolongada</em> e <em>Reestruturação Cognitiva</em>. Observa-se melhora na capacidade de falar sobre o trauma, mas ainda com considerável sofrimento emocional durante as exposições.</p><h2>Questões a explorar:</h2><ul><li>Comorbidade com depressão leve a moderada.</li><li>Impacto dos sintomas no relacionamento conjugal.</li></ul><p>Considerar encaminhamento para avaliação psiquiátrica se os sintomas de hipervigilância e insônia não melhorarem com as intervenções atuais.</p>`
    };
  } else { 
     specificData = {
      name: `Paciente Exemplo ${id}`,
      sessionNotes: `<p>Sessão de ${format(subDays(baseDate,5), "dd/MM")}: Nenhuma anotação detalhada para este paciente mock.</p>`,
      prontuario: {...mockProntuarioAna, identificacao: {...mockProntuarioAna.identificacao, nomeCompleto: `Paciente Exemplo ${id}`}}, 
      caseStudyNotes: "<p>Nenhuma nota de estudo de caso para este paciente exemplo.</p>",
    };
  }

  if (id === 'notfound') return null;
  return { ...mockPatientBase, ...specificData } as Patient;
};

const fetchPatientSessionsMock = async (patientId: string): Promise<Session[]> => {
  await new Promise(resolve => setTimeout(resolve, 200)); 
  let baseDate = new Date();
  const sessionsList: Session[] = [];

  if (patientId === '1') { // Ana Silva
    sessionsList.push(
      { id: 's1_ana', patientId, psychologistId: 'psy1', psychologistName: "Dr. Exemplo Silva", startTime: subDays(baseDate, 1).toISOString(), endTime: new Date(subDays(baseDate, 1).getTime() + 60*60*1000).toISOString(), status: 'completed', recurring: 'weekly', notes: 'Discussão sobre pensamentos automáticos.'},
      { id: 's2_ana', patientId, psychologistId: 'psy1', psychologistName: "Dr. Exemplo Silva", startTime: addDays(baseDate, 6).toISOString(), endTime: new Date(addDays(baseDate, 6).getTime() + 60*60*1000).toISOString(), status: 'scheduled', recurring: 'weekly', notes: 'Manutenção e prevenção de recaídas.'},
      { id: 's3_ana', patientId, psychologistId: 'psy1', psychologistName: "Dr. Exemplo Silva", startTime: subDays(baseDate, 8).toISOString(), endTime: new Date(subDays(baseDate, 8).getTime() + 60*60*1000).toISOString(), status: 'completed'},
      { id: 's4_ana', patientId, psychologistId: 'psy1', psychologistName: "Dr. Exemplo Silva", startTime: subDays(baseDate, 15).toISOString(), endTime: new Date(subDays(baseDate, 15).getTime() + 60*60*1000).toISOString(), status: 'completed'},
      { id: 's5_ana', patientId, psychologistId: 'psy1', psychologistName: "Dr. Exemplo Silva", startTime: subDays(baseDate, 22).toISOString(), endTime: new Date(subDays(baseDate, 22).getTime() + 60*60*1000).toISOString(), status: 'completed'},
      { id: 's6_ana_past_noshow', patientId, psychologistId: 'psy1', psychologistName: "Dr. Exemplo Silva", startTime: subDays(baseDate, 29).toISOString(), endTime: new Date(subDays(baseDate, 29).getTime() + 60*60*1000).toISOString(), status: 'no-show'},
      { id: 's7_ana_past_cancelled', patientId, psychologistId: 'psy1', psychologistName: "Dr. Exemplo Silva", startTime: subDays(baseDate, 36).toISOString(), endTime: new Date(subDays(baseDate, 36).getTime() + 60*60*1000).toISOString(), status: 'cancelled'}
    );
  } else if (patientId === '2') { // Bruno Costa
     sessionsList.push(
      { id: 's1_bruno', patientId, psychologistId: 'psy2', psychologistName: "Dra. Modelo Souza", startTime: subDays(baseDate, 3).toISOString(), endTime: new Date(subDays(baseDate, 3).getTime() + 60*60*1000).toISOString(), status: 'completed', notes: 'Discussão sobre barreiras para exercícios.'},
      { id: 's2_bruno', patientId, psychologistId: 'psy2', psychologistName: "Dra. Modelo Souza", startTime: addDays(baseDate, 4).toISOString(), endTime: new Date(addDays(baseDate, 4).getTime() + 60*60*1000).toISOString(), status: 'scheduled', notes: 'Próxima etapa da exposição narrativa.'},
      { id: 's3_bruno', patientId, psychologistId: 'psy2', psychologistName: "Dra. Modelo Souza", startTime: subDays(baseDate, 10).toISOString(), endTime: new Date(subDays(baseDate, 10).getTime() + 60*60*1000).toISOString(), status: 'completed'},
      { id: 's4_bruno', patientId, psychologistId: 'psy2', psychologistName: "Dra. Modelo Souza", startTime: subDays(baseDate, 17).toISOString(), endTime: new Date(subDays(baseDate, 17).getTime() + 60*60*1000).toISOString(), status: 'completed'},
      { id: 's5_bruno_past_noshow', patientId, psychologistId: 'psy2', psychologistName: "Dra. Modelo Souza", startTime: subDays(baseDate, 24).toISOString(), endTime: new Date(subDays(baseDate, 24).getTime() + 60*60*1000).toISOString(), status: 'no-show'}
    );
  } else { 
    sessionsList.push(
      { id: `s1_gen_${patientId}`, patientId, psychologistId: 'psy1', psychologistName: "Dr. Exemplo Silva", startTime: addDays(baseDate, 2).toISOString(), endTime: new Date(addDays(baseDate, 2).getTime() + 60*60*1000).toISOString(), status: 'scheduled', notes: 'Sessão de acompanhamento.'},
      { id: `s2_gen_${patientId}`, patientId, psychologistId: 'psy1', psychologistName: "Dr. Exemplo Silva", startTime: subDays(baseDate, 5).toISOString(), endTime: new Date(subDays(baseDate, 5).getTime() + 60*60*1000).toISOString(), status: 'completed'}
    );
  }
  
  return sessionsList.sort((a,b) => parseISO(b.startTime).getTime() - parseISO(a.startTime).getTime());
}

const recurrenceLabels: Record<string, string> = {
  daily: "Diária",
  weekly: "Semanal",
  monthly: "Mensal",
  none: "Não se repete"
};

// Prontuário Display Component (Exibe apenas dados estáticos)
const ProntuarioDisplay: React.FC<{ 
  prontuarioData: ProntuarioData | undefined;
  onOpenGenerateDialog: () => void;
}> = ({ prontuarioData, onOpenGenerateDialog }) => {
  const { identificacao, entradaUnidade } = prontuarioData || {};

  return (
    <div className="space-y-4">
       <Button onClick={onOpenGenerateDialog} variant="default" className="w-full sm:w-auto">
        <FileTextIcon className="mr-2 h-4 w-4" /> Gerar Documento de Prontuário (Google Docs)
      </Button>
      <Separator />
    <ScrollArea className="h-[450px] w-full rounded-md border p-4 bg-muted/20 shadow-inner space-y-6">
      {!prontuarioData || !identificacao ? (
         <p className="text-muted-foreground p-4 text-center">Nenhum dado de identificação do prontuário disponível. Use "Gerar Documento" para criar um novo com os dados da sessão.</p>
      ) : (
        <>
          {identificacao && (
            <section>
              <h4 className="text-lg font-semibold font-headline mb-2 border-b pb-1">Identificação (Dados Base)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <p><strong>Nome Completo:</strong> {identificacao.nomeCompleto}</p>
                <p><strong>Sexo:</strong> {identificacao.sexo}</p>
                <p><strong>CPF:</strong> {identificacao.cpf}</p>
                <p><strong>Data de Nasc.:</strong> {identificacao.dataNascimento ? format(parseISO(identificacao.dataNascimento), "dd/MM/yyyy", { locale: ptBR }) : 'N/A'}</p>
                <p><strong>Estado Civil:</strong> {identificacao.estadoCivil}</p>
                <p><strong>Raça/Cor:</strong> {identificacao.racaCor}</p>
                <p><strong>Possui filhos:</strong> {identificacao.possuiFilhos ? `Sim, ${identificacao.quantosFilhos || 0}` : 'Não'}</p>
                <p><strong>Situação profissional:</strong> {identificacao.situacaoProfissional}</p>
                <p><strong>Profissão:</strong> {identificacao.profissao}</p>
                <p><strong>Escolaridade:</strong> {identificacao.escolaridade}</p>
                <p><strong>Renda:</strong> {identificacao.renda}</p>
                <p className="md:col-span-2"><strong>Endereço:</strong> {identificacao.enderecoCasa}</p>
                <p><strong>Tipo de Moradia:</strong> {identificacao.tipoMoradia}</p>
                <p><strong>Telefone:</strong> {identificacao.telefone}</p>
                <p><strong>Contato emergência:</strong> {identificacao.contatoEmergencia}</p>
              </div>
            </section>
          )}

          {entradaUnidade && ( <section><h4 className="text-lg font-semibold font-headline mb-2 border-b pb-1">Entrada na Unidade</h4><p className="text-sm whitespace-pre-wrap">{entradaUnidade.descricaoEntrada}</p></section> )}
          
          <section className="text-xs text-muted-foreground italic pt-4 border-t mt-4">
            <p>Obs: Os campos dinâmicos como "Descrição da Demanda/Queixa", "Procedimento/Análise" e "Conclusão/Encaminhamento" são preenchidos no momento da geração do documento de prontuário via Google Docs.</p>
            <p>As "Anotações de Evolução" do paciente serão usadas para o campo "Procedimento/Análise".</p>
          </section>
        </>
      )}
    </ScrollArea>
    </div>
  );
};


export default function PatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [patientAssessments, setPatientAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPatientFormOpen, setIsPatientFormOpen] = useState(false);
  const [isSessionFormOpen, setIsSessionFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [areNotesVisible, setAreNotesVisible] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'evolution' | 'prontuario' | 'case_study' | 'pti' | 'scales' | 'analysis'>('evolution');
  const [isGenerateProntuarioDialogOpen, setIsGenerateProntuarioDialogOpen] = useState(false);


  useEffect(() => {
    let isMounted = true;
    if (patientId) {
      const loadPatientData = async () => {
        setIsLoading(true);
        
        let fetchedPatientData: Patient | null = null;
        let fetchedSessionsData: Session[] = [];
        let fetchedAssessmentsData: Assessment[] = [];

        try {
          const cachedPatient = await cacheService.patients.getDetail(patientId);
          if (isMounted && cachedPatient) setPatient(cachedPatient);

          const cachedSessions = await cacheService.patients.getSessions(patientId);
          if (isMounted && cachedSessions) setSessions(cachedSessions.sort((a,b) => parseISO(b.startTime).getTime() - parseISO(a.startTime).getTime()));
          
          const cachedAllAssessments = await cacheService.assessments.getList();
          if(isMounted && cachedAllAssessments) {
            setPatientAssessments(cachedAllAssessments.filter(asm => asm.patientId === patientId && asm.status === 'completed'));
          } else if (isMounted) { 
             setPatientAssessments(allMockAssessments.filter(asm => asm.patientId === patientId && asm.status === 'completed'));
          }

        } catch (error) {
          // console.warn(`Error loading patient data for ${patientId} from cache:`, error);
        }

        fetchedPatientData = await fetchPatientDetailsMock(patientId);
        fetchedSessionsData = await fetchPatientSessionsMock(patientId);
        fetchedAssessmentsData = allMockAssessments.filter(asm => asm.patientId === patientId && asm.status === 'completed');


        if (isMounted) {
          if (fetchedPatientData) {
            setPatient(fetchedPatientData);
            await cacheService.patients.setDetail(patientId, fetchedPatientData);
          }
          setSessions(fetchedSessionsData.sort((a,b) => parseISO(b.startTime).getTime() - parseISO(a.startTime).getTime()));
          await cacheService.patients.setSessions(patientId, fetchedSessionsData);
          
          setPatientAssessments(fetchedAssessmentsData);
          setIsLoading(false);
        }
      };
      loadPatientData();
    }
    return () => { isMounted = false; };
  }, [patientId]);


  const handleEditSession = useCallback((session: Session) => {
    setEditingSession(session);
    setIsSessionFormOpen(true);
  }, []);
  
  const handleNewSession = useCallback(() => {
    setEditingSession(null); 
    setIsSessionFormOpen(true);
  }, []);

  const handleSavePatient = useCallback(async (updatedData: Partial<Patient>) => {
    if (!patient) return;

    const currentNotes = patient.sessionNotes || "";
    const newNotes = updatedData.sessionNotes;
    let previousNotes = patient.previousSessionNotes || [];

    if (newNotes !== undefined && newNotes !== currentNotes && (typeof currentNotes === 'string' && currentNotes.trim() !== "" && currentNotes.trim() !== "<p></p>")) {
      const newVersion: PatientNoteVersion = {
        content: currentNotes, 
        timestamp: patient.updatedAt || new Date().toISOString(),
      };
      previousNotes = [newVersion, ...previousNotes].slice(0, 5); 
    }

    const updatedPatient = { 
      ...patient, 
      ...updatedData, 
      previousSessionNotes: previousNotes,
      updatedAt: new Date().toISOString() 
    };
    
    setPatient(updatedPatient);
    await cacheService.patients.setDetail(patient.id, updatedPatient); 
    setIsPatientFormOpen(false);
    toast({ title: "Dados do Paciente Salvos", description: "As informações do paciente foram atualizadas." });
  }, [patient, toast]);

  const handleSaveSession = useCallback(async (sessionData: Partial<Session>) => {
    const psychologistNameMap: Record<string, string> = {
      psy1: 'Dr. Exemplo Silva',
      psy2: 'Dra. Modelo Souza',
    };
    const patientNameMap: Record<string, string> = { // Add patient name map based on mock patients
        '1': 'Ana Beatriz Silva',
        '2': 'Bruno Almeida Costa',
        '3': 'Carla Dias Oliveira',
        // Add other mock patient IDs and names if they are used in scheduling
    };

    let updatedSessionsList;

    if (editingSession && sessionData.id) {
      updatedSessionsList = sessions.map(s => (s.id === sessionData.id ? { 
          ...s, 
          ...sessionData,
          patientName: sessionData.patientId ? patientNameMap[sessionData.patientId] || s.patientName : s.patientName,
          psychologistName: sessionData.psychologistId ? psychologistNameMap[sessionData.psychologistId] || s.psychologistName : s.psychologistName,
         } as Session : s));
    } else {
      const mainNewSession = { 
        ...sessionData, 
        id: `s-${Date.now()}`, 
        patientId: patientId, // Should be patientId for new session context
        patientName: patientData.patientId ? patientNameMap[patientData.patientId] || patient?.name : patient?.name, // Use patientData.patientId
        psychologistName: sessionData.psychologistId ? psychologistNameMap[sessionData.psychologistId] || 'Psicólogo Desconhecido' : 'Psicólogo Desconhecido',
      } as Session;

      const sessionsToAdd = [mainNewSession];

      if (mainNewSession.recurring && mainNewSession.recurring !== 'none' && mainNewSession.startTime) {
        const baseStartTime = parseISO(mainNewSession.startTime);
        const baseEndTime = mainNewSession.endTime ? parseISO(mainNewSession.endTime) : new Date(baseStartTime.getTime() + 60 * 60 * 1000);
        const duration = baseEndTime.getTime() - baseStartTime.getTime();
        let occurrencesToCreate = mainNewSession.recurring === 'daily' ? 6 : 4;

        for (let i = 1; i <= occurrencesToCreate; i++) {
          let nextStartTime: Date;
          if (mainNewSession.recurring === 'daily') nextStartTime = addDays(baseStartTime, i);
          else if (mainNewSession.recurring === 'weekly') nextStartTime = addWeeks(baseStartTime, i);
          else if (mainNewSession.recurring === 'monthly') nextStartTime = addMonths(baseStartTime, i);
          else break; 
          
          sessionsToAdd.push({
            ...mainNewSession,
            id: `s-${Date.now()}-recur-${i}`,
            startTime: nextStartTime.toISOString(),
            endTime: new Date(nextStartTime.getTime() + duration).toISOString(),
            status: 'scheduled',
            notes: mainNewSession.notes ? `${mainNewSession.notes} (Recorrência ${i})` : `Sessão recorrente ${i}`,
            recurring: 'none', 
          });
        }
      }
      updatedSessionsList = [...sessions, ...sessionsToAdd];
    }
    
    const sortedSessions = updatedSessionsList.sort((a, b) => parseISO(b.startTime).getTime() - parseISO(a.startTime).getTime());
    setSessions(sortedSessions);
    await cacheService.patients.setSessions(patientId, sortedSessions); 

    setIsSessionFormOpen(false);
    setEditingSession(null);
  }, [patientId, editingSession, patient?.name, sessions]);

  const sessionStats = useMemo(() => {
    const nextScheduled = sessions
      .filter(s => s.status === 'scheduled' && isFuture(parseISO(s.startTime)))
      .sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime())[0];
    
    const completedCount = sessions.filter(s => s.status === 'completed').length;
    const noShowCount = sessions.filter(s => s.status === 'no-show').length;
    const cancelledCount = sessions.filter(s => s.status === 'cancelled').length;

    return { nextScheduled, completedCount, noShowCount, cancelledCount };
  }, [sessions]);


  if (isLoading && !patient) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32 mb-4" /> 
        <Card className="shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 md:flex md:items-center md:gap-6">
            <Skeleton className="h-32 w-32 rounded-full mx-auto md:mx-0" />
            <div className="mt-4 md:mt-0 text-center md:text-left space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-40" />
            </div>
          </div>
          <CardContent className="p-6 space-y-6">
            <Skeleton className="h-8 w-full mb-2" /> 
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-40 w-full" />
            <Separator />
            <Skeleton className="h-6 w-1/2 mb-2" />
            <Skeleton className="h-64 w-full" /> 
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-9 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold mb-4">Paciente não encontrado</h2>
        <Button onClick={() => router.push('/patients')}>Voltar para lista de pacientes</Button>
      </div>
    );
  }

  const completedPatientAssessments = patientAssessments.filter(asm => asm.status === 'completed' && typeof asm.results?.score === 'number');


  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
      </Button>

      <Card className="shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 md:flex md:items-center md:gap-6">
          <Image 
            src={`https://placehold.co/128x128.png?text=${patient.name.charAt(0)}`} 
            alt={patient.name} 
            width={128} 
            height={128} 
            className="rounded-full border-4 border-background shadow-lg mx-auto md:mx-0"
            data-ai-hint="person avatar"
          />
          <div className="mt-4 md:mt-0 text-center md:text-left">
            <CardTitle className="text-3xl font-headline">{patient.name}</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              {patient.email && <span className="flex items-center justify-center md:justify-start mt-1"><Mail className="w-4 h-4 mr-2" /> {patient.email}</span>}
              {patient.phone && <span className="flex items-center justify-center md:justify-start mt-1"><Phone className="w-4 h-4 mr-2" /> {patient.phone}</span>}
              {patient.dateOfBirth && <span className="flex items-center justify-center md:justify-start mt-1"><CalendarDays className="w-4 h-4 mr-2" /> {format(parseISO(patient.dateOfBirth), "dd/MM/yyyy", { locale: ptBR })}</span>}
            </CardDescription>
          </div>
          <Button variant="outline" size="icon" className="absolute top-4 right-4 md:static md:ml-auto" onClick={() => setIsPatientFormOpen(true)}>
            <Edit className="h-5 w-5" /> <span className="sr-only">Editar Paciente</span>
          </Button>
        </div>

        <CardContent className="p-6 space-y-6">
          <div>
            <h3 className="text-xl font-headline font-semibold mb-2">Endereço</h3>
            <p className="text-muted-foreground">{patient.address || "Não informado"}</p>
          </div>
          <Separator />
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <TabsList className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-1 w-full md:w-auto">
                <TabsTrigger value="evolution" className="font-headline text-xs px-2 py-1.5 h-auto whitespace-nowrap"><FileTextIconLucide className="w-3.5 h-3.5 mr-1.5"/>Evolução Sessões</TabsTrigger>
                <TabsTrigger value="prontuario" className="font-headline text-xs px-2 py-1.5 h-auto whitespace-nowrap"><BookMarked className="w-3.5 h-3.5 mr-1.5"/>Prontuário</TabsTrigger>
                <TabsTrigger value="case_study" className="font-headline text-xs px-2 py-1.5 h-auto whitespace-nowrap"><CaseSensitive className="w-3.5 h-3.5 mr-1.5"/>Estudo de Caso</TabsTrigger>
                <TabsTrigger value="pti" className="font-headline text-xs px-2 py-1.5 h-auto whitespace-nowrap"><ListChecks className="w-3.5 h-3.5 mr-1.5"/>PTI</TabsTrigger>
                <TabsTrigger value="scales" className="font-headline text-xs px-2 py-1.5 h-auto whitespace-nowrap"><FileSignature className="w-3.5 h-3.5 mr-1.5"/>Escalas</TabsTrigger>
                <TabsTrigger value="analysis" className="font-headline text-xs px-2 py-1.5 h-auto whitespace-nowrap"><BarChart3 className="w-3.5 h-3.5 mr-1.5"/>Análise Gráfica</TabsTrigger>
              </TabsList>
              <div className="flex gap-2 ml-auto">
                { (activeTab === 'evolution' || activeTab === 'prontuario' || activeTab === 'pti' || activeTab === 'case_study') && patient.previousSessionNotes && patient.previousSessionNotes.length > 0 && activeTab === 'evolution' && (
                    <Button variant="outline" size="sm" onClick={() => setIsHistoryDialogOpen(true)} disabled={!areNotesVisible}>
                        <History className="w-4 h-4 mr-2" /> Histórico
                    </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setAreNotesVisible(!areNotesVisible)}>
                    {areNotesVisible ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    {areNotesVisible ? "Ocultar Confidencial" : "Ver Confidencial"}
                </Button>
              </div>
            </div>

            {!areNotesVisible && (activeTab === 'evolution' || activeTab === 'prontuario' || activeTab === 'case_study' || activeTab === 'pti' || activeTab === 'scales' || activeTab === 'analysis') ? (
              <Alert variant="default" className="bg-muted/40 border-primary/30 mt-2">
                <Lock className="h-5 w-5 text-primary/80" />
                <AlertTitle className="font-headline text-primary/90">Conteúdo Confidencial</AlertTitle>
                <AlertDescription className="text-muted-foreground">
                    Os detalhes clínicos são confidenciais. Clique em "Ver Confidencial" para exibir.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <TabsContent value="evolution">
                  <h3 className="text-lg font-semibold font-headline mb-2">Evolução das Sessões</h3>
                   <RichTextEditor
                      initialContent={patient.sessionNotes || "<p></p>"}
                      onUpdate={(content) => {
                        // This onUpdate is primarily for when the editor is directly editable.
                        // Here, it's read-only, but if it were editable, you'd update patient state.
                      }}
                      editable={false} // Display only
                      editorClassName="h-auto max-h-[600px] overflow-y-auto bg-transparent p-0 rounded-none shadow-none border-none"
                      pageClassName="min-h-[200px] shadow-none border" // Less prominent page style for read-only
                  />
                </TabsContent>
                <TabsContent value="prontuario">
                   <h3 className="text-lg font-semibold font-headline mb-2">Prontuário Psicológico (Dados Base)</h3>
                   <ProntuarioDisplay 
                      prontuarioData={patient.prontuario} 
                      onOpenGenerateDialog={() => setIsGenerateProntuarioDialogOpen(true)}
                    />
                </TabsContent>
                 <TabsContent value="case_study">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-headline flex items-center"><CaseSensitive className="mr-2 h-5 w-5 text-primary" />Notas do Estudo de Caso</CardTitle>
                        <CardDescription>Anotações livres e aprofundadas sobre o caso. Edite através do botão "Editar Paciente" no topo.</CardDescription>
                      </CardHeader>
                      <CardContent>
                         <RichTextEditor
                            initialContent={patient.caseStudyNotes || "<p></p>"}
                            onUpdate={() => {}} // Read-only, no update needed here
                            editable={false}
                            editorClassName="h-auto max-h-[400px] overflow-y-auto bg-transparent p-0 rounded-none shadow-none border-none"
                            pageClassName="min-h-[200px] shadow-none border"
                          />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-headline flex items-center"><Bot className="mr-2 h-5 w-5 text-accent" />Assistente IA para Estudo de Caso</CardTitle>
                         <CardDescription>Interaja com a IA para insights sobre este estudo de caso.</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col items-center justify-center h-60 text-center bg-muted/20 rounded-md border p-4">
                        <Bot className="h-12 w-12 text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground">
                          Funcionalidade de chat com assistente IA para análise do estudo de caso será implementada futuramente.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          (Ex: Obter sugestões, discutir hipóteses, etc.)
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="pti">
                    <PatientTherapeuticPlan plan={patient.therapeuticPlan} />
                </TabsContent>
                <TabsContent value="scales">
                    <PatientAssessmentsSection patientName={patient.name} assessments={patientAssessments} />
                </TabsContent>
                <TabsContent value="analysis">
                     <PatientEvolutionChart patientName={patient.name} completedAssessments={completedPatientAssessments} />
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-xl font-headline">Histórico e Resumo de Sessões</CardTitle>
            <Button onClick={handleNewSession} size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Nova Sessão
            </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 border rounded-lg bg-muted/30">
            <h4 className="text-md font-semibold font-headline mb-2">Resumo Rápido</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div className="p-2.5 border rounded-md bg-background shadow-sm">
                <div className="flex items-center text-primary mb-1">
                  <CalendarCheck2 className="w-4 h-4 mr-1.5" />
                  <span className="font-medium">Próxima Agendada</span>
                </div>
                {sessionStats.nextScheduled ? (
                  <>
                    <p>{format(parseISO(sessionStats.nextScheduled.startTime), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}</p>
                    <p className="text-xs text-muted-foreground">Com: {sessionStats.nextScheduled.psychologistName}</p>
                  </>
                ) : (
                  <p className="text-muted-foreground text-xs">Nenhuma sessão futura.</p>
                )}
              </div>
              <div className="p-2.5 border rounded-md bg-background shadow-sm">
                 <div className="flex items-center text-green-600 mb-1">
                  <UserCheck className="w-4 h-4 mr-1.5" />
                  <span className="font-medium">Realizadas</span>
                </div>
                <p className="text-2xl font-bold">{sessionStats.completedCount}</p>
              </div>
              <div className="p-2.5 border rounded-md bg-background shadow-sm">
                <div className="flex items-center text-red-600 mb-1">
                  <UserX className="w-4 h-4 mr-1.5" />
                  <span className="font-medium">Faltas</span>
                </div>
                <p className="text-2xl font-bold">{sessionStats.noShowCount}</p>
              </div>
              <div className="p-2.5 border rounded-md bg-background shadow-sm">
                <div className="flex items-center text-amber-600 mb-1">
                  <CalendarX2 className="w-4 h-4 mr-1.5" />
                  <span className="font-medium">Canceladas</span>
                </div>
                <p className="text-2xl font-bold">{sessionStats.cancelledCount}</p>
              </div>
            </div>
          </div>
          <Separator className="my-4"/>
          <h4 className="text-md font-semibold font-headline mb-2">Todas as Sessões</h4>
          {sessions.length > 0 ? (
              <ScrollArea className="h-60 pr-3"> 
                  <ul className="space-y-3">
                      {sessions.map(s => (
                          <li key={s.id} className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                              <div className="flex justify-between items-start">
                                  <div>
                                      <p className="font-semibold text-sm">Data: {format(parseISO(s.startTime), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                                      <p className="text-xs text-muted-foreground">Com: {s.psychologistName || 'Psicólogo não informado'}</p>
                                      {s.recurring && s.recurring !== "none" && (
                                        <p className="text-xs text-muted-foreground flex items-center mt-0.5">
                                          <Repeat className="w-3 h-3 mr-1 text-blue-500" /> Recorrência: {recurrenceLabels[s.recurring] || s.recurring}
                                        </p>
                                      )}
                                      <Badge 
                                        variant={s.status === 'completed' ? 'secondary' : s.status === 'scheduled' ? 'default' : s.status === 'cancelled' ? 'outline' : 'destructive'} 
                                        className="mt-1 text-xs capitalize"
                                      >
                                          {s.status === 'completed' ? <UserCheck className="w-3 h-3 mr-1"/> : s.status === 'scheduled' ? <CalendarCheck2 className="w-3 h-3 mr-1"/> : s.status === 'cancelled' ? <CalendarX2 className="w-3 h-3 mr-1"/> : <AlertTriangle className="w-3 h-3 mr-1"/>}
                                          {s.status === 'completed' ? 'Realizada' : s.status === 'scheduled' ? 'Agendada' : s.status === 'cancelled' ? 'Cancelada' : 'Faltou'}
                                      </Badge>
                                      {s.notes && <p className="text-xs text-muted-foreground mt-1 italic">Nota: {s.notes.substring(0,50)}...</p>}
                                  </div>
                                  <Button variant="ghost" size="sm" onClick={() => handleEditSession(s)}>
                                      <Edit className="w-4 h-4 mr-1" /> Editar
                                  </Button>
                              </div>
                          </li>
                      ))}
                  </ul>
              </ScrollArea>
          ) : (
                isLoading ? <Skeleton className="h-20 w-full" /> : <p className="text-muted-foreground">Nenhuma sessão registrada para este paciente.</p>
          )}
        </CardContent>
      </Card>

      <PatientFormDialog 
        isOpen={isPatientFormOpen} 
        onOpenChange={setIsPatientFormOpen}
        patient={patient}
        onSave={handleSavePatient}
      />
      
      <SessionFormDialog
        isOpen={isSessionFormOpen}
        onOpenChange={setIsSessionFormOpen}
        session={editingSession}
        onSave={handleSaveSession}
        // Pass patient data to SessionFormDialog if needed for new sessions
        patientData={{ id: patient.id, name: patient.name }}
      />

       <Dialog open={isHistoryDialogOpen && areNotesVisible && activeTab === 'evolution'} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="font-headline">Histórico de Evolução das Sessões</DialogTitle>
            <DialogDescription>
              Versões anteriores das anotações para {patient.name}. A mais recente está no topo.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-3">
            {patient.previousSessionNotes && patient.previousSessionNotes.length > 0 ? (
              <ul className="space-y-4">
                {patient.previousSessionNotes.map((noteVersion) => (
                  <li key={noteVersion.timestamp} className="border rounded-md p-3 bg-muted/20">
                    <p className="text-xs text-muted-foreground mb-1">
                      Salvo em: {format(parseISO(noteVersion.timestamp), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
                    </p>
                    <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: noteVersion.content }} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6">
                <Info className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Nenhum histórico de versões anteriores encontrado.</p>
              </div>
            )}
          </ScrollArea>
          <UIDialogFooter>
            <Button variant="outline" onClick={() => setIsHistoryDialogOpen(false)}>Fechar</Button>
          </UIDialogFooter>
        </DialogContent>
      </Dialog>

      {patient && currentUser && (
        <GenerateProntuarioDialog
          isOpen={isGenerateProntuarioDialogOpen && areNotesVisible && activeTab === 'prontuario'}
          onOpenChange={setIsGenerateProntuarioDialogOpen}
          patient={patient}
          currentUser={currentUser}
          currentSessionNotesContent={patient.sessionNotes || "<p></p>"}
        />
      )}
    </div>
  );
}

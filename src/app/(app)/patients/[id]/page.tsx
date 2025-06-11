
"use client";

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState, useCallback, ChangeEvent, useMemo } from 'react';
import type { Patient, Session, PatientNoteVersion, ProntuarioData, DocumentSignatureStatus, DocumentSignatureDetails, Assessment, User, ProcedimentoAnaliseEntry } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/shared/RichTextEditor'; 
import { ArrowLeft, Edit, Mail, Phone, CalendarDays, FileText as FileTextIconLucide, PlusCircle, Repeat, Eye, EyeOff, Lock, History, Info, BookMarked, Fingerprint, ShieldCheck, ShieldX, ShieldAlert, UploadCloud, ListChecks, BarChart3, FileSignature, CalendarCheck2, CalendarX2, UserCheck, UserX, AlertTriangle, CaseSensitive, Bot, FileText as FileTextIcon, DownloadCloud, Edit3, ShieldQuestion, Paperclip } from 'lucide-react';
import { PatientFormDialog } from '@/features/patients/components/PatientFormDialog';
import { SessionFormDialog } from '@/features/scheduling/components/SessionFormDialog';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { format, parseISO, addDays, addWeeks, addMonths, isFuture, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter as UIDialogFooter } from "@/components/ui/dialog"; 
import { cacheService } from '@/services/cacheService';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { PatientTherapeuticPlan } from '@/features/patients/components/PatientTherapeuticPlan';
import { PatientAssessmentsSection } from '@/features/patients/components/PatientAssessmentsSection';
import { PatientEvolutionChart } from '@/features/patients/components/PatientEvolutionChart';
import { PatientAttachmentManager } from '@/features/patients/components/PatientAttachmentManager'; // Import the new component
import { mockAssessmentsData as allMockAssessments } from '@/app/(app)/assessments/page'; 
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { hasPermission } from '@/lib/permissions'; 

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
  demandaQueixaPrincipal: "Ansiedade generalizada, dificuldades de sono e estresse relacionado ao trabalho.",
  procedimentosAnalise: [
      { entryId: 'proc1_ana', date: subDays(new Date(), 22).toISOString(), content: "<p>Anamnese inicial, estabelecimento de contrato terapêutico. Queixa principal verbalizada: ansiedade e insônia.</p>" },
      { entryId: 'proc2_ana', date: subDays(new Date(), 15).toISOString(), content: "<p>Exploração dos gatilhos de ansiedade. Paciente relata melhora na adesão às técnicas de respiração propostas.</p>" },
      { entryId: 'proc3_ana', date: subDays(new Date(), 8).toISOString(), content: "<p>Foco em reestruturação cognitiva de pensamentos automáticos negativos. Paciente identificou três padrões principais. Recomendações: Continuar o diário de pensamentos.</p>" },
  ],
  conclusaoEncaminhamentoGeral: "Acompanhamento semanal com foco em TCC para ansiedade. Considerar avaliação psiquiátrica se sintomas de insônia persistirem.",
  localAssinatura: 'Santana de Parnaíba', 
  signatureStatus: 'none',
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
  demandaQueixaPrincipal: "Sintomas de TEPT após acidente de trânsito, incluindo flashbacks e pesadelos.",
  procedimentosAnalise: [
      { entryId: 'proc1_bruno', date: subDays(new Date(), 17).toISOString(), content: "<p>Psicoeducação sobre TEPT e introdução a técnicas de regulação emocional.</p>" },
      { entryId: 'proc2_bruno', date: subDays(new Date(), 10).toISOString(), content: "<p>Início da exposição gradual a lembranças do evento traumático. Paciente demonstrou ansiedade, mas conseguiu permanecer na tarefa com apoio.</p>" },
  ],
  conclusaoEncaminhamentoGeral: "Plano terapêutico focado em Terapia de Exposição Prolongada para TEPT. Monitorar sintomas depressivos.",
  localAssinatura: 'Santana de Parnaíba',
  signatureStatus: 'pending_govbr_signature',
  signatureDetails: { hash: 'mockhash_prontuario_bruno' }
};

const fetchPatientDetailsMock = async (id: string): Promise<Patient | null> => {
  await new Promise(resolve => setTimeout(resolve, 300)); 
  const baseDate = new Date();
  const mockPsychologistId = 'mock-user-psychologist-1234'; 

  const mockPatientBase = {
    id,
    email: id === '1' ? 'ana.silva@example.com' : id === '2' ? 'bruno.costa@example.com' : 'paciente.detalhe@example.com',
    phone: id === '1' ? '(11) 98765-4321' : id === '2' ? '(21) 91234-5678' : '(XX) XXXXX-XXXX',
    dateOfBirth: id === '1' ? '1990-05-15' : id === '2' ? '1985-11-20' : '1995-01-01',
    address: id === '1' ? 'Rua das Palmeiras, 45, Apto 101, Centro, Cidade Alegre - CA' : id === '2' ? 'Av. Principal, 789, Bairro Novo, Capital Estadual - ES' : 'Rua Fictícia, 123, Bairro Imaginário, Cidade Exemplo - UF',
    createdAt: subDays(baseDate, 30).toISOString(), 
    updatedAt: new Date().toISOString(),
    assignedTo: id === '1' ? mockPsychologistId : 'other-psy-uid', 
  };
  
  let specificData: Partial<Patient> = {};
  if (id === '1') { 
    specificData = {
      name: 'Ana Beatriz Silva',
      sessionNotes: `<p>Sessão de <strong>${format(subDays(baseDate,1), "dd/MM/yy")}</strong>: Paciente demonstrou melhora significativa na gestão de pensamentos automáticos.</p><p>Praticou as técnicas de respiração e relatou diminuição da insônia.</p><p><em>Próxima sessão focará em estratégias de manutenção e prevenção de recaídas.</em></p>`,
      previousSessionNotes: [
        { content: `<p>Sessão de ${format(subDays(baseDate,8), "dd/MM/yy")}: Foco em reestruturação cognitiva de pensamentos automáticos negativos. Paciente identificou três padrões principais.</p><p>Recomendações: Continuar o diário de pensamentos, praticar técnicas de respiração diafragmática duas vezes ao dia.</p>`, timestamp: subDays(baseDate, 8).toISOString() },
        { content: `<p>Sessão de ${format(subDays(baseDate,15), "dd/MM/yy")}: Paciente apresenta quadro de ansiedade generalizada, com picos de estresse relacionados ao trabalho.</p><p>Demonstra boa adesão às técnicas propostas em sessões anteriores.</p>`, timestamp: subDays(baseDate, 15).toISOString() },
        { content: `<p>Sessão de ${format(subDays(baseDate,22), "dd/MM/yy")}: Anamnese e estabelecimento de contrato terapêutico. Queixa principal: ansiedade e insônia.</p>`, timestamp: subDays(baseDate, 22).toISOString() }
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
  } else if (id === '2') { 
    specificData = {
      name: 'Bruno Almeida Costa',
      sessionNotes: `<p>Sessão de ${format(subDays(baseDate,3), "dd/MM/yy")}: Paciente relata dificuldades em manter a rotina de exercícios físicos, que é parte do plano de manejo do TEPT.</p><p>Exploramos barreiras e ajustamos o plano. Apresentou bom insight sobre procrastinação e evitação.</p>`,
      previousSessionNotes: [
        { content: `<p>Sessão de ${format(subDays(baseDate,10), "dd/MM/yy")}: Trabalhando na exposição gradual a lembranças do evento traumático. Paciente demonstrou ansiedade, mas conseguiu permanecer na tarefa com apoio.</p>`, timestamp: subDays(baseDate, 10).toISOString()},
        { content: `<p>Sessão de ${format(subDays(baseDate,17), "dd/MM/yy")}: Foco em psicoeducação sobre TEPT e técnicas de regulação emocional.</p>`, timestamp: subDays(baseDate, 17).toISOString()},
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
      sessionNotes: `<p>Sessão de ${format(subDays(baseDate,5), "dd/MM/yy")}: Nenhuma anotação detalhada para este paciente mock.</p>`,
      prontuario: {
        ...mockProntuarioAna, 
        identificacao: {...mockProntuarioAna.identificacao, nomeCompleto: `Paciente Exemplo ${id}`},
        procedimentosAnalise: [], 
        signatureStatus: 'none',
        }, 
      caseStudyNotes: "<p>Nenhuma nota de estudo de caso para este paciente exemplo.</p>",
      assignedTo: 'another-psy-uid',
    };
  }

  if (id === 'notfound') return null;
  return { ...mockPatientBase, ...specificData } as Patient;
};

const fetchPatientSessionsMock = async (patientId: string): Promise<Session[]> => {
  await new Promise(resolve => setTimeout(resolve, 200)); 
  let baseDate = new Date();
  const sessionsList: Session[] = [];

  if (patientId === '1') { 
    sessionsList.push(
      { id: 's1_ana', patientId, psychologistId: 'mock-user-psychologist-1234', psychologistName: "Dr. Exemplo Silva", startTime: subDays(baseDate, 1).toISOString(), endTime: new Date(subDays(baseDate, 1).getTime() + 60*60*1000).toISOString(), status: 'completed', recurring: 'weekly', notes: 'Discussão sobre pensamentos automáticos.', createdAt: subDays(baseDate, 2).toISOString() },
      { id: 's2_ana', patientId, psychologistId: 'mock-user-psychologist-1234', psychologistName: "Dr. Exemplo Silva", startTime: addDays(baseDate, 6).toISOString(), endTime: new Date(addDays(baseDate, 6).getTime() + 60*60*1000).toISOString(), status: 'scheduled', recurring: 'weekly', notes: 'Manutenção e prevenção de recaídas.', createdAt: subDays(baseDate, 1).toISOString() },
      { id: 's3_ana', patientId, psychologistId: 'mock-user-psychologist-1234', psychologistName: "Dr. Exemplo Silva", startTime: subDays(baseDate, 8).toISOString(), endTime: new Date(subDays(baseDate, 8).getTime() + 60*60*1000).toISOString(), status: 'completed', createdAt: subDays(baseDate, 9).toISOString()},
      { id: 's4_ana', patientId, psychologistId: 'mock-user-psychologist-1234', psychologistName: "Dr. Exemplo Silva", startTime: subDays(baseDate, 15).toISOString(), endTime: new Date(subDays(baseDate, 15).getTime() + 60*60*1000).toISOString(), status: 'completed', createdAt: subDays(baseDate, 16).toISOString()},
      { id: 's5_ana', patientId, psychologistId: 'mock-user-psychologist-1234', psychologistName: "Dr. Exemplo Silva", startTime: subDays(baseDate, 22).toISOString(), endTime: new Date(subDays(baseDate, 22).getTime() + 60*60*1000).toISOString(), status: 'completed', createdAt: subDays(baseDate, 23).toISOString()},
      { id: 's6_ana_past_noshow', patientId, psychologistId: 'mock-user-psychologist-1234', psychologistName: "Dr. Exemplo Silva", startTime: subDays(baseDate, 29).toISOString(), endTime: new Date(subDays(baseDate, 29).getTime() + 60*60*1000).toISOString(), status: 'no-show', createdAt: subDays(baseDate, 30).toISOString()},
      { id: 's7_ana_past_cancelled', patientId, psychologistId: 'mock-user-psychologist-1234', psychologistName: "Dr. Exemplo Silva", startTime: subDays(baseDate, 36).toISOString(), endTime: new Date(subDays(baseDate, 36).getTime() + 60*60*1000).toISOString(), status: 'cancelled', createdAt: subDays(baseDate, 37).toISOString()}
    );
  } else if (patientId === '2') { 
     sessionsList.push(
      { id: 's1_bruno', patientId, psychologistId: 'other-psy-uid', psychologistName: "Dra. Modelo Souza", startTime: subDays(baseDate, 3).toISOString(), endTime: new Date(subDays(baseDate, 3).getTime() + 60*60*1000).toISOString(), status: 'completed', notes: 'Discussão sobre barreiras para exercícios.', createdAt: subDays(baseDate, 4).toISOString()},
      { id: 's2_bruno', patientId, psychologistId: 'other-psy-uid', psychologistName: "Dra. Modelo Souza", startTime: addDays(baseDate, 4).toISOString(), endTime: new Date(addDays(baseDate, 4).getTime() + 60*60*1000).toISOString(), status: 'scheduled', notes: 'Próxima etapa da exposição narrativa.', createdAt: subDays(baseDate, 1).toISOString()},
      { id: 's3_bruno', patientId, psychologistId: 'other-psy-uid', psychologistName: "Dra. Modelo Souza", startTime: subDays(baseDate, 10).toISOString(), endTime: new Date(subDays(baseDate, 10).getTime() + 60*60*1000).toISOString(), status: 'completed', createdAt: subDays(baseDate, 11).toISOString()},
      { id: 's4_bruno', patientId, psychologistId: 'other-psy-uid', psychologistName: "Dra. Modelo Souza", startTime: subDays(baseDate, 17).toISOString(), endTime: new Date(subDays(baseDate, 17).getTime() + 60*60*1000).toISOString(), status: 'completed', createdAt: subDays(baseDate, 18).toISOString()},
      { id: 's5_bruno_past_noshow', patientId, psychologistId: 'other-psy-uid', psychologistName: "Dra. Modelo Souza", startTime: subDays(baseDate, 24).toISOString(), endTime: new Date(subDays(baseDate, 24).getTime() + 60*60*1000).toISOString(), status: 'no-show', createdAt: subDays(baseDate, 25).toISOString()}
    );
  } else { 
    sessionsList.push(
      { id: `s1_gen_${patientId}`, patientId, psychologistId: 'psy1', psychologistName: "Dr. Exemplo Silva", startTime: addDays(baseDate, 2).toISOString(), endTime: new Date(addDays(baseDate, 2).getTime() + 60*60*1000).toISOString(), status: 'scheduled', notes: 'Sessão de acompanhamento.', createdAt: subDays(baseDate, 1).toISOString()},
      { id: `s2_gen_${patientId}`, patientId, psychologistId: 'psy1', psychologistName: "Dr. Exemplo Silva", startTime: subDays(baseDate, 5).toISOString(), endTime: new Date(subDays(baseDate, 5).getTime() + 60*60*1000).toISOString(), status: 'completed', createdAt: subDays(baseDate, 6).toISOString()}
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

const SignatureStatusIndicator: React.FC<{ status?: DocumentSignatureStatus }> = ({ status }) => {
  switch (status) {
    case 'pending_govbr_signature':
      return <Badge variant="outline" className="text-blue-600 border-blue-500 bg-blue-500/10"><Fingerprint className="mr-1.5 h-3.5 w-3.5" />Pendente Assinatura</Badge>;
    case 'signed':
      return <Badge variant="secondary" className="text-green-600 border-green-500 bg-green-500/10"><ShieldCheck className="mr-1.5 h-3.5 w-3.5" />Assinado</Badge>;
    case 'verification_failed':
      return <Badge variant="destructive"><ShieldX className="mr-1.5 h-3.5 w-3.5" />Falha Verif.</Badge>;
    case 'none':
    default:
      return <Badge variant="outline" className="text-yellow-600 border-yellow-500 bg-yellow-500/10"><ShieldAlert className="mr-1.5 h-3.5 w-3.5" />Não Assinado</Badge>;
  }
};

interface ProntuarioSignatureDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  details: DocumentSignatureDetails | undefined;
  documentName: string; 
}

function ProntuarioSignatureDetailsDialog({ isOpen, onOpenChange, details, documentName }: ProntuarioSignatureDetailsDialogProps) {
  if (!details) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center"><Fingerprint className="mr-2 h-5 w-5 text-primary"/>Detalhes da Assinatura</DialogTitle>
          <DialogDescription>Para: {documentName}</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2 text-sm">
          <p><strong>Hash (Simulado):</strong> <span className="font-mono text-xs break-all">{details.hash || 'N/A'}</span></p>
          <p><strong>Informações do Assinante (Simulado):</strong> {details.signerInfo || 'N/A'}</p>
          <p><strong>Data da Assinatura (Simulada):</strong> {details.signedAt ? format(parseISO(details.signedAt), "dd/MM/yyyy HH:mm:ss", { locale: ptBR }) : 'N/A'}</p>
          <p><strong>Código de Verificação (Simulado):</strong> {details.verificationCode || 'N/A'}</p>
          {details.p7sFile && <p><strong>Arquivo de Assinatura (.p7s):</strong> {details.p7sFile}</p>}
        </div>
        <UIDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </UIDialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const ProntuarioDisplay: React.FC<{ 
  patient: Patient;
  currentUser: User | null;
  onInitiateSignature: () => void;
  onUploadSignedDocument: (file: File) => void;
  onViewSignatureDetails: () => void;
  onExportToPDF: () => void;
}> = ({ patient, currentUser, onInitiateSignature, onUploadSignedDocument, onViewSignatureDetails, onExportToPDF }) => {
  const { prontuario } = patient;
  const { identificacao, entradaUnidade, demandaQueixaPrincipal, procedimentosAnalise, conclusaoEncaminhamentoGeral, localAssinatura, signatureStatus } = prontuario || {};
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUploadTrigger = () => fileInputRef.current?.click();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUploadSignedDocument(file);
      if (fileInputRef.current) fileInputRef.current.value = ""; 
    }
  };

  const psychologistName = currentUser?.name || prontuario?.identificacao?.nomeCompleto || "Profissional Responsável";
  const psychologistCRP = currentUser?.crp || "CRP não informado";

  return (
    <div className="space-y-6 text-sm">
      <ScrollArea className="h-[calc(100vh-300px)] w-full rounded-md border p-6 bg-muted/20 shadow-inner">
        <div className="prose prose-sm dark:prose-invert max-w-none">
            <h2 className="text-center font-bold text-lg mb-6">PRONTUÁRIO PSICOLÓGICO</h2>
            
            <section className="mb-4">
                <h3 className="font-semibold border-b pb-1 mb-2">Identificação</h3>
                <p><strong>Nome Completo:</strong> {identificacao?.nomeCompleto || patient.name || '(não informado)'}</p>
                <p><strong>Sexo:</strong> {identificacao?.sexo || '(não informado)'}</p>
                <p><strong>CPF:</strong> {identificacao?.cpf || '(não informado)'}</p>
                <p><strong>Data de Nasc.:</strong> {identificacao?.dataNascimento ? format(parseISO(identificacao.dataNascimento), "dd/MM/yyyy", { locale: ptBR }) : patient.dateOfBirth ? format(parseISO(patient.dateOfBirth), "dd/MM/yyyy", { locale: ptBR }) : '(não informado)'}</p>
                <p><strong>Estado Civil:</strong> {identificacao?.estadoCivil || '(não informado)'}</p>
                <p><strong>Raça/Cor:</strong> {identificacao?.racaCor || '(não informado)'}</p>
                <p><strong>Possui filhos:</strong> {identificacao?.possuiFilhos ? `Sim, ${identificacao.quantosFilhos || 0}` : identificacao?.possuiFilhos === false ? 'Não' : '(não informado)'}</p>
                <p><strong>Situação profissional:</strong> {identificacao?.situacaoProfissional || '(não informado)'}</p>
                <p><strong>Profissão:</strong> {identificacao?.profissao || '(não informado)'}</p>
                <p><strong>Escolaridade:</strong> {identificacao?.escolaridade || '(não informado)'}</p>
                <p><strong>Renda:</strong> {identificacao?.renda || '(não informado)'}</p>
                <p><strong>Endereço Casa:</strong> {identificacao?.enderecoCasa || patient.address || '(não informado)'}</p>
                <p><strong>Tipo de Moradia:</strong> {identificacao?.tipoMoradia || '(não informado)'}</p>
                <p><strong>Telefone:</strong> {identificacao?.telefone || patient.phone || '(não informado)'}</p>
                <p><strong>Contato emergência:</strong> {identificacao?.contatoEmergencia || '(não informado)'}</p>
            </section>

            <section className="mb-4">
                <h3 className="font-semibold border-b pb-1 mb-2">1.1. Entrada na Unidade</h3>
                <p>{entradaUnidade?.descricaoEntrada || '(não informado)'}</p>
            </section>

            <section className="mb-4">
                <h3 className="font-semibold border-b pb-1 mb-2">1.2. Finalidade</h3>
                <p>Descrever a atuação profissional do técnico da psicologia no acolhimento e escuta humanizada, podendo gerar orientações, recomendações, encaminhamentos e intervenções pertinentes à atuação descrita no documento, não tendo como finalidade produzir diagnóstico psicológico.</p>
            </section>

            <section className="mb-4">
                <h3 className="font-semibold border-b pb-1 mb-2">1.3. Responsável Técnica</h3>
                <p>{psychologistName}</p>
                <p>Psicóloga(o) CRP 06/{psychologistCRP}</p>
            </section>

            <section className="mb-4">
                <h3 className="font-semibold border-b pb-1 mb-2">Descrição da demanda/queixa</h3>
                <p className="whitespace-pre-wrap">{demandaQueixaPrincipal || '(Nenhuma demanda/queixa principal registrada)'}</p>
            </section>

            <section className="mb-4">
                <h3 className="font-semibold border-b pb-1 mb-2">Procedimento/Análise</h3>
                {procedimentosAnalise && procedimentosAnalise.length > 0 ? (
                    procedimentosAnalise.map((entry, index) => (
                    <div key={entry.entryId || index} className="mb-3 border-l-2 border-muted pl-3 py-1">
                        <p className="font-medium text-xs text-muted-foreground">Data: {format(parseISO(entry.date), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
                        <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: entry.content }} />
                    </div>
                    ))
                ) : (
                    <p>(Nenhum procedimento/análise registrado. As "Evoluções das Sessões" salvas aparecerão aqui.)</p>
                )}
            </section>

            <section className="mb-4">
                <h3 className="font-semibold border-b pb-1 mb-2">Conclusão/Encaminhamento</h3>
                <p className="whitespace-pre-wrap">{conclusaoEncaminhamentoGeral || '(Nenhuma conclusão/encaminhamento geral registrado)'}</p>
            </section>

            <section className="mb-4 text-xs italic">
                <p>Obs: Este documento não poderá ser utilizado para fins diferentes do apontado na finalidade acima, possui caráter sigiloso e trata-se de documento extrajudicial e não responsabilizo-me pelo uso dado ao relatório por parte da pessoa, grupo ou instituição, após a sua entrega em entrevista devolutiva.</p>
            </section>

            <section className="mt-8 text-center">
                <p>{localAssinatura || '(Local não definido)'}, {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}.</p>
                <br />
                <p className="mt-10">____________________________________________________</p>
                <p>{psychologistName}</p>
                <p>Psicóloga(o) CRP 06/{psychologistCRP}</p>
            </section>
        </div>
      </ScrollArea>

      <Separator className="my-4"/>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 border-t">
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status da Assinatura:</span>
            <SignatureStatusIndicator status={signatureStatus} />
        </div>
        <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={onExportToPDF}>
                <DownloadCloud className="mr-2 h-4 w-4" /> Exportar para PDF (Simulado)
            </Button>
            {signatureStatus === 'none' && (
                <Button variant="default" size="sm" onClick={onInitiateSignature}>
                    <Edit3 className="mr-2 h-4 w-4" /> Assinar Prontuário (Simulado)
                </Button>
            )}
            {signatureStatus === 'pending_govbr_signature' && (
                <>
                    <input 
                        type="file" 
                        accept=".p7s,.pdf"
                        ref={fileInputRef} 
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <Button variant="secondary" size="sm" onClick={handleFileUploadTrigger}>
                        <UploadCloud className="mr-2 h-4 w-4" /> Upload Assinatura (.p7s/.pdf)
                    </Button>
                </>
            )}
            {(signatureStatus === 'signed' || signatureStatus === 'verification_failed') && prontuario?.signatureDetails && (
                 <Button variant="outline" size="sm" onClick={onViewSignatureDetails}>
                    <Eye className="mr-2 h-4 w-4" /> Ver Detalhes Assinatura
                </Button>
            )}
        </div>
      </div>
    </div>
  );
};

export default function PatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;
  const { toast } = useToast();
  const { user: currentUser, isLoading: authLoading } = useAuth();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [patientAssessments, setPatientAssessments] = useState<Assessment[]>([]);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isPatientFormOpen, setIsPatientFormOpen] = useState(false);
  const [isSessionFormOpen, setIsSessionFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [areNotesVisible, setAreNotesVisible] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'evolution' | 'prontuario' | 'case_study' | 'pti' | 'scales' | 'analysis' | 'attachments'>('evolution');
  
  const [isProntuarioSignatureDetailsOpen, setIsProntuarioSignatureDetailsOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (patientId) {
      const loadPatientData = async () => {
        setIsLoadingPage(true);
        
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
        fetchedPatientData = fetchedPatientData ? { ...fetchedPatientData, assignedTo: fetchedPatientData.assignedTo || (fetchedPatientData.id === '1' ? 'mock-user-psychologist-1234' : `other-psy-${fetchedPatientData.id}`) } : null;

        fetchedAssessmentsData = allMockAssessments.filter(asm => asm.patientId === patientId && asm.status === 'completed');

        if (isMounted) {
          if (fetchedPatientData) {
            const ensuredPatientData = {
                ...fetchedPatientData,
                prontuario: {
                    identificacao: {},
                    entradaUnidade: {},
                    demandaQueixaPrincipal: '',
                    procedimentosAnalise: [],
                    conclusaoEncaminhamentoGeral: '',
                    localAssinatura: "Santana de Parnaíba",
                    signatureStatus: 'none',
                    signatureDetails: {},
                    ...(fetchedPatientData.prontuario || {}), 
                }
            };
            setPatient(ensuredPatientData);
            await cacheService.patients.setDetail(patientId, ensuredPatientData);
          }
          setSessions(fetchedSessionsData.sort((a,b) => parseISO(b.startTime).getTime() - parseISO(a.startTime).getTime()));
          await cacheService.patients.setSessions(patientId, fetchedSessionsData);
          
          setPatientAssessments(fetchedAssessmentsData);
          setIsLoadingPage(false);
        }
      };
      loadPatientData();
    }
    return () => { isMounted = false; };
  }, [patientId]);

  const canAccessClinicalData = useMemo(() => {
    if (!currentUser || !patient) return false;
    return hasPermission(currentUser.role, 'ACCESS_PATIENT_CLINICAL_DATA', patient.assignedTo === currentUser.id);
  }, [currentUser, patient]);

  const canEditClinicalNotes = useMemo(() => {
    if (!currentUser || !patient) return false;
    if (currentUser.role === 'admin') return true;
    return hasPermission(currentUser.role, 'CREATE_EDIT_CLINICAL_NOTES') && patient.assignedTo === currentUser.id;
  }, [currentUser, patient]);


  const handleEditSession = useCallback((session: Session) => {
    setEditingSession(session);
    setIsSessionFormOpen(true);
  }, []);
  
  const handleNewSession = useCallback(() => {
    setEditingSession(null); 
    setIsSessionFormOpen(true);
  }, []);

  const handleSavePatient = useCallback(async (updatedDataFromForm: Partial<Patient>) => {
    if (!patient) return;

    const currentNotes = patient.sessionNotes || "";
    const newNotesFromForm = updatedDataFromForm.sessionNotes;
    let previousNotesHistory = patient.previousSessionNotes || [];

    if (newNotesFromForm !== undefined && newNotesFromForm !== currentNotes && (typeof currentNotes === 'string' && currentNotes.trim() !== "" && currentNotes.trim() !== "<p></p>")) {
      const newVersion: PatientNoteVersion = {
        content: currentNotes, 
        timestamp: patient.updatedAt || new Date().toISOString(),
      };
      previousNotesHistory = [newVersion, ...previousNotesHistory].slice(0, 10); 
    }
    
    let updatedProntuario = { ...(patient.prontuario || { procedimentosAnalise: [], signatureStatus: 'none' }) };
    if (updatedDataFromForm.prontuario) { 
        updatedProntuario = {
            ...updatedProntuario,
            ...updatedDataFromForm.prontuario,
            identificacao: { ...updatedProntuario.identificacao, ...updatedDataFromForm.prontuario.identificacao},
            entradaUnidade: { ...updatedProntuario.entradaUnidade, ...updatedDataFromForm.prontuario.entradaUnidade},
        };
    }

    if (updatedDataFromForm.prontuario?.procedimentosAnalise) {
        updatedProntuario.procedimentosAnalise = updatedDataFromForm.prontuario.procedimentosAnalise;
    }


    const updatedPatient = { 
      ...patient, 
      ...updatedDataFromForm, 
      sessionNotes: newNotesFromForm, 
      previousSessionNotes: previousNotesHistory,
      prontuario: updatedProntuario,
      updatedAt: new Date().toISOString() 
    };
    
    setPatient(updatedPatient);
    await cacheService.patients.setDetail(patient.id, updatedPatient); 
    setIsPatientFormOpen(false);
    toast({ title: "Dados do Paciente e Prontuário Salvos", description: "As informações foram atualizadas." });
  }, [patient, toast]);

  const handleSaveSession = useCallback(async (sessionData: Partial<Session>) => {
    const psychologistNameMap: Record<string, string> = {
      psy1: 'Dr. Exemplo Silva',
      psy2: 'Dra. Modelo Souza',
      'mock-user-psychologist-1234': 'Dr. Exemplo Silva',
    };
    const patientNameMap: Record<string, string> = { 
        '1': 'Ana Beatriz Silva',
        '2': 'Bruno Almeida Costa',
        '3': 'Carla Dias Oliveira',
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
        patientId: patientId, 
        patientName: patient?.name, 
        psychologistId: currentUser?.id, // Assign current psychologist to new session
        psychologistName: currentUser?.name,
        createdAt: new Date().toISOString(),
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
            createdAt: new Date().toISOString(),
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
  }, [patientId, editingSession, patient?.name, sessions, currentUser]);

  const sessionStats = useMemo(() => {
    const nextScheduled = sessions
      .filter(s => s.status === 'scheduled' && isFuture(parseISO(s.startTime)))
      .sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime())[0];
    
    const completedCount = sessions.filter(s => s.status === 'completed').length;
    const noShowCount = sessions.filter(s => s.status === 'no-show').length;
    const cancelledCount = sessions.filter(s => s.status === 'cancelled').length;

    return { nextScheduled, completedCount, noShowCount, cancelledCount };
  }, [sessions]);

  const handleInitiateProntuarioSignature = useCallback(async () => {
    if (!patient || !patient.prontuario) return;
    const mockHash = `sha256-prontuario-${patient.id}-${Date.now()}`;
    const updatedProntuario: ProntuarioData = {
      ...patient.prontuario,
      signatureStatus: 'pending_govbr_signature',
      signatureDetails: { ...patient.prontuario.signatureDetails, hash: mockHash },
    };
    const updatedPatient = { ...patient, prontuario: updatedProntuario, updatedAt: new Date().toISOString() };
    setPatient(updatedPatient);
    await cacheService.patients.setDetail(patient.id, updatedPatient);
    toast({
      title: "Assinatura do Prontuário Iniciada (Simulado)",
      description: `Prontuário de ${patient.name} preparado para assinatura.`,
      duration: 7000,
    });
  }, [patient, toast]);

  const handleUploadSignedProntuario = useCallback(async (signedFile: File) => {
    if (!patient || !patient.prontuario) return;
    const isValidExtension = signedFile.name.endsWith('.p7s') || signedFile.name.endsWith('.pdf');
    let signatureStatusUpdate: DocumentSignatureStatus = 'signed';
    let toastMessage = `Prontuário de ${patient.name} marcado como assinado.`;
    let toastVariant: "default" | "destructive" = "default";

    if (!isValidExtension) {
      signatureStatusUpdate = 'verification_failed';
      toastMessage = "Arquivo de assinatura inválido para o prontuário. Use .p7s ou .pdf.";
      toastVariant = "destructive";
    }

    const signatureDetails: DocumentSignatureDetails = {
      ...patient.prontuario.signatureDetails,
      signerInfo: signatureStatusUpdate === 'signed' ? `CPF ${Math.floor(100 + Math.random() * 900)}.${Math.floor(100 + Math.random() * 900)}.${Math.floor(100 + Math.random() * 900)}-${Math.floor(10 + Math.random() * 90)} (Mock)` : patient.prontuario.signatureDetails?.signerInfo,
      signedAt: signatureStatusUpdate === 'signed' ? new Date().toISOString() : patient.prontuario.signatureDetails?.signedAt,
      verificationCode: signatureStatusUpdate === 'signed' ? `GOVBR-PRONT-${Date.now().toString().slice(-6)}` : patient.prontuario.signatureDetails?.verificationCode,
      p7sFile: signatureStatusUpdate === 'signed' && signedFile.name.endsWith('.p7s') ? signedFile.name : patient.prontuario.signatureDetails?.p7sFile,
    };
    
    const updatedProntuario: ProntuarioData = { ...patient.prontuario, signatureStatus: signatureStatusUpdate, signatureDetails };
    const updatedPatient = { ...patient, prontuario: updatedProntuario, updatedAt: new Date().toISOString() };
    
    setPatient(updatedPatient);
    await cacheService.patients.setDetail(patient.id, updatedPatient);
    toast({ title: signatureStatusUpdate === 'signed' ? "Prontuário Assinado (Simulado)" : "Falha na Verificação", description: toastMessage, variant: toastVariant });
  }, [patient, toast]);

  const handleViewProntuarioSignatureDetails = useCallback(() => {
    if (patient?.prontuario?.signatureDetails) {
      setIsProntuarioSignatureDetailsOpen(true);
    }
  }, [patient]);

  const handleExportProntuarioToPDF = useCallback(() => {
    toast({
      title: "Exportar para PDF (Simulado)",
      description: `O prontuário de ${patient?.name} seria exportado para PDF.`,
    });
  }, [patient, toast]);

  if (authLoading || isLoadingPage) {
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
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-10">
        <ShieldAlert className="mx-auto h-12 w-12 text-destructive mb-3" />
        <h2 className="text-2xl font-semibold mb-4">Paciente não encontrado</h2>
        <p className="text-muted-foreground mb-4">Não foi possível carregar os dados do paciente.</p>
        <Button onClick={() => router.push('/patients')}>Voltar para lista de pacientes</Button>
      </div>
    );
  }
  
  const canViewClinicalData = hasPermission(currentUser?.role, 'ACCESS_PATIENT_CLINICAL_DATA', patient.assignedTo === currentUser?.id);

  if (!canViewClinicalData) { // Basic check, detailed data visibility is handled by `areNotesVisible` and tabs
    return (
      <div className="text-center py-10">
        <ShieldQuestion className="mx-auto h-12 w-12 text-destructive mb-3" />
        <h2 className="text-2xl font-semibold mb-4">Acesso Negado</h2>
        <p className="text-muted-foreground mb-4">Você não tem permissão para visualizar os dados clínicos deste paciente.</p>
        <Button onClick={() => router.push('/patients')}>Voltar para lista de pacientes</Button>
      </div>
    );
  }

  const completedPatientAssessments = patientAssessments.filter(asm => asm.status === 'completed' && typeof asm.results?.score === 'number');

  const TAB_KEYS = ['evolution', 'prontuario', 'case_study', 'pti', 'scales', 'analysis', 'attachments'] as const;
  type PatientDetailTab = (typeof TAB_KEYS)[number];


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
          {canEditClinicalNotes && (
            <Button variant="outline" size="icon" className="absolute top-4 right-4 md:static md:ml-auto" onClick={() => setIsPatientFormOpen(true)}>
              <Edit className="h-5 w-5" /> <span className="sr-only">Editar Paciente e Prontuário</span>
            </Button>
          )}
        </div>

        <CardContent className="p-6 space-y-6">
          <div>
            <h3 className="text-xl font-headline font-semibold mb-2">Endereço</h3>
            <p className="text-muted-foreground">{patient.address || patient.prontuario?.identificacao?.enderecoCasa || "Não informado"}</p>
          </div>
          <Separator />
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PatientDetailTab)} className="w-full">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <TabsList className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-1 w-full md:w-auto">
                <TabsTrigger value="evolution" className="font-headline text-xs px-2 py-1.5 h-auto whitespace-nowrap"><FileTextIconLucide className="w-3.5 h-3.5 mr-1.5"/>Evolução</TabsTrigger>
                <TabsTrigger value="prontuario" className="font-headline text-xs px-2 py-1.5 h-auto whitespace-nowrap"><BookMarked className="w-3.5 h-3.5 mr-1.5"/>Prontuário</TabsTrigger>
                <TabsTrigger value="case_study" className="font-headline text-xs px-2 py-1.5 h-auto whitespace-nowrap"><CaseSensitive className="w-3.5 h-3.5 mr-1.5"/>Estudo Caso</TabsTrigger>
                <TabsTrigger value="pti" className="font-headline text-xs px-2 py-1.5 h-auto whitespace-nowrap"><ListChecks className="w-3.5 h-3.5 mr-1.5"/>PTI</TabsTrigger>
                <TabsTrigger value="scales" className="font-headline text-xs px-2 py-1.5 h-auto whitespace-nowrap"><FileSignature className="w-3.5 h-3.5 mr-1.5"/>Escalas</TabsTrigger>
                <TabsTrigger value="analysis" className="font-headline text-xs px-2 py-1.5 h-auto whitespace-nowrap"><BarChart3 className="w-3.5 h-3.5 mr-1.5"/>Análise</TabsTrigger>
                <TabsTrigger value="attachments" className="font-headline text-xs px-2 py-1.5 h-auto whitespace-nowrap"><Paperclip className="w-3.5 h-3.5 mr-1.5"/>Anexos</TabsTrigger>
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

            {!areNotesVisible && TAB_KEYS.includes(activeTab) ? (
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
                  <h3 className="text-lg font-semibold font-headline mb-2">Evolução das Sessões (Nota Atual)</h3>
                   <RichTextEditor
                      initialContent={patient.sessionNotes || "<p></p>"}
                      onUpdate={(content) => {}}
                      editable={false} 
                      editorClassName="h-auto max-h-[600px] overflow-y-auto bg-transparent p-0 rounded-none shadow-none border-none"
                      pageClassName="min-h-[200px] shadow-none border" 
                  />
                   <p className="text-xs text-muted-foreground mt-2">Para editar esta nota ou ver o histórico de notas, clique no botão "Editar Paciente e Prontuário" no topo da página.</p>
                </TabsContent>
                <TabsContent value="prontuario">
                   <ProntuarioDisplay 
                      patient={patient}
                      currentUser={currentUser}
                      onInitiateSignature={handleInitiateProntuarioSignature}
                      onUploadSignedDocument={handleUploadSignedProntuario}
                      onViewSignatureDetails={handleViewProntuarioSignatureDetails}
                      onExportToPDF={handleExportProntuarioToPDF}
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
                            onUpdate={() => {}} 
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
                 <TabsContent value="attachments">
                     <PatientAttachmentManager patientId={patientId} patientName={patient.name} currentUser={currentUser} />
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-xl font-headline">Histórico e Resumo de Sessões</CardTitle>
            { (currentUser?.role === 'admin' || (currentUser?.role === 'psychologist' && patient.assignedTo === currentUser.id )) && (
                <Button onClick={handleNewSession} size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" /> Nova Sessão
                </Button>
            )}
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
                                  {/* Conditional Edit/Open Session Button */}
                                  { (currentUser?.role === 'admin' || (currentUser?.role === 'psychologist' && s.psychologistId === currentUser.id)) && (
                                    <Button variant="outline" size="sm" onClick={() => router.push(`/sessions/${s.id}?patientId=${patientId}`)}>
                                      <Edit className="w-3.5 h-3.5 mr-1.5" /> Abrir Sessão
                                    </Button>
                                  )}
                              </div>
                          </li>
                      ))}
                  </ul>
              </ScrollArea>
          ) : (
                isLoadingPage ? <Skeleton className="h-20 w-full" /> : <p className="text-muted-foreground">Nenhuma sessão registrada para este paciente.</p>
          )}
        </CardContent>
      </Card>

      {canEditClinicalNotes && (
        <PatientFormDialog 
            isOpen={isPatientFormOpen} 
            onOpenChange={setIsPatientFormOpen}
            patient={patient}
            onSave={handleSavePatient}
        />
      )}
      
      <SessionFormDialog
        isOpen={isSessionFormOpen}
        onOpenChange={setIsSessionFormOpen}
        session={editingSession}
        onSave={handleSaveSession}
        // patientData is not strictly needed here if new sessions are for current patient
        // but it's good practice if dialog could be used more generically.
        patientData={patient ? { id: patient.id, name: patient.name, assignedTo: patient.assignedTo } : undefined}
      />

       <Dialog open={isHistoryDialogOpen && areNotesVisible && canAccessClinicalData && activeTab === 'evolution'} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="font-headline">Histórico de Evolução das Sessões</DialogTitle>
            <DialogDescription>
              Versões anteriores das anotações de evolução para {patient.name}. A mais recente está no topo.
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
      
      {patient && patient.prontuario && canAccessClinicalData && (
         <ProntuarioSignatureDetailsDialog 
            isOpen={isProntuarioSignatureDetailsOpen && areNotesVisible && activeTab === 'prontuario'}
            onOpenChange={setIsProntuarioSignatureDetailsOpen}
            details={patient.prontuario.signatureDetails}
            documentName={`Prontuário de ${patient.name}`}
          />
      )}

    </div>
  );
}


"use client";

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState, useCallback, useRef, ChangeEvent } from 'react';
import type { Patient, Session, PatientNoteVersion, ProntuarioData, DocumentSignatureStatus, DocumentSignatureDetails } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Edit, Mail, Phone, CalendarDays, FileText, PlusCircle, Repeat, Eye, EyeOff, Lock, History, Info, BookMarked, Fingerprint, ShieldCheck, ShieldX, ShieldAlert, SendToBack, UploadCloud } from 'lucide-react';
import { PatientFormDialog } from '@/features/patients/components/PatientFormDialog';
import { SessionFormDialog } from '@/features/scheduling/components/SessionFormDialog';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { format, parseISO, addDays, addWeeks, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cacheService } from '@/services/cacheService';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const mockProntuario: ProntuarioData = {
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
  },
  entradaUnidade: {
    descricaoEntrada: 'Busca espontânea após recomendação de uma amiga. Relatou sentir-se ansiosa e com dificuldades para lidar com o estresse no trabalho.',
  },
  finalidade: {
    descricaoFinalidade: 'Acolhimento psicológico e escuta humanizada para desenvolvimento de estratégias de enfrentamento da ansiedade e estresse, visando melhoria da qualidade de vida e bem-estar emocional. Não tem como finalidade produzir diagnóstico psicológico.',
  },
  responsavelTecnica: {
    nomePsi: 'Dr. Exemplo Silva',
    crp: '06/123456',
  },
  descricaoDemanda: {
    demandaQueixa: 'Paciente relata sintomas de ansiedade generalizada, preocupação excessiva com o futuro, dificuldades de concentração, irritabilidade e insônia nos últimos 6 meses. Queixa-se também de sobrecarga no ambiente de trabalho e dificuldade em estabelecer limites.',
  },
  procedimentosAnalise: [
    { dataAtendimento: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString(), descricaoAtuacao: 'Primeira consulta. Realizada anamnese detalhada, escuta ativa da queixa inicial. Identificados principais gatilhos de ansiedade. Explicado o processo terapêutico e combinado contrato terapêutico. Aplicada Escala Beck de Ansiedade (BAI) - Resultado: 28 (Ansiedade Moderada).' },
    { dataAtendimento: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), descricaoAtuacao: 'Foco em psicoeducação sobre ansiedade e seus mecanismos. Introduzidas técnicas de respiração diafragmática e relaxamento progressivo. Paciente demonstrou boa receptividade e compreensão.' },
    { dataAtendimento: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), descricaoAtuacao: 'Trabalho com reestruturação cognitiva de pensamentos disfuncionais relacionados ao trabalho e autoexigência. Paciente identificou padrões de pensamento catastróficos. Proposta de diário de pensamentos como tarefa de casa.' },
  ],
  conclusaoEncaminhamento: {
    condutaAdotada: 'Paciente segue em acompanhamento psicológico semanal. Apresenta evolução gradual na identificação e manejo dos sintomas de ansiedade. Demonstra maior autoconsciência e engajamento nas técnicas propostas. Recomenda-se continuidade do processo terapêutico para consolidação dos ganhos e desenvolvimento de novas habilidades de enfrentamento. Nenhuma necessidade de encaminhamento externo no momento.',
  },
  localAssinatura: 'Santana de Parnaíba',
  dataDocumento: new Date().toISOString(),
  signatureStatus: 'none',
};


const fetchPatientDetailsMock = async (id: string): Promise<Patient | null> => {
  await new Promise(resolve => setTimeout(resolve, 300)); 
  const mockPatient: Patient = {
    id,
    name: id === '1' ? 'Ana Beatriz Silva' : id === '2' ? 'Bruno Almeida Costa' : 'Paciente Exemplo Detalhado',
    email: id === '1' ? 'ana.silva@example.com' : id === '2' ? 'bruno.costa@example.com' : 'paciente.detalhe@example.com',
    phone: id === '1' ? '(11) 98765-4321' : id === '2' ? '(21) 91234-5678' : '(XX) XXXXX-XXXX',
    dateOfBirth: id === '1' ? '1990-05-15' : id === '2' ? '1985-11-20' : '1995-01-01',
    address: 'Rua Fictícia, 123, Bairro Imaginário, Cidade Exemplo - UF',
    sessionNotes: `Sessão de 22/07: Paciente demonstrou melhora significativa na gestão de pensamentos automáticos. Praticou as técnicas de respiração e relatou diminuição da insônia. Próxima sessão focará em estratégias de manutenção e prevenção de recaídas.`,
    previousSessionNotes: [
      { content: "Sessão de 15/07: Foco em reestruturação cognitiva de pensamentos automáticos negativos. Paciente identificou três padrões principais. Recomendações: Continuar o diário de pensamentos, praticar técnicas de respiração diafragmática duas vezes ao dia.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString() },
      { content: "Paciente apresenta quadro de ansiedade generalizada, com picos de estresse relacionados ao trabalho. Demonstra boa adesão às técnicas propostas em sessões anteriores.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString() }
    ],
    prontuario: id === '1' ? { ...mockProntuario, signatureStatus: 'none' } : id === '2' ? { ...mockProntuario, nomeCompleto: 'Bruno Almeida Costa', signatureStatus: 'pending_govbr_signature', signatureDetails: { hash: `sha256-${Math.random().toString(36).substring(2,15)}`} } : undefined,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), 
    updatedAt: new Date().toISOString(),
  };
  if (id === 'notfound') return null;
  return mockPatient;
};

const fetchPatientSessionsMock = async (patientId: string): Promise<Session[]> => {
  await new Promise(resolve => setTimeout(resolve, 200)); 
  return [
    { id: 's1', patientId, psychologistId: 'psy1', psychologistName: "Dr. Exemplo", startTime: new Date(Date.now() - 1000*60*60*24*7).toISOString(), endTime: new Date(Date.now() - 1000*60*60*24*7 + 1000*60*60).toISOString(), status: 'completed', recurring: 'weekly'},
    { id: 's2', patientId, psychologistId: 'psy1', psychologistName: "Dr. Exemplo", startTime: new Date(Date.now() - 1000*60*60*24*2).toISOString(), endTime: new Date(Date.now() - 1000*60*60*24*2 + 1000*60*60).toISOString(), status: 'scheduled', notes: 'Foco em técnicas de relaxamento.', recurring: 'none'},
  ].sort((a,b) => parseISO(b.startTime).getTime() - parseISO(a.startTime).getTime());
}

const recurrenceLabels: Record<string, string> = {
  daily: "Diária",
  weekly: "Semanal",
  monthly: "Mensal",
  none: "Não se repete"
};

// Prontuário Display Component
const ProntuarioDisplay: React.FC<{ 
  prontuarioData: ProntuarioData | undefined;
  onInitiateSignature: () => void;
  onUploadSignedFile: (file: File) => void;
  onViewSignatureDetails: () => void;
}> = ({ prontuarioData, onInitiateSignature, onUploadSignedFile, onViewSignatureDetails }) => {
  const prontuarioFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUploadTrigger = () => {
    prontuarioFileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUploadSignedFile(file);
      event.target.value = ""; 
    }
  };

  if (!prontuarioData) {
    return <p className="text-muted-foreground p-4 text-center">Nenhum dado de prontuário disponível para este paciente.</p>;
  }

  const { 
    identificacao, entradaUnidade, finalidade, responsavelTecnica, 
    descricaoDemanda, procedimentosAnalise, conclusaoEncaminhamento,
    localAssinatura, dataDocumento, signatureStatus, signatureDetails
  } = prontuarioData;

  return (
    <ScrollArea className="h-[450px] w-full rounded-md border p-4 bg-muted/20 shadow-inner space-y-6">
      {identificacao && (
        <section>
          <h4 className="text-lg font-semibold font-headline mb-2 border-b pb-1">Identificação</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <p><strong>Nome Completo:</strong> {identificacao.nomeCompleto}</p>
            <p><strong>Sexo:</strong> {identificacao.sexo}</p>
            <p><strong>CPF:</strong> {identificacao.cpf}</p>
            <p><strong>Data de Nasc.:</strong> {identificacao.dataNascimento ? format(parseISO(identificacao.dataNascimento), "dd/MM/yyyy", { locale: ptBR }) : 'N/A'}</p>
            {/* ... other identification fields ... */}
             <p><strong>Estado Civil:</strong> {identificacao.estadoCivil}</p>
            <p><strong>Raça/Cor:</strong> {identificacao.racaCor}</p>
            <p><strong>Possui filhos:</strong> {identificacao.possuiFilhos ? `Sim, ${identificacao.quantosFilhos || 0}` : 'Não'}</p>
            <p><strong>Situação profissional:</strong> {identificacao.situacaoProfissional}</p>
            <p><strong>Profissão:</strong> {identificacao.profissao}</p>
            <p><strong>Escolaridade:</strong> {identificacao.escolaridade}</p>
            <p><strong>Renda:</strong> {identificacao.renda}</p>
            <p className="md:col-span-2"><strong>Endereço:</strong> {identificacao.enderecoCasa}</p>
            <p><strong>Telefone:</strong> {identificacao.telefone}</p>
            <p><strong>Contato emergência:</strong> {identificacao.contatoEmergencia}</p>
          </div>
        </section>
      )}

      {entradaUnidade && ( <section><h4 className="text-lg font-semibold font-headline mb-2 border-b pb-1">1.1. Entrada na Unidade</h4><p className="text-sm whitespace-pre-wrap">{entradaUnidade.descricaoEntrada}</p></section> )}
      {finalidade && ( <section><h4 className="text-lg font-semibold font-headline mb-2 border-b pb-1">1.2. Finalidade</h4><p className="text-sm whitespace-pre-wrap">{finalidade.descricaoFinalidade}</p></section> )}
      {responsavelTecnica && ( <section><h4 className="text-lg font-semibold font-headline mb-2 border-b pb-1">1.3. Responsável Técnica</h4><p className="text-sm"><strong>Nome:</strong> {responsavelTecnica.nomePsi}</p><p className="text-sm"><strong>CRP:</strong> {responsavelTecnica.crp}</p></section> )}
      {descricaoDemanda && ( <section><h4 className="text-lg font-semibold font-headline mb-2 border-b pb-1">Descrição da demanda/queixa</h4><p className="text-sm whitespace-pre-wrap">{descricaoDemanda.demandaQueixa}</p></section> )}
      {procedimentosAnalise && procedimentosAnalise.length > 0 && (
        <section>
          <h4 className="text-lg font-semibold font-headline mb-2 border-b pb-1">Procedimento/Análise</h4>
          <ul className="space-y-3">
            {procedimentosAnalise.map((item, index) => (
              <li key={index} className="text-sm border-l-2 border-primary pl-3 py-1">
                <p><strong>Data:</strong> {format(parseISO(item.dataAtendimento), "dd/MM/yyyy", { locale: ptBR })}</p>
                <p className="whitespace-pre-wrap mt-1">{item.descricaoAtuacao}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
      {conclusaoEncaminhamento && ( <section><h4 className="text-lg font-semibold font-headline mb-2 border-b pb-1">Conclusão/Encaminhamento</h4><p className="text-sm whitespace-pre-wrap">{conclusaoEncaminhamento.condutaAdotada}</p></section> )}
      
      <section className="text-xs text-muted-foreground italic pt-4 border-t mt-4">
        <p>Obs: Este documento não poderá ser utilizado para fins diferentes do apontado na finalidade acima, possui caráter sigiloso e trata-se de documento extrajudicial e não responsabilizo-me pelo uso dado ao relatório por parte da pessoa, grupo ou instituição, após a sua entrega em entrevista devolutiva.</p>
      </section>

      {localAssinatura && dataDocumento && responsavelTecnica && (
        <section className="pt-6 text-center text-sm">
          <p>{localAssinatura}, {format(parseISO(dataDocumento), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}.</p>
          <div className="mt-12 border-t-2 border-foreground w-64 mx-auto pt-1">
            <p>{responsavelTecnica.nomePsi}</p>
            <p>Psicóloga(o) {responsavelTecnica.crp}</p>
          </div>
        </section>
      )}
      
      {/* Signature Section */}
      <input 
        type="file" 
        accept=".p7s,.pdf"
        ref={prontuarioFileInputRef} 
        onChange={handleFileChange}
        className="hidden"
      />
      <Separator className="my-4" />
      <section className="space-y-3">
        <h4 className="text-md font-semibold font-headline">Assinatura Digital do Prontuário (Simulado GOV.BR)</h4>
        {(!signatureStatus || signatureStatus === 'none') && (
          <Button onClick={onInitiateSignature} variant="outline">
            <Fingerprint className="mr-2 h-4 w-4 text-blue-500" /> Iniciar Assinatura Digital
          </Button>
        )}
        {signatureStatus === 'pending_govbr_signature' && (
          <div className="p-3 border rounded-md bg-amber-50 border-amber-200 space-y-2">
            <div className="flex items-center text-amber-700">
              <SendToBack className="mr-2 h-5 w-5" />
              <p className="font-medium">Assinatura Pendente</p>
            </div>
            <p className="text-xs text-amber-600">
              O processo de assinatura foi iniciado. Acesse o portal GOV.BR para assinar.
              Após assinar, faça o upload do arquivo .p7s ou PDF assinado abaixo.
            </p>
            <p className="text-xs text-amber-600 font-mono truncate">Hash (simulado): {signatureDetails?.hash || 'N/A'}</p>
            <Button onClick={handleFileUploadTrigger} variant="secondary" size="sm">
              <UploadCloud className="mr-2 h-4 w-4" /> Upload Prontuário Assinado
            </Button>
          </div>
        )}
        {signatureStatus === 'signed' && (
          <div className="p-3 border rounded-md bg-green-50 border-green-200 space-y-2">
             <div className="flex items-center text-green-700">
              <ShieldCheck className="mr-2 h-5 w-5" />
              <p className="font-medium">Prontuário Assinado Digitalmente</p>
            </div>
            <Button onClick={onViewSignatureDetails} variant="link" size="sm" className="p-0 h-auto text-green-700">
              <Eye className="mr-1 h-4 w-4" /> Ver Detalhes da Assinatura
            </Button>
          </div>
        )}
         {signatureStatus === 'verification_failed' && (
          <div className="p-3 border rounded-md bg-red-50 border-red-200 text-red-700">
            <div className="flex items-center">
              <ShieldX className="mr-2 h-5 w-5" />
              <p className="font-medium">Falha na Verificação da Assinatura</p>
            </div>
            <p className="text-xs mt-1">O arquivo de assinatura fornecido não pôde ser validado (simulado).</p>
          </div>
        )}
      </section>
    </ScrollArea>
  );
};

// Dialog for Prontuário Signature Details
interface ProntuarioSignatureDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  details: DocumentSignatureDetails | undefined;
  patientName: string;
}

function ProntuarioSignatureDetailsDialog({ isOpen, onOpenChange, details, patientName }: ProntuarioSignatureDetailsDialogProps) {
  if (!details) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center"><Fingerprint className="mr-2 h-5 w-5 text-primary"/>Detalhes da Assinatura do Prontuário</DialogTitle>
          <DialogDescription>Para o paciente: {patientName}</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2 text-sm">
          <p><strong>Hash (Simulado):</strong> <span className="font-mono text-xs break-all">{details.hash || 'N/A'}</span></p>
          <p><strong>Informações do Assinante (Simulado):</strong> {details.signerInfo || 'N/A'}</p>
          <p><strong>Data da Assinatura (Simulada):</strong> {details.signedAt ? format(parseISO(details.signedAt), "dd/MM/yyyy HH:mm:ss", { locale: ptBR }) : 'N/A'}</p>
          <p><strong>Código de Verificação (Simulado):</strong> {details.verificationCode || 'N/A'}</p>
          {details.p7sFile && <p><strong>Arquivo de Assinatura (.p7s):</strong> {details.p7sFile}</p>}
          {/* No link para documento assinado em prontuário, pois ele é parte do objeto Patient */}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default function PatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;
  const { toast } = useToast();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPatientFormOpen, setIsPatientFormOpen] = useState(false);
  const [isSessionFormOpen, setIsSessionFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [areNotesVisible, setAreNotesVisible] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'prontuario'>('notes');
  const [isProntuarioSigDetailsOpen, setIsProntuarioSigDetailsOpen] = useState(false);


  useEffect(() => {
    let isMounted = true;
    if (patientId) {
      const loadPatientData = async () => {
        setIsLoading(true);
        
        try {
          const cachedPatient = await cacheService.patients.getDetail(patientId);
          if (isMounted && cachedPatient) {
            setPatient(cachedPatient);
          }
        } catch (error) {
          // console.warn(`Error loading patient ${patientId} from cache:`, error);
        }

        try {
          const cachedSessions = await cacheService.patients.getSessions(patientId);
          if (isMounted && cachedSessions) {
            setSessions(cachedSessions.sort((a,b) => parseISO(b.startTime).getTime() - parseISO(a.startTime).getTime()));
          }
        } catch (error) {
          // console.warn(`Error loading sessions for patient ${patientId} from cache:`, error);
        }

        const patientData = await fetchPatientDetailsMock(patientId);
        const sessionsData = await fetchPatientSessionsMock(patientId);

        if (isMounted) {
          if (patientData) {
            setPatient(patientData);
            await cacheService.patients.setDetail(patientId, patientData);
          }
          setSessions(sessionsData.sort((a,b) => parseISO(b.startTime).getTime() - parseISO(a.startTime).getTime()));
          await cacheService.patients.setSessions(patientId, sessionsData);
          setIsLoading(false);
        }
      };
      loadPatientData();
    }
    return () => { isMounted = false; };
  }, [patientId]);

  const updatePatientStateAndCache = useCallback(async (updatedPatient: Patient) => {
    setPatient(updatedPatient);
    await cacheService.patients.setDetail(updatedPatient.id, updatedPatient);
  }, []);

  const handleInitiateProntuarioSignature = useCallback(async () => {
    if (!patient || !patient.prontuario) return;
    const mockHash = `sha256-prontuario-${Math.random().toString(36).substring(2, 15)}`;
    const updatedProntuario: ProntuarioData = {
      ...patient.prontuario,
      signatureStatus: 'pending_govbr_signature',
      signatureDetails: { ...patient.prontuario.signatureDetails, hash: mockHash }
    };
    await updatePatientStateAndCache({ ...patient, prontuario: updatedProntuario, updatedAt: new Date().toISOString() });
    toast({
      title: "Assinatura do Prontuário Iniciada (Simulado)",
      description: `Prontuário preparado. Por favor, 'vá ao portal GOV.BR' para assinar e depois faça o upload do arquivo .p7s ou PDF assinado. Hash (simulado): ${mockHash}`,
      duration: 9000,
    });
  }, [patient, updatePatientStateAndCache, toast]);

  const handleUploadSignedProntuario = useCallback(async (signedFile: File) => {
    if (!patient || !patient.prontuario) return;

    const isValidExtension = signedFile.name.endsWith('.p7s') || signedFile.name.endsWith('.pdf');
    let newStatus: DocumentSignatureStatus = 'signed';
    let newDetails: DocumentSignatureDetails = { ...patient.prontuario.signatureDetails };

    if (!isValidExtension) {
      newStatus = 'verification_failed';
      toast({ title: "Falha na Verificação", description: "Arquivo de assinatura inválido para o prontuário. Use .p7s ou .pdf.", variant: "destructive" });
    } else {
      newDetails = {
        ...patient.prontuario.signatureDetails,
        signerInfo: `CPF Mock Prontuário ${Math.floor(100 + Math.random() * 900)} (Simulado)`,
        signedAt: new Date().toISOString(),
        verificationCode: `GOVBR-PRONT-${Date.now().toString().slice(-6)}`,
        p7sFile: signedFile.name.endsWith('.p7s') ? signedFile.name : undefined,
      };
      toast({ title: "Prontuário Assinado (Simulado)", description: `Prontuário de ${patient.name} foi marcado como assinado.`, className: "bg-primary text-primary-foreground" });
    }
    
    const updatedProntuario: ProntuarioData = { ...patient.prontuario, signatureStatus: newStatus, signatureDetails: newDetails };
    await updatePatientStateAndCache({ ...patient, prontuario: updatedProntuario, updatedAt: new Date().toISOString() });
  }, [patient, updatePatientStateAndCache, toast]);


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

    if (newNotes !== undefined && newNotes !== currentNotes && currentNotes.trim() !== "") {
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
  }, [patient]);

  const handleSaveSession = useCallback(async (sessionData: Partial<Session>) => {
    const psychologistNameMap: Record<string, string> = {
      psy1: 'Dr. Exemplo Silva',
      psy2: 'Dra. Modelo Souza',
    };
    let updatedSessionsList;

    if (editingSession && sessionData.id) {
      updatedSessionsList = sessions.map(s => (s.id === sessionData.id ? { 
          ...s, 
          ...sessionData,
          psychologistName: sessionData.psychologistId ? psychologistNameMap[sessionData.psychologistId] || s.psychologistName : s.psychologistName,
         } as Session : s));
    } else {
      const mainNewSession = { 
        ...sessionData, 
        id: `s-${Date.now()}`, 
        patientId: patientId,
        patientName: patient?.name,
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
            <div>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-5 w-full" />
            </div>
            <Separator />
             <div>
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-20 w-full" />
            </div>
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
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'notes' | 'prontuario')}>
            <div className="flex justify-between items-center mb-3">
              <TabsList>
                <TabsTrigger value="notes" className="font-headline text-sm px-3 py-1.5 h-auto">
                  <FileText className="w-4 h-4 mr-2"/>Anotações de Sessão
                </TabsTrigger>
                <TabsTrigger value="prontuario" className="font-headline text-sm px-3 py-1.5 h-auto">
                   <BookMarked className="w-4 h-4 mr-2"/>Prontuário Psicológico
                </TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                {activeTab === 'notes' && patient.previousSessionNotes && patient.previousSessionNotes.length > 0 && (
                    <Button variant="outline" size="sm" onClick={() => setIsHistoryDialogOpen(true)} disabled={!areNotesVisible}>
                        <History className="w-4 h-4 mr-2" /> Ver Histórico de Anotações
                    </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setAreNotesVisible(!areNotesVisible)}>
                    {areNotesVisible ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    {areNotesVisible ? "Ocultar Detalhes Clínicos" : "Visualizar Detalhes Clínicos"}
                </Button>
              </div>
            </div>

            {!areNotesVisible ? (
              <Alert variant="default" className="bg-muted/40 border-primary/30 mt-2">
                <Lock className="h-5 w-5 text-primary/80" />
                <AlertTitle className="font-headline text-primary/90">Conteúdo Confidencial</AlertTitle>
                <AlertDescription className="text-muted-foreground">
                    Os detalhes clínicos são confidenciais. Clique em "Visualizar Detalhes Clínicos" para exibir o conteúdo.
                    Lembre-se de ocultá-los ao se afastar. (Simulação de segurança)
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <TabsContent value="notes">
                  <h3 className="text-lg font-semibold font-headline mb-2">Anotações de Sessão</h3>
                   <ScrollArea className="h-40 w-full rounded-md border p-3 bg-muted/20 shadow-inner">
                       <pre className="whitespace-pre-wrap text-sm text-foreground font-body leading-relaxed">{patient.sessionNotes || "Nenhuma anotação registrada."}</pre>
                   </ScrollArea>
                </TabsContent>
                <TabsContent value="prontuario">
                   <h3 className="text-lg font-semibold font-headline mb-2">Prontuário Psicológico</h3>
                   <ProntuarioDisplay 
                      prontuarioData={patient.prontuario} 
                      onInitiateSignature={handleInitiateProntuarioSignature}
                      onUploadSignedFile={handleUploadSignedProntuario}
                      onViewSignatureDetails={() => setIsProntuarioSigDetailsOpen(true)}
                    />
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-headline">Histórico de Sessões Agendadas</CardTitle>
            <Button onClick={handleNewSession} size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Nova Sessão
            </Button>
        </CardHeader>
        <CardContent>
            {sessions.length > 0 ? (
                <ScrollArea className="h-72 pr-3">
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
                                        <Badge variant={s.status === 'completed' ? 'secondary' : s.status === 'scheduled' ? 'default' : 'outline'} className="mt-1 text-xs capitalize">
                                            {s.status === 'completed' ? 'Concluída' : s.status === 'scheduled' ? 'Agendada' : s.status}
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
      />

       <Dialog open={isHistoryDialogOpen && areNotesVisible && activeTab === 'notes'} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="font-headline">Histórico de Anotações de Sessão</DialogTitle>
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
                    <pre className="whitespace-pre-wrap text-sm font-body leading-relaxed">{noteVersion.content}</pre>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6">
                <Info className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Nenhum histórico de versões anteriores encontrado para as anotações de sessão.</p>
              </div>
            )}
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHistoryDialogOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {patient?.prontuario && (
        <ProntuarioSignatureDetailsDialog
            isOpen={isProntuarioSigDetailsOpen && areNotesVisible && activeTab === 'prontuario'}
            onOpenChange={setIsProntuarioSigDetailsOpen}
            details={patient.prontuario.signatureDetails}
            patientName={patient.name}
        />
      )}
    </div>
  );
}

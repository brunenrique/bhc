
export type UserRole = "admin" | "psychologist" | "secretary";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  crp?: string; 
}

export interface PatientNoteVersion {
  content: string;
  timestamp: string; // ISO Date string
}

export type DocumentSignatureStatus = 'none' | 'pending_govbr_signature' | 'signed' | 'verification_failed';

export interface DocumentSignatureDetails {
  hash?: string; 
  signerInfo?: string; 
  signedAt?: string; 
  verificationCode?: string; 
  signedDocumentLink?: string; 
  p7sFile?: string; 
}

export interface ProntuarioIdentificacao {
  nomeCompleto?: string;
  sexo?: string;
  cpf?: string;
  dataNascimento?: string; 
  estadoCivil?: string;
  racaCor?: string;
  possuiFilhos?: boolean;
  quantosFilhos?: number;
  situacaoProfissional?: string;
  profissao?: string;
  escolaridade?: string;
  renda?: string;
  enderecoCasa?: string; 
  tipoMoradia?: string; 
  telefone?: string;
  contatoEmergencia?: string;
}

export interface ProntuarioEntradaUnidade {
  descricaoEntrada?: string;
}

export interface ProcedimentoAnaliseEntry {
  entryId: string; // Unique ID for this entry (e.g., timestamp or session ID)
  date: string; // ISO Date string of the session/entry
  content: string; // HTML content of the session notes
}

// ProntuarioData holds the evolving internal prontuário.
export interface ProntuarioData {
  identificacao?: ProntuarioIdentificacao;
  entradaUnidade?: ProntuarioEntradaUnidade; 
  // Static text parts like 'Finalidade' and 'Responsavel Tecnica' can be part of the display template.
  // However, if 'Responsavel Tecnica' needs to be dynamic per patient or over time, store it here.
  // For now, assuming psychologist details from currentUser will be used for display.
  
  demandaQueixaPrincipal?: string; // Initial/overall demand
  procedimentosAnalise?: ProcedimentoAnaliseEntry[]; // Log of session notes
  conclusaoEncaminhamentoGeral?: string; // Overall conclusion/forwarding

  localAssinatura?: string; // e.g., "Santana de Parnaíba"

  signatureStatus?: DocumentSignatureStatus;
  signatureDetails?: DocumentSignatureDetails;
}

export interface TherapeuticGoal {
  id: string;
  description: string;
  status: 'active' | 'achieved' | 'on_hold' | 'discontinued';
  createdAt: string; // ISO Date string
  targetDate?: string; // ISO Date string
  achievedAt?: string; // ISO Date string
  notes?: string;
}

export interface TherapeuticPlan {
  id: string;
  patientId: string;
  overallSummary?: string; 
  goals: TherapeuticGoal[];
  lastUpdatedAt: string; // ISO Date string
}

export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string; 
  address?: string; 
  sessionNotes?: string; // HTML content from RichTextEditor for the CURRENT "Evolução das Sessões"
  previousSessionNotes?: PatientNoteVersion[]; // History of patient.sessionNotes (main editor)
  prontuario?: ProntuarioData; 
  therapeuticPlan?: TherapeuticPlan; 
  caseStudyNotes?: string; // HTML content from RichTextEditor for "Estudo de Caso"
  createdAt: string; 
  updatedAt: string; 
}


export type SessionRecurrence = "none" | "daily" | "weekly" | "monthly";

export interface Session {
  id: string;
  patientId: string;
  patientName?: string; 
  psychologistId: string;
  psychologistName?: string; 
  startTime: string; // ISO Date string
  endTime: string; // ISO Date string
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  recurring?: SessionRecurrence | null;
  notes?: string; // Specific notes for this particular session instance
  isPendingSync?: boolean; 
}

export interface AssessmentResultDetails {
  score: number;
  level: string;
  summary?: string;
  answeredAt?: string; // ISO Date string
  detailedAnswers?: Array<{question: string, answer: string}>;
}
export interface Assessment {
  id:string;
  title: string; 
  patientId: string;
  patientName?: string;
  formLink?: string; 
  status: "pending" | "sent" | "completed";
  results?: AssessmentResultDetails; 
  createdAt: string; // ISO Date string
}

export interface DocumentResource {
  id: string;
  name: string;
  type: "pdf" | "doc" | "docx" | "txt" | "png" | "jpg" | "jpeg" | "other"; 
  url: string; 
  uploadedAt: string; // ISO Date string
  size?: number; // in bytes
  category?: string;
  signatureStatus?: DocumentSignatureStatus;
  signatureDetails?: DocumentSignatureDetails;
}

export interface ChatMessage {
  id: string;
  sender: string; 
  avatar?: string;
  text: string;
  timestamp: Date;
}

export interface Chat {
  id: string;
  name: string;
  type: 'general' | 'private';
  participants?: string[]; 
  avatarUrl?: string; 
}

export interface EvolutionDataPoint {
  date: string; 
  score: number;
  instrumentName: string; 
}

// Data structure for Prontuário template filling (IF it were external, now internal)
// Retaining for potential local templating logic or future re-integration.
export interface ProntuarioGenerationDataDynamic {
  'Descrição da Demanda/Queixa': string;
  'Descrição do Procedimento/Análise': string; 
  'Descrição da Conclusão/Encaminhamento': string;
}

export interface ProntuarioGenerationDataPsicologo {
  'Nome do Psicólogo': string;
  'CRP do Psicólogo': string;
}
export interface ProntuarioGenerationDataData {
  'Dia de Emissão': string;
  'Mês de Emissão': string;
  'Ano de Emissão': string;
  'Data do Atendimento': string; 
}

export interface ProntuarioGenerationDataPaciente {
  'Nome Completo do Paciente'?: string;
  'Sexo do Paciente'?: string;
  'CPF do Paciente'?: string;
  'Data de Nasc. do Paciente'?: string;
  'Estado Civil do Paciente'?: string;
  'Raça/Cor do Paciente'?: string;
  'Status Filhos'?: string; 
  'Quantidade de Filhos'?: string; 
  'Situação Profissional do Paciente'?: string;
  'Profissão do Paciente'?: string;
  'Escolaridade do Paciente'?: string;
  'Renda do Paciente'?: string;
  'Endereço do Paciente'?: string; 
  'Tipo de Moradia'?: string; 
  'Telefone do Paciente'?: string;
  'Contato de Emergência'?: string;
  'Descrição da Entrada na Unidade'?: string; 
}


export interface ProntuarioAppsScriptPayload { 
  paciente: ProntuarioGenerationDataPaciente;
  dinamico: ProntuarioGenerationDataDynamic;
  psicologo: ProntuarioGenerationDataPsicologo;
  data: ProntuarioGenerationDataData;
}

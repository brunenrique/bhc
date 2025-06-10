
export type UserRole = "admin" | "psychologist" | "secretary";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface PatientNoteVersion {
  content: string;
  timestamp: string; // ISO Date string
}

export type DocumentSignatureStatus = 'none' | 'pending_govbr_signature' | 'signed' | 'verification_failed';

export interface DocumentSignatureDetails {
  hash?: string; // SHA-256 hash of the original document
  signerInfo?: string; // e.g., CPF do assinante (mock)
  signedAt?: string; // ISO Date string of when it was marked as signed
  verificationCode?: string; // Mock verification code
  signedDocumentLink?: string; // Link to the (mock) uploaded signed document
  p7sFile?: string; // Name of the .p7s file (mock)
}

export interface ProntuarioIdentificacao {
  nomeCompleto?: string;
  sexo?: string;
  cpf?: string;
  dataNascimento?: string; // ISO Date string
  estadoCivil?: string;
  racaCor?: string;
  possuiFilhos?: boolean;
  quantosFilhos?: number;
  situacaoProfissional?: string;
  profissao?: string;
  escolaridade?: string;
  renda?: string;
  enderecoCasa?: string;
  telefone?: string;
  contatoEmergencia?: string;
}

export interface ProntuarioEntradaUnidade {
  descricaoEntrada?: string;
}

export interface ProntuarioFinalidade {
  descricaoFinalidade?: string;
}

export interface ProntuarioResponsavelTecnica {
  nomePsi?: string;
  crp?: string;
}

export interface ProntuarioDescricaoDemanda {
  demandaQueixa?: string;
}

export interface ProntuarioProcedimentoAnaliseEntry {
  dataAtendimento: string; // ISO Date string
  descricaoAtuacao: string;
}

export interface ProntuarioConclusaoEncaminhamento {
  condutaAdotada?: string;
}

export interface ProntuarioData {
  identificacao?: ProntuarioIdentificacao;
  entradaUnidade?: ProntuarioEntradaUnidade;
  finalidade?: ProntuarioFinalidade;
  responsavelTecnica?: ProntuarioResponsavelTecnica;
  descricaoDemanda?: ProntuarioDescricaoDemanda;
  procedimentosAnalise?: ProntuarioProcedimentoAnaliseEntry[];
  conclusaoEncaminhamento?: ProntuarioConclusaoEncaminhamento;
  localAssinatura?: string;
  dataDocumento?: string; // ISO Date string for when the prontuario was "finalized"
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
  overallSummary?: string; // Brief summary of the plan's focus
  goals: TherapeuticGoal[];
  lastUpdatedAt: string; // ISO Date string
}

export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string; // ISO Date string (YYYY-MM-DD)
  address?: string;
  sessionNotes?: string; // To be renamed to "Evolução das Sessões" in UI
  previousSessionNotes?: PatientNoteVersion[];
  prontuario?: ProntuarioData;
  therapeuticPlan?: TherapeuticPlan; // New field for PTI
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}


export type SessionRecurrence = "none" | "daily" | "weekly" | "monthly";

export interface Session {
  id: string;
  patientId: string;
  patientName?: string; // For display convenience
  psychologistId: string;
  psychologistName?: string; // For display convenience
  startTime: string; // ISO Date string
  endTime: string; // ISO Date string
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  recurring?: SessionRecurrence | null;
  notes?: string; // Potentially encrypted
  isPendingSync?: boolean; // For offline mode
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
  title: string; // This can serve as instrumentName
  patientId: string;
  patientName?: string;
  formLink?: string; // Tokenized link
  status: "pending" | "sent" | "completed";
  results?: AssessmentResultDetails; // Structure of results can vary
  createdAt: string; // ISO Date string
}

export interface DocumentResource {
  id: string;
  name: string;
  type: "pdf" | "doc" | "docx" | "txt" | "png" | "jpg" | "jpeg" | "other"; // Expanded
  url: string; // Link to the stored file (original, unsigned)
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

// Data point for evolution chart
export interface EvolutionDataPoint {
  date: string; // ISO Date string (from assessment createdAt)
  score: number;
  instrumentName: string; // Title of the assessment
}

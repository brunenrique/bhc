
export type UserRole = "admin" | "psychologist" | "secretary" | "scheduling";

export interface User {
  id: string; // UID from Firebase Auth
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  crp?: string; // Specific to psychologists
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
  entryId: string;
  date: string; // ISO Date string of the session/entry
  content: string; // HTML content of the session notes
}

export interface ProntuarioData {
  identificacao?: ProntuarioIdentificacao;
  entradaUnidade?: ProntuarioEntradaUnidade;
  demandaQueixaPrincipal?: string;
  procedimentosAnalise?: ProcedimentoAnaliseEntry[];
  conclusaoEncaminhamentoGeral?: string;
  localAssinatura?: string;
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

export interface PatientAttachment {
  id: string; // Firestore document ID
  fileUniqueId: string; // Unique ID used in Storage path (e.g., a UUID)
  filename: string; // Original filename
  size: number; // in bytes
  type: string; // MIME type
  url: string; // Firebase Storage download URL
  storagePath: string; // Full path in Firebase Storage, e.g., attachments/{patientId}/{fileUniqueId}
  uploadedBy: string; // UID of the uploader
  uploadedAt: string; // ISO string for client, ServerTimestamp for Firestore write
}

export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  assignedTo?: string; // Psychologist's UID assigned to this patient
  sessionNotes?: string;
  previousSessionNotes?: PatientNoteVersion[];
  prontuario?: ProntuarioData;
  therapeuticPlan?: TherapeuticPlan;
  caseStudyNotes?: string;
  attachments?: PatientAttachment[]; // Embedded for quick display, actual list from subcollection
  createdAt: string;
  updatedAt: string;
}


export type SessionRecurrence = "none" | "daily" | "weekly" | "monthly";

export interface Session {
  id: string;
  patientId: string;
  patientName?: string;
  psychologistId: string; // UID of the psychologist conducting the session
  psychologistName?: string;
  startTime: string; // ISO Date string
  endTime: string; // ISO Date string
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  recurring?: SessionRecurrence | null;
  notes?: string; // Main clinical note by psychologist
  insightsAI?: string[]; // AI-generated insights based on the note
  templateUsado?: string; // Name/ID of the AI template used
  createdAt: string; // ISO Date string when session record was created
  isPendingSync?: boolean;
}

// Mock Firestore Timestamp structure for typing purposes
export interface MockTimestamp {
  seconds: number;
  nanoseconds: number;
  toDate: () => Date;
}

export interface FirestoreSessionData {
  id: string; // Firestore document ID
  pacienteId: string;
  psicologoId: string;
  data: MockTimestamp; // Using MockTimestamp for compatibility if Firebase SDK isn't fully used
  status: "agendada" | "concluída" | "cancelada";
  titulo?: string;
  // For constructing titles, we might need patient/psychologist names
  // These might be fetched separately or denormalized in Firestore documents
  patientName?: string;
  psychologistName?: string;
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

export interface WaitingListEntry {
  id: string;
  nomeCompleto: string;       // Nome completo conforme documento oficial
  cpf: string;                // formato: 999.999.999-99 (validação obrigatória)
  contato: string;            // telefone no formato internacional +5511999999999
  motivo?: string;             // opcional ou texto livre
  prioridade: "urgente" | "normal";
  criadoEm: string;           // ISO Date string (Firebase Timestamp on server)
  criadoPor: string;          // UID do usuário que adicionou
  status: "pendente" | "agendado" | "removido";
}


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

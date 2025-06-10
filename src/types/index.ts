
export type UserRole = "admin" | "psychologist" | "secretary";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  crp?: string; // Added for psychologist's CRP
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
  enderecoCasa?: string; // Full address string
  // "Casa" from template likely means "Tipo de Moradia", might need specific field or be part of address.
  tipoMoradia?: string; 
  telefone?: string;
  contatoEmergencia?: string;
}

export interface ProntuarioEntradaUnidade {
  descricaoEntrada?: string;
}

export interface ProntuarioFinalidade {
  // This is static in the template, so likely not part of dynamic data.
  // descricaoFinalidade?: string; 
}

export interface ProntuarioResponsavelTecnica {
  // Will come from the logged-in psychologist, not stored per patient prontuario data.
  // nomePsi?: string;
  // crp?: string;
}

export interface ProntuarioDescricaoDemanda {
  // This will be dynamic input for generation
  // demandaQueixa?: string;
}

export interface ProntuarioProcedimentoAnaliseEntry {
  // This will be dynamic input for generation
  // dataAtendimento: string; // ISO Date string
  // descricaoAtuacao: string;
}

export interface ProntuarioConclusaoEncaminhamento {
  // This will be dynamic input for generation
  // condutaAdotada?: string;
}

// This ProntuarioData now primarily holds the patient's identification details
// that are relatively static and used to pre-fill the generation prompt.
// The session-specific parts (demanda, procedimento, conclusao) will be entered
// at the time of generation.
export interface ProntuarioData {
  identificacao?: ProntuarioIdentificacao;
  entradaUnidade?: ProntuarioEntradaUnidade; 
  // finalidade, responsavelTecnica, descricaoDemanda, procedimentosAnalise, conclusaoEncaminhamento
  // are more part of the *generated document structure* than stored patient data if generation is the primary flow.
  // However, entradaUnidade might be static patient info.
  localAssinatura?: string; // e.g., "Santana de Parnaíba" - could be clinic setting
  // dataDocumento will be set at generation time.
  // signatureStatus and signatureDetails are for the *in-app* signing simulation.
  // If the Google Doc is the "official" signed prontuario, these might be less relevant here.
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
  dateOfBirth?: string; // ISO Date string (YYYY-MM-DD) - Consider moving to ProntuarioIdentificacao
  address?: string; // Consider moving to ProntuarioIdentificacao
  sessionNotes?: string; 
  previousSessionNotes?: PatientNoteVersion[];
  prontuario?: ProntuarioData; // Holds static patient info for the prontuario
  therapeuticPlan?: TherapeuticPlan; 
  caseStudyNotes?: string; 
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
  notes?: string; 
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

// Data structure for sending to Google Apps Script
export interface ProntuarioGenerationDataDynamic {
  'Descrição da Demanda/Queixa': string;
  'Descrição do Procedimento/Análise': string; // For a single session context
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
  'Data do Atendimento': string; // Date of the session being documented
}

// This maps to the placeholder keys in your PROMPT_TEMPLATE for patient info
export interface ProntuarioGenerationDataPaciente {
  'Nome Completo do Paciente'?: string;
  'Sexo do Paciente'?: string;
  'CPF do Paciente'?: string;
  'Data de Nasc. do Paciente'?: string;
  'Estado Civil do Paciente'?: string;
  'Raça/Cor do Paciente'?: string;
  'Status Filhos'?: string; // e.g., "Sim" or "Não"
  'Quantidade de Filhos'?: string; // e.g., "1" or "0"
  'Situação Profissional do Paciente'?: string;
  'Profissão do Paciente'?: string;
  'Escolaridade do Paciente'?: string;
  'Renda do Paciente'?: string;
  'Endereço do Paciente'?: string; // Was 'Endereço:', if this is house address use patient.prontuario.identificacao.enderecoCasa
  'Tipo de Moradia'?: string; // Was 'Casa:'
  'Telefone do Paciente'?: string;
  'Contato de Emergência'?: string;
  'Descrição da Entrada na Unidade'?: string; // From patient.prontuario.entradaUnidade.descricaoEntrada
}


export interface ProntuarioAppsScriptPayload {
  paciente: ProntuarioGenerationDataPaciente;
  dinamico: ProntuarioGenerationDataDynamic;
  psicologo: ProntuarioGenerationDataPsicologo;
  data: ProntuarioGenerationDataData;
}

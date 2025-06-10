
export type UserRole = "admin" | "psychologist" | "secretary";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string; // ISO Date string (YYYY-MM-DD)
  address?: string;
  sessionNotes?: string;
  previousSessionNotes?: PatientNoteVersion[];
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}

export interface PatientNoteVersion {
  content: string;
  timestamp: string; // ISO Date string
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
}

export interface Assessment {
  id:string;
  title: string;
  patientId: string;
  patientName?: string;
  formLink?: string; // Tokenized link
  status: "pending" | "sent" | "completed";
  results?: Record<string, any>; // Structure of results can vary
  createdAt: string; // ISO Date string
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

export interface ChatMessage { // Renamed from Message to avoid conflict if Message is used elsewhere
  id: string;
  sender: string; // 'me' or user ID/name
  avatar?: string;
  text: string;
  timestamp: Date;
}

export interface Chat {
  id: string;
  name: string;
  type: 'general' | 'private';
  participants?: string[]; // For private chats, user IDs
  avatarUrl?: string; // For direct chat with a user (e.g., the other user's avatar)
}

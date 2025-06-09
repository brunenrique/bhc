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
  dateOfBirth?: string;
  address?: string;
  // Encrypted notes would be handled server-side or with a library
  // For UI purposes, we might just have a string field
  sessionNotes?: string; 
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  patientId: string;
  patientName?: string; // For display convenience
  psychologistId: string;
  psychologistName?: string; // For display convenience
  startTime: string; // ISO Date string
  endTime: string; // ISO Date string
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  recurring?: "daily" | "weekly" | "monthly" | null;
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
  createdAt: string;
}

export interface DocumentResource {
  id: string;
  name: string;
  type: "pdf" | "doc" | "txt" | "other"; // Simplified
  url: string; // Link to the stored file
  uploadedAt: string;
  size?: number; // in bytes
}

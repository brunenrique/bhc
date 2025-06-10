
"use client"; // idb-keyval is client-side only

import { get, set, del, clear, createStore } from 'idb-keyval';
import type { Patient, Session, DocumentResource, Assessment } from '@/types';

// Create a custom store for PsiGuard data
const psiguardStore = createStore('psiguard-db', 'psiguard-store');

export const CACHE_KEYS = {
  PATIENTS_LIST: 'patients_list',
  PATIENT_DETAIL: (id: string) => `patient_detail_${id}`,
  PATIENT_SESSIONS: (patientId: string) => `patient_sessions_${patientId}`,
  SESSIONS_LIST: 'sessions_list',
  DOCUMENTS_LIST: 'documents_list',
  ASSESSMENTS_LIST: 'assessments_list',
  ADMIN_METRICS_SUMMARY: 'admin_metrics_summary',
  // Add more keys as needed
};

async function getFromCache<T>(key: string): Promise<T | undefined> {
  if (typeof window === 'undefined') return undefined;
  try {
    return await get<T>(key, psiguardStore);
  } catch (error) {
    console.warn(`Error reading from cache (key: ${key}):`, error);
    return undefined;
  }
}

async function setInCache<T>(key: string, value: T): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await set(key, value, psiguardStore);
  } catch (error) {
    console.warn(`Error writing to cache (key: ${key}):`, error);
  }
}

async function deleteFromCache(key: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await del(key, psiguardStore);
  } catch (error) {
    console.warn(`Error deleting from cache (key: ${key}):`, error);
  }
}

async function clearCache(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await clear(psiguardStore);
    console.log('PsiGuard cache cleared.');
  } catch (error) {
    console.warn('Error clearing cache:', error);
  }
}

// Specific cache functions (examples, expand as needed)

// Patients
export const getCachedPatientsList = () => getFromCache<Patient[]>(CACHE_KEYS.PATIENTS_LIST);
export const setCachedPatientsList = (patients: Patient[]) => setInCache(CACHE_KEYS.PATIENTS_LIST, patients);

export const getCachedPatientDetail = (id: string) => getFromCache<Patient>(CACHE_KEYS.PATIENT_DETAIL(id));
export const setCachedPatientDetail = (id: string, patient: Patient) => setInCache(CACHE_KEYS.PATIENT_DETAIL(id), patient);

export const getCachedPatientSessions = (patientId: string) => getFromCache<Session[]>(CACHE_KEYS.PATIENT_SESSIONS(patientId));
export const setCachedPatientSessions = (patientId: string, sessions: Session[]) => setInCache(CACHE_KEYS.PATIENT_SESSIONS(patientId), sessions);

// Sessions
export const getCachedSessionsList = () => getFromCache<Session[]>(CACHE_KEYS.SESSIONS_LIST);
export const setCachedSessionsList = (sessions: Session[]) => setInCache(CACHE_KEYS.SESSIONS_LIST, sessions);

// Documents
export const getCachedDocumentsList = () => getFromCache<DocumentResource[]>(CACHE_KEYS.DOCUMENTS_LIST);
export const setCachedDocumentsList = (documents: DocumentResource[]) => setInCache(CACHE_KEYS.DOCUMENTS_LIST, documents);

// Assessments
export const getCachedAssessmentsList = () => getFromCache<Assessment[]>(CACHE_KEYS.ASSESSMENTS_LIST);
export const setCachedAssessmentsList = (assessments: Assessment[]) => setInCache(CACHE_KEYS.ASSESSMENTS_LIST, assessments);

// Admin Metrics (example for summary data)
interface AdminMetricsSummary {
  totalPatients: number | null;
  avgTimeBetweenSessions: string | null;
}
export const getCachedAdminMetricsSummary = () => getFromCache<AdminMetricsSummary>(CACHE_KEYS.ADMIN_METRICS_SUMMARY);
export const setCachedAdminMetricsSummary = (summary: AdminMetricsSummary) => setInCache(CACHE_KEYS.ADMIN_METRICS_SUMMARY, summary);


export const cacheService = {
  get: getFromCache,
  set: setInCache,
  del: deleteFromCache,
  clearAll: clearCache,
  keys: CACHE_KEYS,
  // Add specific getters/setters here for convenience if desired
  patients: {
    getList: getCachedPatientsList,
    setList: setCachedPatientsList,
    getDetail: getCachedPatientDetail,
    setDetail: setCachedPatientDetail,
    getSessions: getCachedPatientSessions,
    setSessions: setCachedPatientSessions,
  },
  sessions: {
    getList: getCachedSessionsList,
    setList: setCachedSessionsList,
  },
  documents: {
    getList: getCachedDocumentsList,
    setList: setCachedDocumentsList,
  },
  assessments: {
    getList: getCachedAssessmentsList,
    setList: setCachedAssessmentsList,
  },
   adminMetrics: {
    getSummary: getCachedAdminMetricsSummary,
    setSummary: setCachedAdminMetricsSummary,
  }
};

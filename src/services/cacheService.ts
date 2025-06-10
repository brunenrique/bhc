
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
  PENDING_SESSIONS_LIST: 'pending_sessions_list', // For sessions created/updated offline
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
    // console.warn(`Error reading from cache (key: ${key}):`, error);
    return undefined;
  }
}

async function setInCache<T>(key: string, value: T): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await set(key, value, psiguardStore);
  } catch (error) {
    // console.warn(`Error writing to cache (key: ${key}):`, error);
  }
}

async function deleteFromCache(key: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await del(key, psiguardStore);
  } catch (error) {
    // console.warn(`Error deleting from cache (key: ${key}):`, error);
  }
}

async function clearCache(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await clear(psiguardStore);
    // console.log('PsiGuard cache cleared.');
  } catch (error) {
    // console.warn('Error clearing cache:', error);
  }
}

// Specific cache functions

// Patients
const getCachedPatientsList = () => getFromCache<Patient[]>(CACHE_KEYS.PATIENTS_LIST);
const setCachedPatientsList = (patients: Patient[]) => setInCache(CACHE_KEYS.PATIENTS_LIST, patients);

const getCachedPatientDetail = (id: string) => getFromCache<Patient>(CACHE_KEYS.PATIENT_DETAIL(id));
const setCachedPatientDetail = (id: string, patient: Patient) => setInCache(CACHE_KEYS.PATIENT_DETAIL(id), patient);

const getCachedPatientSessions = (patientId: string) => getFromCache<Session[]>(CACHE_KEYS.PATIENT_SESSIONS(patientId));
const setCachedPatientSessions = (patientId: string, sessions: Session[]) => setInCache(CACHE_KEYS.PATIENT_SESSIONS(patientId), sessions);

// Sessions (main list)
const getCachedSessionsList = () => getFromCache<Session[]>(CACHE_KEYS.SESSIONS_LIST);
const setCachedSessionsList = (sessions: Session[]) => setInCache(CACHE_KEYS.SESSIONS_LIST, sessions);

// Pending Sessions (for offline sync)
const getCachedPendingSessionsList = () => getFromCache<Session[]>(CACHE_KEYS.PENDING_SESSIONS_LIST);
const setCachedPendingSessionsList = (sessions: Session[]) => setInCache(CACHE_KEYS.PENDING_SESSIONS_LIST, sessions);

const addOrUpdatePendingSession = async (session: Session) => {
  const pendingSessions = await getCachedPendingSessionsList() || [];
  const existingIndex = pendingSessions.findIndex(s => s.id === session.id);
  if (existingIndex > -1) {
    pendingSessions[existingIndex] = session;
  } else {
    pendingSessions.push(session);
  }
  await setCachedPendingSessionsList(pendingSessions);
};

const removePendingSession = async (sessionId: string) => {
  const pendingSessions = await getCachedPendingSessionsList() || [];
  const updatedSessions = pendingSessions.filter(s => s.id !== sessionId);
  await setCachedPendingSessionsList(updatedSessions);
};

const clearPendingSessionsList = () => setCachedPendingSessionsList([]);


// Documents
const getCachedDocumentsList = () => getFromCache<DocumentResource[]>(CACHE_KEYS.DOCUMENTS_LIST);
const setCachedDocumentsList = (documents: DocumentResource[]) => setInCache(CACHE_KEYS.DOCUMENTS_LIST, documents);

// Assessments
const getCachedAssessmentsList = () => getFromCache<Assessment[]>(CACHE_KEYS.ASSESSMENTS_LIST);
const setCachedAssessmentsList = (assessments: Assessment[]) => setInCache(CACHE_KEYS.ASSESSMENTS_LIST, assessments);

// Admin Metrics
interface AdminMetricsSummary {
  totalPatients: number | null;
  avgTimeBetweenSessions: string | null;
}
const getCachedAdminMetricsSummary = () => getFromCache<AdminMetricsSummary>(CACHE_KEYS.ADMIN_METRICS_SUMMARY);
const setCachedAdminMetricsSummary = (summary: AdminMetricsSummary) => setInCache(CACHE_KEYS.ADMIN_METRICS_SUMMARY, summary);


export const cacheService = {
  get: getFromCache,
  set: setInCache,
  del: deleteFromCache,
  clearAll: clearCache,
  keys: CACHE_KEYS,
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
  pendingSessions: {
    getList: getCachedPendingSessionsList,
    setList: setCachedPendingSessionsList,
    addOrUpdate: addOrUpdatePendingSession,
    remove: removePendingSession,
    clear: clearPendingSessionsList,
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

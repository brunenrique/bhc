"use client";
import { collection, addDoc, updateDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { FIRESTORE_COLLECTIONS } from '@/lib/firestore-collections';
import type { Assessment } from '@/types/assessment';

/**
 * Creates a new assessment document in Firestore.
 *
 * @param data - Assessment data without id and timestamps.
 * @returns The id of the newly created assessment.
 */
export async function createAssessment(data: Omit<Assessment, 'id' | 'createdAt' | 'completedAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, FIRESTORE_COLLECTIONS.ASSESSMENTS), {
    ...data,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

/**
 * Updates an assessment with the submitted responses.
 *
 * @param assessmentId - The id of the assessment document.
 * @param responses - Answers keyed by question id.
 */
export async function submitAssessmentResponses(assessmentId: string, responses: Record<string, unknown>): Promise<void> {
  await updateDoc(doc(db, FIRESTORE_COLLECTIONS.ASSESSMENTS, assessmentId), {
    responses,
    status: 'completed',
    completedAt: new Date().toISOString(),
  });
}

/**
 * Retrieves all assessments assigned to a patient.
 *
 * @param patientId - Patient identifier.
 * @returns List of assessments for the patient.
 */
export async function getAssessmentsByPatient(patientId: string): Promise<Assessment[]> {
  const q = query(collection(db, FIRESTORE_COLLECTIONS.ASSESSMENTS), where('patientId', '==', patientId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Assessment, 'id'>) }));
}

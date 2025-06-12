import type { Appointment, AppointmentsByDate } from '@/types/appointment';
import { db } from './firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';

export function hasScheduleConflict(
  appointments: AppointmentsByDate,
  dateKey: string,
  startTime: string,
  endTime: string,
  psychologistId: string,
  isBlockTime: boolean
): boolean {
  const existing = appointments[dateKey] || [];
  return existing.some((appt) => {
    if (appt.psychologistId !== psychologistId) return false;
    if (appt.status === 'CancelledByPatient' || appt.status === 'CancelledByClinic') {
      return false;
    }
    if (!isBlockTime && appt.type === 'Blocked Slot') {
      // Bloqueio impede consulta
      return startTime < appt.endTime && endTime > appt.startTime;
    }
    return startTime < appt.endTime && endTime > appt.startTime;
  });
}

const collectionName = 'appointments';

export interface AppointmentDoc extends Appointment {
  date: string;
  patientId?: string;
  prefilledPatientName?: string;
}

export async function listAppointments(): Promise<AppointmentDoc[]> {
  const snap = await getDocs(collection(db, collectionName));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<AppointmentDoc,'id'>) }));
}

export async function getAppointmentById(id: string): Promise<AppointmentDoc | undefined> {
  const ref = doc(db, collectionName, id);
  const snap = await getDoc(ref);
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as Omit<AppointmentDoc,'id'>) }) : undefined;
}

export async function createAppointment(data: Omit<AppointmentDoc, 'id'>): Promise<AppointmentDoc> {
  const docRef = await addDoc(collection(db, collectionName), data);
  return { id: docRef.id, ...data };
}

export async function updateAppointment(id: string, data: Partial<AppointmentDoc>): Promise<void> {
  await updateDoc(doc(db, collectionName, id), data);
}

export async function deleteAppointment(id: string): Promise<void> {
  await deleteDoc(doc(db, collectionName, id));
}

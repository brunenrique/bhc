import { db } from './firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dob?: string;
  address?: string;
  avatarUrl?: string;
  lastSession?: string | null;
  nextAppointment?: string | null;
}

const collectionName = 'patients';

export async function listPatients(): Promise<Patient[]> {
  const snap = await getDocs(collection(db, collectionName));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Patient,'id'>) }));
}

export async function createPatient(data: Omit<Patient, 'id'>): Promise<Patient> {
  const docRef = await addDoc(collection(db, collectionName), data);
  return { id: docRef.id, ...data };
}

export async function updatePatient(id: string, data: Partial<Patient>): Promise<void> {
  await updateDoc(doc(db, collectionName, id), data);
}

export async function deletePatient(id: string): Promise<void> {
  await deleteDoc(doc(db, collectionName, id));
}

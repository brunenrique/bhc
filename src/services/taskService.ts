'use client';

import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FIRESTORE_COLLECTIONS } from '@/lib/firestore-collections';
import type { Task } from '@/types';
import { format } from 'date-fns';

export async function getTasks(): Promise<Task[]> {
  const q = query(collection(db, FIRESTORE_COLLECTIONS.TASKS), orderBy('dueDate'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Task, 'id'>) }));
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  const docSnap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.TASKS, id));
  return docSnap.exists() ? { id: docSnap.id, ...(docSnap.data() as Omit<Task, 'id'>) } : undefined;
}

export async function getTasksForDate(date: Date): Promise<Task[]> {
  const dateStr = format(date, 'yyyy-MM-dd');
  const q = query(collection(db, FIRESTORE_COLLECTIONS.TASKS), where('dueDate', '==', dateStr));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Task, 'id'>) }));
}

export async function createTask(data: Omit<Task, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, FIRESTORE_COLLECTIONS.TASKS), data);
  return docRef.id;
}

export async function updateTask(id: string, updates: Partial<Omit<Task, 'id'>>): Promise<void> {
  await updateDoc(doc(db, FIRESTORE_COLLECTIONS.TASKS, id), updates);
}

export async function deleteTask(id: string): Promise<void> {
  await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.TASKS, id));
}

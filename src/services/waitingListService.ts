'use client';

import { db } from '@/lib/firebase';
import { FIRESTORE_COLLECTIONS } from '@/lib/firestore-collections';
import type { WaitingListEntry } from '@/types';
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';

export async function getWaitingList(): Promise<WaitingListEntry[]> {
  const q = query(collection(db, FIRESTORE_COLLECTIONS.WAITING_LIST), orderBy('dateAdded', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WaitingListEntry, 'id'>) }));
}

export async function getWaitingListEntryById(id: string): Promise<WaitingListEntry | undefined> {
  const docSnap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.WAITING_LIST, id));
  return docSnap.exists()
    ? { id: docSnap.id, ...(docSnap.data() as Omit<WaitingListEntry, 'id'>) }
    : undefined;
}

export async function createWaitingListEntry(
  data: Omit<WaitingListEntry, 'id' | 'dateAdded'>
): Promise<string> {
  const docRef = await addDoc(collection(db, FIRESTORE_COLLECTIONS.WAITING_LIST), {
    ...data,
    dateAdded: new Date().toISOString(),
  });
  return docRef.id;
}

export async function updateWaitingListEntry(
  id: string,
  data: Partial<Omit<WaitingListEntry, 'id' | 'dateAdded'>>
): Promise<void> {
  await updateDoc(doc(db, FIRESTORE_COLLECTIONS.WAITING_LIST, id), data);
}

export async function deleteWaitingListEntry(id: string): Promise<void> {
  await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.WAITING_LIST, id));
}

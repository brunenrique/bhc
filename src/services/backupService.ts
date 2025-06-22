'use client';
/* eslint-disable no-unused-vars */

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FIRESTORE_COLLECTIONS } from '@/lib/firestore-collections';

export type BackupStatus = 'Bem-sucedido' | 'Em Progresso' | 'Falhou';
export type BackupType = 'Automático' | 'Manual';

export interface BackupHistoryEntry {
  id: string;
  timestamp: string;
  type: BackupType;
  status: BackupStatus;
  size: string;
  destination: string;
}

export interface BackupSettings {
  frequency: 'daily' | 'weekly';
  dayOfWeek?: number; // 0 Sunday - 6 Saturday
  destination: string;
}

export async function getBackupSettings(): Promise<BackupSettings | null> {
  const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.BACKUP_SETTINGS, 'default'));
  return snap.exists() ? (snap.data() as BackupSettings) : null;
}

export async function saveBackupSettings(settings: BackupSettings): Promise<void> {
  await setDoc(doc(db, FIRESTORE_COLLECTIONS.BACKUP_SETTINGS, 'default'), settings, {
    merge: true,
  });
}

export function listenBackupHistory(
  callbackFn: (_history: BackupHistoryEntry[]) => void
): Unsubscribe {
  const q = query(collection(db, FIRESTORE_COLLECTIONS.BACKUPS), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<BackupHistoryEntry, 'id'>),
    }));
    callbackFn(data);
  });
}

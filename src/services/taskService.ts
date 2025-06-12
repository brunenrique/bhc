"use client";

import type { Task } from "@/types";
import { db } from "./firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, getDoc, query, where } from "firebase/firestore";

const collectionName = 'tasks';

export async function listTasks(): Promise<Task[]> {
  const snap = await getDocs(collection(db, collectionName));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Task,'id'>) }));
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  const ref = doc(db, collectionName, id);
  const snap = await getDoc(ref);
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as Omit<Task,'id'>) }) : undefined;
}

export async function listTasksForDate(date: Date): Promise<Task[]> {
  const dateStr = date.toISOString().slice(0,10);
  const q = query(collection(db, collectionName), where('dueDate', '==', dateStr));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Task,'id'>) }));
}

export async function createTask(data: Omit<Task, 'id'>): Promise<Task> {
  const docRef = await addDoc(collection(db, collectionName), data);
  return { id: docRef.id, ...data };
}

export async function updateTask(id: string, data: Partial<Task>): Promise<void> {
  await updateDoc(doc(db, collectionName, id), data);
}

export async function deleteTask(id: string): Promise<void> {
  await deleteDoc(doc(db, collectionName, id));
}

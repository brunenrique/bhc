'use client';

import { auth } from './firebase';
import { getIdTokenResult } from 'firebase/auth';

export type UserRole = 'Admin' | 'Psychologist' | 'Secretary';

/**
 * Obtains the role of the currently authenticated user.
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    const tokenResult = await getIdTokenResult(user, true);
    return (tokenResult.claims.role as UserRole) || null;
  } catch (err) {
    console.error('Failed to get user role', err);
    return null;
  }
}

/**
 * Checks if the current user has one of the required roles.
 */
export async function checkUserRole(required: UserRole | UserRole[]): Promise<boolean> {
  const role = await getCurrentUserRole();
  if (!role) return false;
  const roles = Array.isArray(required) ? required : [required];
  return roles.includes(role);
}

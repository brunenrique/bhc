import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { useChatStore } from '@/stores/chatStore';

export interface AuthUser {
  uid: string | null;
  displayName: string | null;
  avatarUrl?: string | null;
  role?: string;
}

/**
 * Hook that exposes the authenticated user and keeps the global store updated.
 */
export default function useAuth() {
  const { currentUser, setCurrentUser } = useChatStore();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setCurrentUser({
          uid: u.uid,
          displayName: u.displayName || 'Usuário Anônimo',
          avatarUrl: u.photoURL,
        });
      } else {
        setCurrentUser({ uid: null, displayName: null, avatarUrl: null });
      }
    });
    return () => unsub();
  }, [setCurrentUser]);

  let user: AuthUser;
  if (currentUser.uid) {
    user = { ...currentUser, role: 'admin' };
  } else if (process.env.NODE_ENV === 'development') {
    user = {
      uid: 'mock-user',
      displayName: 'Usuário Demo',
      avatarUrl: 'https://placehold.co/40x40',
      role: 'admin',
    };
  } else {
    user = { uid: null, displayName: null, avatarUrl: null };
  }

  return { user };
}

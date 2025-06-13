import { useEffect, useState } from 'react';
import { listenToNotifications, Notification } from '@/services/notificationService';
import { auth } from '@/services/firebase';
import useAuth from './use-auth';

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    const uid = userId || user.uid;
    if (!uid) { setLoading(false); return; }
    const unsub = listenToNotifications(uid, list => {
      setNotifications(list);
      setLoading(false);
    });
    return () => unsub();
  }, [userId, user.uid]);

  return { notifications, loading };
}

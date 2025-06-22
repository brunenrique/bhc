export const FIRESTORE_COLLECTIONS = {
  USERS: 'users',
  PATIENTS: 'patients',
  APPOINTMENTS: 'appointments',
  ASSESSMENTS: 'assessments',
  TASKS: 'tasks',
  WAITING_LIST: 'waitingList',
  CHATS: 'chats',
  NOTIFICATIONS: 'notifications',
  FCM_TOKENS: 'fcmTokens',
  MESSAGES: 'messages',
} as const;

export type FirestoreCollectionKeys = keyof typeof FIRESTORE_COLLECTIONS;

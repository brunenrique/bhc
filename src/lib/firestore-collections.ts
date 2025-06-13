export const FIRESTORE_COLLECTIONS = {
  USERS: 'users',
  PATIENTS: 'patients',
  APPOINTMENTS: 'appointments',
  ASSESSMENTS: 'assessments',
  TASKS: 'tasks',
  CHATS: 'chats',
  NOTIFICATIONS: 'notifications',
  FCM_TOKENS: 'fcmTokens',
  MESSAGES: 'messages',
} as const;

export type FirestoreCollectionKeys = keyof typeof FIRESTORE_COLLECTIONS;

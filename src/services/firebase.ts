
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, type FirebaseStorage } from 'firebase/storage';
import { getMessaging, type Messaging } from 'firebase/messaging';
// Para Functions, se for usar diretamente no cliente no futuro:
// import { getFunctions, connectFunctionsEmulator, type Functions } from 'firebase/functions';

/** Firebase configuration used to initialise the client SDK. */
let firebaseConfig;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

if (process.env.NODE_ENV === 'development') {
  // Configuração para desenvolvimento, priorizando o uso de emuladores.
  // Usamos placeholders para a maioria das chaves, mas tentamos usar o projectId real se disponível.
  firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX_placeholder", // Placeholder API Key
    authDomain: `${projectId || 'demo-psiguard'}.firebaseapp.com`,
    projectId: projectId || "demo-psiguard", // Use o Project ID real se configurado, ou um placeholder
    storageBucket: `${projectId || 'demo-psiguard'}.appspot.com`,
    messagingSenderId: "000000000000_placeholder", // Placeholder
    appId: "1:000000000000:web:placeholderxxxxxxxxxxxxxx", // Placeholder
  };
  console.info('Development mode: Initializing Firebase with placeholder config before connecting to emulators.');
} else {
  // Configuração de Produção
  firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);
let messaging: Messaging | null = null;
if (typeof window !== 'undefined') {
  messaging = getMessaging(app);
}
// const functions: Functions = getFunctions(app); // Descomente se for usar Functions no cliente

if (process.env.NODE_ENV === 'development') {
  console.info('Development mode: Attempting to connect to Firebase Emulators...');
  try {
    // Auth Emulator
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    console.info('Auth Emulator connected to http://localhost:9099');

    // Firestore Emulator
    connectFirestoreEmulator(db, '127.0.0.1', 8081);
    console.info('Firestore Emulator connected to 127.0.0.1:8081');

    // Storage Emulator
    connectStorageEmulator(storage, 'localhost', 9199);
    console.info('Storage Emulator connected to localhost:9199');

    // Functions Emulator (se necessário)
    // connectFunctionsEmulator(functions, 'localhost', 5001);
    // console.info('Functions Emulator connected to localhost:5001');
    
  } catch (error) {
    console.error('Error connecting to Firebase Emulators:', error);
  }
}

/**
 * Firebase app and service instances available to the application.
 */
export { app, auth, db, storage, messaging }; // Adicionar 'functions' aqui se for usá-las globalmente
    

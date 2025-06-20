
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, type FirebaseStorage } from 'firebase/storage';
import { getMessaging, type Messaging } from 'firebase/messaging';
// Para Functions, se for usar diretamente no cliente no futuro:
// import { getFunctions, connectFunctionsEmulator, type Functions } from 'firebase/functions';

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
    // Use 'localhost' as a fallback, as '127.0.0.1' can sometimes be tricky in containerized/proxied environments.
    const host = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST || 'localhost';
    
    const authPort = 9099;
    connectAuthEmulator(auth, `http://${host}:${authPort}`, { disableWarnings: true });
    console.info(`Auth Emulator connected to http://${host}:${authPort}`);

    const firestorePort = 8083;
    connectFirestoreEmulator(db, host, firestorePort);
    console.info(`Firestore Emulator connected to ${host}:${firestorePort}`);

    const storagePort = 9199;
    connectStorageEmulator(storage, host, storagePort);
    console.info(`Storage Emulator connected to ${host}:${storagePort}`);

    // Functions Emulator (se necessário)
    // const functionsPort = 5001;
    // connectFunctionsEmulator(functions, host, functionsPort);
    // console.info(`Functions Emulator connected to ${host}:${functionsPort}`);
    
  } catch (error) {
    console.error('Error connecting to Firebase Emulators:', error);
  }
}

export { app, auth, db, storage, messaging };
    


import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, Auth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, Firestore } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator, Functions } from "firebase/functions";
import { getStorage, connectStorageEmulator, FirebaseStorage } from "firebase/storage";
import { ENV } from '@/config/env'; // Import the centralized ENV object

const firebaseConfig = {
  apiKey: ENV.FIREBASE_API_KEY,
  authDomain: ENV.FIREBASE_AUTH_DOMAIN,
  projectId: ENV.FIREBASE_PROJECT_ID,
  storageBucket: ENV.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: ENV.FIREBASE_MESSAGING_SENDER_ID,
  appId: ENV.FIREBASE_APP_ID,
  measurementId: ENV.FIREBASE_MEASUREMENT_ID, // Can be undefined
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let functions: Functions;
let storage: FirebaseStorage;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

auth = getAuth(app);
db = getFirestore(app);
functions = getFunctions(app); // Optional: specify region e.g., getFunctions(app, 'us-central1')
storage = getStorage(app);

if (ENV.USE_FIREBASE_EMULATORS) {
  // Make sure emulators are running using `firebase emulators:start`
  // Firebase Console: http://localhost:4000 (or as configured in firebase.json)
  // Auth Emulator: http://localhost:9099
  // Firestore Emulator: http://localhost:8080
  // Functions Emulator: http://localhost:5001
  // Storage Emulator: http://localhost:9199
  try {
    // Check if already connected to avoid re-connecting error in HMR scenarios
    // Firestore has _settings.host, Auth has settings.host, Storage has _bucket.emulator.host
    // This is a bit hacky as internal properties might change.
    // A more robust way is to ensure this runs only once.
    if (!(auth as any).emulatorConfig) {
        connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
        if (ENV.NODE_ENV === 'development') console.log("Auth Emulator connected: http://localhost:9099");
    }
    if (!(db as any)._settings?.host?.includes('localhost:8080')) {
         connectFirestoreEmulator(db, "localhost", 8080);
         if (ENV.NODE_ENV === 'development') console.log("Firestore Emulator connected: http://localhost:8080");
    }
    // Functions emulator connection doesn't have an easy "already connected" check.
    // connectFunctionsEmulator(functions, "localhost", 5001);
    // if (ENV.NODE_ENV === 'development') console.log("Functions Emulator connected: http://localhost:5001");
     if (!(storage as any)._bucket?.emulator?.hostname?.includes('localhost')) {
        connectStorageEmulator(storage, "localhost", 9199);
        if (ENV.NODE_ENV === 'development') console.log("Storage Emulator connected: http://localhost:9199");
    }
    if (ENV.NODE_ENV === 'development') console.log("Firebase Emulators configured to connect.");
  } catch (error) {
    console.error("Error connecting to Firebase Emulators:", error);
  }
}

export { auth, db, functions, storage, app };

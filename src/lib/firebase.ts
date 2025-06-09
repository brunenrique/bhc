// This is a placeholder for Firebase initialization.
// In a real application, you would initialize Firebase App and connect to emulators here.

// import { initializeApp, getApp, getApps } from "firebase/app";
// import { getAuth, connectAuthEmulator } from "firebase/auth";
// import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
// import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
// import { getStorage, connectStorageEmulator } from "firebase/storage";

const MOCK_FIREBASE_CONFIG = {
  apiKey: "mock-api-key",
  authDomain: "mock-project-id.firebaseapp.com",
  projectId: "mock-project-id",
  storageBucket: "mock-project-id.appspot.com",
  messagingSenderId: "mock-sender-id",
  appId: "mock-app-id",
};

// let app;
// if (!getApps().length) {
//   app = initializeApp(MOCK_FIREBASE_CONFIG);
// } else {
//   app = getApp();
// }

// const auth = getAuth(app);
// const db = getFirestore(app);
// const functions = getFunctions(app);
// const storage = getStorage(app);

// if (process.env.NODE_ENV === "development") {
//   // Make sure emulators are running using `firebase emulators:start`
//   // Firebase Console: http://localhost:4000
//   // Auth Emulator: http://localhost:9099
//   // Firestore Emulator: http://localhost:8080
//   // Functions Emulator: http://localhost:5001
//   // Storage Emulator: http://localhost:9199
//   try {
//     connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
//     connectFirestoreEmulator(db, "localhost", 8080);
//     connectFunctionsEmulator(functions, "localhost", 5001);
//     connectStorageEmulator(storage, "localhost", 9199);
//     console.log("Firebase Emulators connected successfully.");
//   } catch (error) {
//     console.error("Error connecting to Firebase Emulators:", error);
//   }
// }

// export { auth, db, functions, storage, app };

// Mocked exports for the prototype to function without actual Firebase
export const auth = {
  // Mock auth methods as needed
  onAuthStateChanged: (callback: (user: any) => void) => {
    // Simulate an authenticated user or null
    // setTimeout(() => callback({ uid: 'mock-uid', email: 'user@example.com', displayName: 'Mock User' }), 100);
    setTimeout(() => callback(null), 100); // Default to not logged in
    return () => {}; // Unsubscribe function
  },
  signInWithEmailAndPassword: async (email: string, pass: string) => ({ user: { uid: 'mock-uid', email, displayName: 'Mock User' } }),
  createUserWithEmailAndPassword: async (email: string, pass: string) => ({ user: { uid: 'mock-uid', email, displayName: 'Mock User' } }),
  signOut: async () => {},
  currentUser: null as any, // Or a mock user object
};

export const db = {}; // Mock Firestore
export const functions = {}; // Mock Functions
export const storage = {}; // Mock Storage

console.log("Firebase services mocked for development (emulator mode).");

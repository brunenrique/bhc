import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { setDoc, getDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

let testEnv: RulesTestEnvironment;
const PROJECT_ID = 'psiguard-test-emulator'; // Use a unique project ID for tests

// Helper function to get Firestore instance for a specific user
const getFirestoreAsUser = (auth?: { uid: string; [key: string]: any }) => {
  if (!auth) {
    return testEnv.unauthenticatedContext().firestore();
  }
  return testEnv.authenticatedContext(auth.uid, auth).firestore();
};

describe('Firestore Security Rules for PsiGuard', () => {
  beforeAll(async () => {
    const rulesPath = path.join(__dirname, '../firestore.rules');
    const rules = fs.readFileSync(rulesPath, 'utf8');
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules: rules,
        host: 'localhost', // Default Firestore emulator host
        port: 8080,      // Default Firestore emulator port from firebase.json
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  describe('Patients Collection Rules', () => {
    const mockPatientData = {
      name: 'Test Patient',
      email: 'test.patient@example.com',
      createdAt: serverTimestamp(), // Use serverTimestamp for actual Firestore writes
      // psychologistId: 'psychologist123' // Add if rules depend on this
    };

    // --- Psychologist Role Tests ---
    const psychologistUser = { uid: 'psychologist1', role: 'psychologist' };
    const psychologistDb = () => getFirestoreAsUser(psychologistUser);

    it('Psychologist: should ALLOW creating a patient', async () => {
      const patientRef = doc(psychologistDb(), 'patients', 'patientByPsy');
      await assertSucceeds(setDoc(patientRef, mockPatientData));
    });

    it('Psychologist: should ALLOW reading a patient', async () => {
      // First, admin creates a patient to ensure it exists
      const adminDb = getFirestoreAsUser({ uid: 'admin001', role: 'admin' });
      const patientRefAdmin = doc(adminDb, 'patients', 'patientForPsyRead');
      await setDoc(patientRefAdmin, mockPatientData);

      // Then, psychologist attempts to read
      const patientRefPsy = doc(psychologistDb(), 'patients', 'patientForPsyRead');
      await assertSucceeds(getDoc(patientRefPsy));
    });
    
    it('Psychologist: should ALLOW updating a patient', async () => {
      const adminDb = getFirestoreAsUser({ uid: 'admin001', role: 'admin' });
      const patientRefAdmin = doc(adminDb, 'patients', 'patientForPsyUpdate');
      await setDoc(patientRefAdmin, mockPatientData);

      const patientRefPsy = doc(psychologistDb(), 'patients', 'patientForPsyUpdate');
      await assertSucceeds(setDoc(patientRefPsy, { name: 'Updated Name' }, { merge: true }));
    });

    it('Psychologist: should ALLOW deleting a patient', async () => {
      const adminDb = getFirestoreAsUser({ uid: 'admin001', role: 'admin' });
      const patientRefAdmin = doc(adminDb, 'patients', 'patientForPsyDelete');
      await setDoc(patientRefAdmin, mockPatientData);
      
      const patientRefPsy = doc(psychologistDb(), 'patients', 'patientForPsyDelete');
      await assertSucceeds(deleteDoc(patientRefPsy));
    });

    // --- Admin Role Tests ---
    const adminUser = { uid: 'admin1', role: 'admin' };
    const adminDb = () => getFirestoreAsUser(adminUser);

    it('Admin: should ALLOW creating a patient', async () => {
      const patientRef = doc(adminDb(), 'patients', 'patientByAdmin');
      await assertSucceeds(setDoc(patientRef, mockPatientData));
    });

    it('Admin: should ALLOW reading any patient', async () => {
      // Psychologist creates a patient
      const psyDb = getFirestoreAsUser({ uid: 'psyTemp', role: 'psychologist' });
      const patientRefPsy = doc(psyDb, 'patients', 'patientForAdminRead');
      await setDoc(patientRefPsy, mockPatientData);
      
      // Admin reads it
      const patientRefAdmin = doc(adminDb(), 'patients', 'patientForAdminRead');
      await assertSucceeds(getDoc(patientRefAdmin));
    });

    it('Admin: should ALLOW updating any patient', async () => {
      const psyDb = getFirestoreAsUser({ uid: 'psyTemp', role: 'psychologist' });
      const patientRefPsy = doc(psyDb, 'patients', 'patientForAdminUpdate');
      await setDoc(patientRefPsy, mockPatientData);

      const patientRefAdmin = doc(adminDb(), 'patients', 'patientForAdminUpdate');
      await assertSucceeds(setDoc(patientRefAdmin, { name: 'Admin Updated Name' }, { merge: true }));
    });

    it('Admin: should ALLOW deleting any patient', async () => {
       const psyDb = getFirestoreAsUser({ uid: 'psyTemp', role: 'psychologist' });
      const patientRefPsy = doc(psyDb, 'patients', 'patientForAdminDelete');
      await setDoc(patientRefPsy, mockPatientData);
      
      const patientRefAdmin = doc(adminDb(), 'patients', 'patientForAdminDelete');
      await assertSucceeds(deleteDoc(patientRefAdmin));
    });

    // --- Secretary Role Tests ---
    const secretaryUser = { uid: 'secretary1', role: 'secretary' };
    const secretaryDb = () => getFirestoreAsUser(secretaryUser);

    it('Secretary: should DENY creating a patient', async () => {
      const patientRef = doc(secretaryDb(), 'patients', 'patientBySec');
      await assertFails(setDoc(patientRef, mockPatientData));
    });

    it('Secretary: should ALLOW reading a patient', async () => {
      const adminDb = getFirestoreAsUser({ uid: 'admin002', role: 'admin' });
      const patientRefAdmin = doc(adminDb, 'patients', 'patientForSecRead');
      await setDoc(patientRefAdmin, mockPatientData);

      const patientRefSec = doc(secretaryDb(), 'patients', 'patientForSecRead');
      await assertSucceeds(getDoc(patientRefSec));
    });

    it('Secretary: should DENY updating a patient', async () => {
      const adminDb = getFirestoreAsUser({ uid: 'admin002', role: 'admin' });
      const patientRefAdmin = doc(adminDb, 'patients', 'patientForSecUpdate');
      await setDoc(patientRefAdmin, mockPatientData);
      
      const patientRefSec = doc(secretaryDb(), 'patients', 'patientForSecUpdate');
      await assertFails(setDoc(patientRefSec, { name: 'Secretary Update Attempt' }, { merge: true }));
    });

    it('Secretary: should DENY deleting a patient', async () => {
      const adminDb = getFirestoreAsUser({ uid: 'admin002', role: 'admin' });
      const patientRefAdmin = doc(adminDb, 'patients', 'patientForSecDelete');
      await setDoc(patientRefAdmin, mockPatientData);

      const patientRefSec = doc(secretaryDb(), 'patients', 'patientForSecDelete');
      await assertFails(deleteDoc(patientRefSec));
    });

    // --- Unauthenticated User Tests ---
    const unauthenticatedDb = () => getFirestoreAsUser(); // No auth object

    it('Unauthenticated User: should DENY creating a patient', async () => {
      const patientRef = doc(unauthenticatedDb(), 'patients', 'patientByUnauth');
      await assertFails(setDoc(patientRef, mockPatientData));
    });

    it('Unauthenticated User: should DENY reading a patient', async () => {
      const adminDb = getFirestoreAsUser({ uid: 'admin003', role: 'admin' });
      const patientRefAdmin = doc(adminDb, 'patients', 'patientForUnauthRead');
      await setDoc(patientRefAdmin, mockPatientData);

      const patientRefUnauth = doc(unauthenticatedDb(), 'patients', 'patientForUnauthRead');
      await assertFails(getDoc(patientRefUnauth));
    });
    
    it('Unauthenticated User: should DENY updating a patient', async () => {
      const adminDb = getFirestoreAsUser({ uid: 'admin003', role: 'admin' });
      const patientRefAdmin = doc(adminDb, 'patients', 'patientForUnauthUpdate');
      await setDoc(patientRefAdmin, mockPatientData);

      const patientRefUnauth = doc(unauthenticatedDb(), 'patients', 'patientForUnauthUpdate');
      await assertFails(setDoc(patientRefUnauth, { name: "Unauth Update" }, { merge: true }));
    });
    
    it('Unauthenticated User: should DENY deleting a patient', async () => {
      const adminDb = getFirestoreAsUser({ uid: 'admin003', role: 'admin' });
      const patientRefAdmin = doc(adminDb, 'patients', 'patientForUnauthDelete');
      await setDoc(patientRefAdmin, mockPatientData);

      const patientRefUnauth = doc(unauthenticatedDb(), 'patients', 'patientForUnauthDelete');
      await assertFails(deleteDoc(patientRefUnauth));
    });
  });

  // You can add more describe blocks for other collections like 'users', 'sessions', etc.
  // describe('Users Collection Rules', () => { ... });
});

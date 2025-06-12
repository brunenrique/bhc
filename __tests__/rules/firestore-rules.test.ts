import { initializeTestEnvironment, assertSucceeds } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { Firestore } from 'firebase/firestore';
import fetch from 'node-fetch';

let testEnv: Awaited<ReturnType<typeof initializeTestEnvironment>>;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-project',
    firestore: {
      host: '127.0.0.1',
      port: 8082,
      rules: readFileSync('firestore.rules', 'utf8'),
    },
  });
});

afterAll(async () => {
  if (testEnv) await testEnv.cleanup();
});

function getAuthedDb(auth: { sub: string; role: string }): Firestore {
  return testEnv.authenticatedContext(auth.sub, auth).firestore();
}

test('admin user can read other user profile', async () => {
  const auth = { sub: 'user-id', role: 'Admin' };
  const db = getAuthedDb(auth);
  await assertSucceeds(db.doc('users/otherUser').get());
});

test('authenticated user can create assessment', async () => {
  const auth = { sub: 'therapist1', role: 'psychologist' };
  const db = getAuthedDb(auth);
  await assertSucceeds(
    db.doc('assessments/testAssessment').set({
      patientId: 'patient1',
      assignedBy: auth.sub,
      templateId: 'tpl1',
      templateName: 'Demo',
      status: 'assigned',
      createdAt: '2024-01-01T00:00:00Z'
    })
  );
});

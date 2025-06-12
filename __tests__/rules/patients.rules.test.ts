import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { Firestore } from 'firebase/firestore';

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

  // Seed a patient document with ownerId user1
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await ctx.firestore().collection('patients').doc('patient1').set({ ownerId: 'user1', name: 'Test' });
  });
});

afterAll(async () => {
  if (testEnv) await testEnv.cleanup();
});

function authedDb(uid: string): Firestore {
  return testEnv.authenticatedContext(uid).firestore();
}

describe('patients rules', () => {
  test('owner can read and write', async () => {
    const db = authedDb('user1');
    const doc = db.collection('patients').doc('patient1');
    await assertSucceeds(doc.get());
    await assertSucceeds(doc.update({ name: 'Updated' }));
  });

  test('other user cannot read or write', async () => {
    const db = authedDb('user2');
    const doc = db.collection('patients').doc('patient1');
    await assertFails(doc.get());
    await assertFails(doc.update({ name: 'Bad' }));
  });
});

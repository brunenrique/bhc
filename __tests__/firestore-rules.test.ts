import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from '@firebase/rules-unit-testing';
import { Firestore } from 'firebase/firestore';
import { readFileSync } from 'fs'; // <- ESSENCIAL!
import { USER_ROLES } from '@/constants/roles';

let testEnv: Awaited<ReturnType<typeof initializeTestEnvironment>>;

describe('Firestore security rules', () => {
  beforeAll(async () => {
    const hostPort = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8085';
    const [host, portStr] = hostPort.split(':');
    const port = parseInt(portStr, 10);

    testEnv = await initializeTestEnvironment({
      projectId: 'demo-project',
      firestore: {
        host,
        port,
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
    const auth = { sub: 'user-id', role: USER_ROLES.ADMIN } as const;
    const db = getAuthedDb(auth);
    await assertSucceeds(db.doc('users/otherUser').get());
  });

  test('authenticated user can create assessment', async () => {
    const auth = { sub: 'therapist1', role: USER_ROLES.PSYCHOLOGIST } as const;
    const db = getAuthedDb(auth);
    await assertSucceeds(
      db.doc('assessments/testAssessment').set({
        patientId: 'patient1',
        assignedBy: auth.sub,
        templateId: 'tpl1',
        templateName: 'Demo',
        status: 'assigned',
        createdAt: '2024-01-01T00:00:00Z',
      })
    );
  });

  describe('Appointment Rules', () => {
    test('non participant cannot read appointment', async () => {
      const psyAuth = { sub: 'psy1', role: USER_ROLES.PSYCHOLOGIST } as const;
      const otherAuth = { uid: 'other' };
      const psyDb = getAuthedDb(psyAuth);
      const otherDb = testEnv.authenticatedContext(otherAuth.uid).firestore();

      const docRef = psyDb.collection('appointments').doc('appt1');
      await assertSucceeds(docRef.set({ psychologistId: psyAuth.sub, patientId: 'pat1' }));

      await assertFails(otherDb.collection('appointments').doc('appt1').get());
      await assertFails(otherDb.collection('appointments').doc('appt1').update({ notes: 'x' }));
    });

    test('unauthenticated user cannot create appointment', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      await assertFails(
        db.collection('appointments').doc('appt2').set({ psychologistId: 'p', patientId: 'pat1' })
      );
      await assertFails(db.collection('appointments').doc('appt1').get());
    });

    test('psychologist can manage own appointment', async () => {
      const psyAuth = { sub: 'psy2', role: USER_ROLES.PSYCHOLOGIST } as const;
      const db = getAuthedDb(psyAuth);
      const docRef = db.collection('appointments').doc('apptManage');

      await assertSucceeds(docRef.set({ psychologistId: psyAuth.sub, patientId: 'pat2' }));
      await assertSucceeds(docRef.update({ notes: 'x' }));
      await assertSucceeds(docRef.delete());
    });

    test('patient can read own appointment but cannot modify', async () => {
      const psyAuth = { sub: 'psy3', role: USER_ROLES.PSYCHOLOGIST } as const;
      const psyDb = getAuthedDb(psyAuth);
      const docRef = psyDb.collection('appointments').doc('apptPatient');
      await assertSucceeds(docRef.set({ psychologistId: psyAuth.sub, patientId: 'patRead' }));

      const patientDb = testEnv.authenticatedContext('patRead').firestore();
      await assertSucceeds(patientDb.collection('appointments').doc('apptPatient').get());
      await assertFails(
        patientDb.collection('appointments').doc('apptPatient').update({ foo: 'bar' })
      );
      await assertFails(patientDb.collection('appointments').doc('apptPatient').delete());
    });
  });

  describe('Audit Logs Rules', () => {
    test('authenticated user can create audit log', async () => {
      const auth = { sub: 'userAudit', role: USER_ROLES.PSYCHOLOGIST } as const;
      const db = getAuthedDb(auth);
      await assertSucceeds(
        db.collection('auditLogs').doc('log1').set({
          action: 'test',
          createdAt: '2024-01-01T00:00:00Z',
        })
      );
    });

    test('unauthenticated user cannot create audit log', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      await assertFails(db.collection('auditLogs').doc('logUnauth').set({ action: 'x' }));
    });

    test('authenticated user cannot update audit log', async () => {
      const auth = { sub: 'userAudit', role: USER_ROLES.PSYCHOLOGIST } as const;
      const db = getAuthedDb(auth);
      const docRef = db.collection('auditLogs').doc('logUpdate');
      await assertSucceeds(docRef.set({ action: 'create', createdAt: '2024-01-01T00:00:00Z' }));
      await assertFails(docRef.update({ action: 'update' }));
    });

    test('authenticated user cannot delete audit log', async () => {
      const auth = { sub: 'userAudit', role: USER_ROLES.PSYCHOLOGIST } as const;
      const db = getAuthedDb(auth);
      const docRef = db.collection('auditLogs').doc('logDelete');
      await assertSucceeds(docRef.set({ action: 'create', createdAt: '2024-01-01T00:00:00Z' }));
      await assertFails(docRef.delete());
    });
  });

  describe('Chat Rules', () => {
    test('chat creation succeeds when all users exist', async () => {
      const user1 = { sub: 'chatUser1', role: USER_ROLES.PSYCHOLOGIST } as const;
      const user2 = { sub: 'chatUser2', role: USER_ROLES.PSYCHOLOGIST } as const;
      const db1 = getAuthedDb(user1);
      const db2 = getAuthedDb(user2);

      await assertSucceeds(
        db1
          .collection('users')
          .doc(user1.sub)
          .set({ role: USER_ROLES.PSYCHOLOGIST, isApproved: true, name: 'U1', email: 'u1@test' })
      );
      await assertSucceeds(
        db2
          .collection('users')
          .doc(user2.sub)
          .set({ role: USER_ROLES.PSYCHOLOGIST, isApproved: true, name: 'U2', email: 'u2@test' })
      );

      const chatRef = db1.collection('chats').doc('ok');
      await assertSucceeds(chatRef.set({ participants: { [user1.sub]: true, [user2.sub]: true } }));
    });

    test('chat creation fails if some user does not exist', async () => {
      const user1 = { sub: 'chatUser3', role: USER_ROLES.PSYCHOLOGIST } as const;
      const db1 = getAuthedDb(user1);

      await assertSucceeds(
        db1
          .collection('users')
          .doc(user1.sub)
          .set({ role: USER_ROLES.PSYCHOLOGIST, isApproved: true, name: 'U3', email: 'u3@test' })
      );

      const chatRef = db1.collection('chats').doc('fail');
      await assertFails(chatRef.set({ participants: { [user1.sub]: true, missing: true } }));
    });
  });

  describe('Feedback Rules', () => {
    test('authenticated user can create feedback', async () => {
      const auth = { sub: 'userFb', role: USER_ROLES.PSYCHOLOGIST } as const;
      const db = getAuthedDb(auth);
      await assertSucceeds(
        db.collection('feedback').doc('fb1').set({
          uid: auth.sub,
          text: 'ok',
          createdAt: '2024-01-01T00:00:00Z',
        })
      );
    });

    test('unauthenticated user cannot create feedback', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      await assertFails(db.collection('feedback').doc('fb2').set({ uid: 'x', text: 'no' }));
    });
  });
});

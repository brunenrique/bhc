import { runScheduledBackups } from '../functions/src/index';

const addMock = jest.fn(() => Promise.resolve());
const getMock = jest.fn();

afterEach(() => {
  jest.clearAllMocks();
});

jest.mock('firebase-admin', () => {
  const firestore = {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({ get: getMock })),
      add: addMock,
    })),
    FieldValue: { serverTimestamp: jest.fn(() => 'ts') },
  };
  return {
    initializeApp: jest.fn(),
    firestore: jest.fn(() => firestore),
    messaging: jest.fn(),
    apps: [],
  };
});

describe('runScheduledBackups', () => {
  it('cria registro quando frequência é diária', async () => {
    getMock.mockResolvedValue({
      exists: true,
      data: () => ({ frequency: 'daily', destination: 'storage' }),
    });
    await (runScheduledBackups as unknown as () => Promise<unknown>)();
    expect(addMock).toHaveBeenCalled();
  });
});

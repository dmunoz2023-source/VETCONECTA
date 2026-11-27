import { Logger } from '@nestjs/common';

const send = jest.fn();
const initializeApp = jest.fn();
const getApps = jest.fn();

jest.mock('firebase-admin/app', () => ({
  cert: jest.fn((c) => c),
  getApps: () => getApps(),
  initializeApp: (o: unknown) => initializeApp(o),
}));
jest.mock('firebase-admin/messaging', () => ({
  getMessaging: () => ({ send }),
}));

import { FirebasePushSender } from './firebase-push-sender';

const config = {
  projectId: 'p',
  clientEmail: 'e@p.iam.gserviceaccount.com',
  privateKey: 'line1\\nline2',
} as any;

describe('FirebasePushSender', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getApps.mockReturnValue([]);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });
  afterEach(() => jest.restoreAllMocks());

  it('inicializa Firebase una sola vez y convierte \\n en saltos de linea', () => {
    new FirebasePushSender(config);
    expect(initializeApp).toHaveBeenCalledTimes(1);
    expect(initializeApp.mock.calls[0][0].credential.privateKey).toBe('line1\nline2');

    getApps.mockReturnValue([{}]);
    new FirebasePushSender(config);
    expect(initializeApp).toHaveBeenCalledTimes(1);
  });

  it('devuelve ok con el messageId', async () => {
    send.mockResolvedValue('projects/p/messages/1');
    const res = await new FirebasePushSender(config).send('tok', { title: 't', body: 'b' });
    expect(res).toEqual({ ok: true, messageId: 'projects/p/messages/1' });
  });

  it.each([
    ['messaging/registration-token-not-registered', true],
    ['messaging/invalid-registration-token', true],
    ['messaging/internal-error', false],
  ])('error %s -> invalidToken=%s', async (code, invalid) => {
    send.mockRejectedValue({ code });
    const res = await new FirebasePushSender(config).send('tok-12345678', {
      title: 't',
      body: 'b',
    });
    expect(res).toEqual({ ok: false, invalidToken: invalid, error: code });
  });
});
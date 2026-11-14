import { Logger } from '@nestjs/common';
import { LogPushSender } from './log-push-sender';

describe('LogPushSender (simulado)', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });
  afterEach(() => jest.restoreAllMocks());

  it('responde ok con un messageId para un token normal', async () => {
    const res = await new LogPushSender().send('token-normal-123', { title: 't', body: 'b' });
    expect(res.ok).toBe(true);
    expect(res.messageId).toMatch(/^simulado-/);
  });

  it('marca como invalido un token que empieza con "invalid"', async () => {
    const res = await new LogPushSender().send('invalid-abc', { title: 't', body: 'b' });
    expect(res).toMatchObject({ ok: false, invalidToken: true });
  });
});
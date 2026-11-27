import { Logger } from '@nestjs/common';
import { ReminderDispatchJob } from './reminder-dispatch.job';

function build(pollSeconds?: number) {
  const dispatcher = { dispatchDue: jest.fn().mockResolvedValue(0) };
  const registry = {
    addInterval: jest.fn(),
    deleteInterval: jest.fn(),
    doesExist: jest.fn().mockReturnValue(true),
  };
  const config = {
    get: jest.fn((key: string) => (key === 'reminderPollSeconds' ? pollSeconds : undefined)),
  };
  const job = new ReminderDispatchJob(dispatcher as any, registry as any, config as any);
  return { job, dispatcher, registry };
}

describe('ReminderDispatchJob', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('registra un intervalo con REMINDER_POLL_SECONDS y ejecuta el despacho', () => {
    jest.useFakeTimers();
    const { job, dispatcher, registry } = build(30);

    job.onModuleInit();

    expect(registry.addInterval).toHaveBeenCalledWith('reminder-dispatch', expect.anything());
    jest.advanceTimersByTime(30_000);
    expect(dispatcher.dispatchDue).toHaveBeenCalledTimes(1);
    job.onModuleDestroy();
    clearInterval(registry.addInterval.mock.calls[0][1]);
  });

  it('usa 300 s por defecto', () => {
    jest.useFakeTimers();
    const { job, dispatcher, registry } = build(undefined);

    job.onModuleInit();
    jest.advanceTimersByTime(299_000);
    expect(dispatcher.dispatchDue).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1_000);
    expect(dispatcher.dispatchDue).toHaveBeenCalledTimes(1);
    clearInterval(registry.addInterval.mock.calls[0][1]);
  });

  it('no solapa ejecuciones', async () => {
    const { job, dispatcher } = build();
    let finish!: () => void;
    dispatcher.dispatchDue.mockImplementation(
      () => new Promise<number>((resolve) => (finish = () => resolve(1))),
    );

    const first = job.run();
    await job.run(); // segunda llamada mientras la primera sigue en curso
    expect(dispatcher.dispatchDue).toHaveBeenCalledTimes(1);

    finish();
    await first;
    dispatcher.dispatchDue.mockResolvedValue(0);
    await job.run();
    expect(dispatcher.dispatchDue).toHaveBeenCalledTimes(2);
  });

  it('un error no tumba el job y libera el bloqueo', async () => {
    const { job, dispatcher } = build();
    dispatcher.dispatchDue.mockRejectedValueOnce(new Error('db caida'));

    await expect(job.run()).resolves.toBeUndefined();
    expect(Logger.prototype.error).toHaveBeenCalled();

    await job.run();
    expect(dispatcher.dispatchDue).toHaveBeenCalledTimes(2);
  });

  it('al destruir el modulo elimina el intervalo', () => {
    const { job, registry } = build();
    job.onModuleDestroy();
    expect(registry.deleteInterval).toHaveBeenCalledWith('reminder-dispatch');
  });
});
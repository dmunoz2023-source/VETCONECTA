export interface AppConfig {
  port: number;
  databaseUrl: string;
  dbSchema: string;
  /** Anticipacion del recordatorio en minutos */
  reminderLeadMinutes: number;
  reminderPollSeconds: number;
  /** Intentos maximos de envio antes de dejar el recordatorio en estado "error". */
  reminderMaxAttempts: number;
  /** Secreto compartido entre servicios para las rutas /internal */
  internalKey: string;
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '3005', 10),
  databaseUrl: process.env.DATABASE_URL as string,
  dbSchema: process.env.DB_SCHEMA ?? 'notifications',
  reminderLeadMinutes: parseInt(process.env.REMINDER_LEAD_MINUTES ?? '1440', 10),
  reminderPollSeconds: parseInt(process.env.REMINDER_POLL_SECONDS ?? '300', 10),
  reminderMaxAttempts: parseInt(process.env.REMINDER_MAX_ATTEMPTS ?? '3', 10),
  internalKey: process.env.INTERNAL_KEY as string,
});

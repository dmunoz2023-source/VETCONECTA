export interface FirebaseConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  name: string;
}

export interface AppConfig {
  port: number;
  database: DatabaseConfig;
  dbSchema: string;
  /** Anticipacion del recordatorio en minutos */
  reminderLeadMinutes: number;
  reminderPollSeconds: number;
  /** Intentos maximos de envio antes de dejar el recordatorio en estado "error". */
  reminderMaxAttempts: number;
  /** Segundos base del backoff entre reintentos (se duplica en cada intento). */
  reminderRetryBaseSeconds: number;
  internalKey: string;
  firebase: FirebaseConfig;
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '3005', 10),
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    name: process.env.DB_NAME ?? 'vetconecta',
  },
  dbSchema: process.env.DB_SCHEMA ?? 'notifications',
  reminderLeadMinutes: parseInt(process.env.REMINDER_LEAD_MINUTES ?? '1440', 10),
  reminderPollSeconds: parseInt(process.env.REMINDER_POLL_SECONDS ?? '300', 10),
  reminderMaxAttempts: parseInt(process.env.REMINDER_MAX_ATTEMPTS ?? '3', 10),
  reminderRetryBaseSeconds: parseInt(process.env.REMINDER_RETRY_BASE_SECONDS ?? '30', 10),
  internalKey: process.env.INTERNAL_KEY as string,
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID ?? '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY ?? '',
  },
});
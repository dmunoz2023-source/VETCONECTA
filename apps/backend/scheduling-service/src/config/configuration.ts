export interface AppConfig {
  port: number;
  databaseUrl: string;
  dbSchema: string;
  /** URL base de clients-pets-service (consulta interna de mascotas). */
  clientsServiceUrl: string;
  /** URL base de notifications-service (recordatorios). */
  notificationsServiceUrl: string;
  /** Secreto compartido entre servicios para las rutas /internal (X-Internal-Key). */
  internalKey: string;
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '3004', 10),
  databaseUrl: process.env.DATABASE_URL as string,
  dbSchema: process.env.DB_SCHEMA ?? 'scheduling',
  clientsServiceUrl: process.env.CLIENTS_SERVICE_URL ?? 'http://localhost:3002',
  notificationsServiceUrl: process.env.NOTIFICATIONS_SERVICE_URL ?? 'http://localhost:3005',
  internalKey: process.env.INTERNAL_KEY as string,
});

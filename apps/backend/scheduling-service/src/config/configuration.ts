export interface AppConfig {
  port: number;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
  };
  /** Esquema fijo del servicio: solo lee y escribe en `scheduling`. */
  dbSchema: string;
  /** URL base de clients-pets-service (consulta interna de mascotas). */
  clientsServiceUrl: string;
  /** URL base de notifications-service (recordatorios). */
  notificationsServiceUrl: string;
  /** URL base de clinic-catalog-service (consulta interna de veterinarios). */
  catalogServiceUrl: string;
  /** Secreto compartido entre servicios para las rutas /internal (X-Internal-Key). */
  internalKey: string;
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT || '3004', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME as string,
    password: process.env.DB_PASSWORD as string,
    name: process.env.DB_NAME || 'scheduling_db',
  },
  dbSchema: 'scheduling',
  clientsServiceUrl: process.env.CLIENTS_SERVICE_URL || 'http://localhost:3002',
  notificationsServiceUrl: process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3005',
  catalogServiceUrl: process.env.CATALOG_SERVICE_URL || 'http://localhost:3006',
  internalKey: process.env.INTERNAL_KEY as string,
});

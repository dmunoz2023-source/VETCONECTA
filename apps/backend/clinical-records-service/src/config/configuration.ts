export interface AppConfig {
  port: number;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
  };
  clientsServiceUrl: string;
  schedulingServiceUrl: string;
  catalogServiceUrl: string;
  /** Secreto compartido de las rutas /internal (cabecera X-Internal-Key). */
  internalKey?: string;
  internalApiKey?: string;
}

const internalKey = process.env.INTERNAL_API_KEY || process.env.INTERNAL_KEY;

export default (): AppConfig => ({
  port: parseInt(process.env.PORT || '3003', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'vetconecta',
  },
  clientsServiceUrl: process.env.CLIENTS_SERVICE_URL || 'http://localhost:3002',
  schedulingServiceUrl: process.env.SCHEDULING_SERVICE_URL || 'http://localhost:3004',
  catalogServiceUrl: process.env.CATALOG_SERVICE_URL || 'http://localhost:3006',
  internalKey,
  internalApiKey: internalKey,
});

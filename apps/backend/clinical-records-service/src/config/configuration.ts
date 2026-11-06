export interface AppConfig {
  port: number;
  databaseUrl: string;
  dbSchema: string;
  clientsServiceUrl: string;
  schedulingServiceUrl: string;
  catalogServiceUrl: string;
  internalKey: string;
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '3003', 10),
  databaseUrl: process.env.DATABASE_URL as string,
  dbSchema: process.env.DB_SCHEMA ?? 'clinical',
  clientsServiceUrl: process.env.CLIENTS_SERVICE_URL ?? 'http://localhost:3002',
  schedulingServiceUrl: process.env.SCHEDULING_SERVICE_URL ?? 'http://localhost:3004',
  catalogServiceUrl: process.env.CATALOG_SERVICE_URL ?? 'http://localhost:3006',
  internalKey: process.env.INTERNAL_KEY as string,
});

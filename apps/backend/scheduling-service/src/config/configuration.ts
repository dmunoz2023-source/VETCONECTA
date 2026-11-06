export interface AppConfig {
  port: number;
  databaseUrl: string;
  dbSchema: string;
  /** URL base de clinic-catalog-service (consulta interna de veterinarios). */
  catalogServiceUrl: string;
  /** Secreto compartido entre servicios para las rutas /internal (X-Internal-Key). */
  internalKey: string;
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '3004', 10),
  databaseUrl: process.env.DATABASE_URL as string,
  dbSchema: process.env.DB_SCHEMA ?? 'scheduling',
  catalogServiceUrl: process.env.CATALOG_SERVICE_URL ?? 'http://localhost:3006',
  internalKey: process.env.INTERNAL_KEY as string,
});

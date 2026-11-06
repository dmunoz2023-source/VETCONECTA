export interface AppConfig {
  port: number;
  databaseUrl: string;
  dbSchema: string;
  /** Secreto compartido entre servicios para las rutas /internal (X-Internal-Key). */
  internalKey: string;
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '3006', 10),
  databaseUrl: process.env.DATABASE_URL as string,
  dbSchema: process.env.DB_SCHEMA ?? 'catalog',
  internalKey: process.env.INTERNAL_KEY as string,
});

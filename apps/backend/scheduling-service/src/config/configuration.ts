export interface AppConfig {
  port: number;
  databaseUrl: string;
  dbSchema: string;
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '3004', 10),
  databaseUrl: process.env.DATABASE_URL as string,
  dbSchema: process.env.DB_SCHEMA ?? 'scheduling',
});

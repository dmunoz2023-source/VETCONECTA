export interface AppConfig {
  port: number;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
  };
  /** Esquema fijo del servicio: solo lee y escribe en `catalog`. */
  dbSchema: string;
  /** Secreto compartido entre servicios para las rutas /internal (X-Internal-Key). */
  internalKey: string;
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT || '3006', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'vetconecta',
  },
  dbSchema: 'catalog',
  internalKey: process.env.INTERNAL_KEY as string,
});

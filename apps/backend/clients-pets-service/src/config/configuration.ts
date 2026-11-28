export interface AppConfig {
  port: number;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
  };
  /** Esquema fijo del servicio: solo lee y escribe en `clients_pets`. */
  dbSchema: string;
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT || '3002', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME as string,
    password: process.env.DB_PASSWORD as string,
    name: process.env.DB_NAME || 'clients_pets_db',
  },
  dbSchema: 'clients_pets',
});

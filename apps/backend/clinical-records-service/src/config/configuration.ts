// src/config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT || '3003', 10),
  clientsServiceUrl:
    process.env.CLIENTS_SERVICE_URL || 'http://localhost:3002',
  internalKey: process.env.INTERNAL_KEY,
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME || 'clinical_db',
  },
});
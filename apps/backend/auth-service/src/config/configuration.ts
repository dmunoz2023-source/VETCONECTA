// src/config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  clientsServiceUrl: process.env.CLIENTS_SERVICE_URL || 'http://localhost:3002',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME as string,
    password: process.env.DB_PASSWORD as string,
    name: process.env.DB_NAME || 'auth_db',
  },
});
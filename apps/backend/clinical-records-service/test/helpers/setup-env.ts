/**
 * Prepara las variables de entorno de las pruebas e2e. Por seguridad se niegan a
 * correr si TEST_DATABASE_URL falta o si la base no termina en `_test`: cada caso
 * vacía las tablas del esquema `clinical`.
 */
const url = process.env.TEST_DATABASE_URL;

if (!url) {
  throw new Error(
    'Falta TEST_DATABASE_URL. Ejemplo: postgresql://postgres:CLAVE@localhost:5432/db_vetconecta_test',
  );
}

const databaseName = new URL(url).pathname.replace('/', '');
if (!databaseName.endsWith('_test')) {
  throw new Error(`La base "${databaseName}" no termina en _test: las pruebas borran datos y no correrán ahí.`);
}

const parsed = new URL(url);
process.env.DB_HOST = parsed.hostname;
process.env.DB_PORT = parsed.port || '5432';
process.env.DB_USERNAME = decodeURIComponent(parsed.username);
process.env.DB_PASSWORD = decodeURIComponent(parsed.password);
process.env.DB_NAME = databaseName;
process.env.INTERNAL_KEY = 'clave-de-prueba';
process.env.NODE_ENV = 'test';

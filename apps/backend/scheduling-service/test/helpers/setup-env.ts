/**
 * [J2] Se ejecuta antes de cargar la app. Estas pruebas borran y siembran datos,
 * asi que solo corren contra la base indicada en TEST_DATABASE_URL, y su nombre
 * debe terminar en "_test" para no tocar nunca la base de desarrollo.
 */
const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl) {
  throw new Error(
    'Falta TEST_DATABASE_URL. Ejemplo: postgresql://postgres:clave@localhost:5432/db_vetconecta_test ' +
      '(ver apps/backend/scheduling-service/test/README.md).',
  );
}

const databaseName = new URL(testDatabaseUrl).pathname.replace(/^\//, '');
if (!databaseName.endsWith('_test')) {
  throw new Error(
    `TEST_DATABASE_URL apunta a "${databaseName}". Por seguridad el nombre debe terminar en "_test".`,
  );
}

const parsed = new URL(testDatabaseUrl);
process.env.DB_HOST = parsed.hostname;
process.env.DB_PORT = parsed.port || '5432';
process.env.DB_USERNAME = decodeURIComponent(parsed.username);
process.env.DB_PASSWORD = decodeURIComponent(parsed.password);
process.env.DB_NAME = databaseName;
process.env.INTERNAL_KEY = 'clave_interna_de_pruebas';

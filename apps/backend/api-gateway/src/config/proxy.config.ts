const env = process.env

const origin = env.ORIGIN_URL || 'http://localhost'

const authPort = env.AUTH_SERVICE_PORT || 3001;
const clientsPetsPort = env.CLIENTS_PETS_SERVICE_PORT || 3002;
const clinicalPort = env.CLINICAL_SERVICE_PORT || 3003;
const schedulingPort = env.SCHEDULING_SERVICE_PORT || 3004;
const notificationsPort = env.NOTIFICATIONS_SERVICE_PORT || 3005;
const catalogPort = env.CATALOG_SERVICE_PORT || 3006;

const prefix = {
  auth: env.AUTH_SERVICE_PREFIX || '/v1/auth',
  clients: env.CLIENTS_SERVICE_PREFIX || '/v1/clients',
  pets: env.PETS_SERVICE_PREFIX || '/v1/pets',
  clinical: env.CLINICAL_SERVICE_PREFIX || '/v1/clinical',
  scheduling: env.SCHEDULING_SERVICE_PREFIX || '/v1/scheduling',
  notifications: env.NOTIFICATIONS_SERVICE_PREFIX || '/v1/notifications',
  catalog: env.CATALOG_SERVICE_PREFIX || '/v1/catalog'
}

export const PROXY_ROUTES_CONFIG = {
  auth: {
    port: authPort,
    prefix: {
      origin: prefix.auth,
      login: prefix.auth + '/login',
      register: prefix.auth + '/register'
    },
    origin: `${origin}:${authPort}`,
  },
  clients: {
    port: clientsPetsPort,
    prefix: { origin: prefix.clients},
    origin: `${origin}:${clientsPetsPort}`
  },
  pets: {
    port: clientsPetsPort,
    prefix: { origin: prefix.pets },
    origin: `${origin}:${clientsPetsPort}`
  },
  clinical: {
    port: clinicalPort,
    prefix: { origin: prefix.clinical },
    origin: `${origin}:${clinicalPort}`
  },
  scheduling: {
    port: schedulingPort,
    prefix: { origin: prefix.scheduling },
    origin: `${origin}:${schedulingPort}`
  },
  notifications: {
    port: notificationsPort,
    prefix: { origin: prefix.notifications },
    origin: `${origin}:${notificationsPort}`
  },
  catalog: {
    port: catalogPort,
    prefix: {
      origin: prefix.catalog,
      clinic: prefix.catalog + '/clinic'
    },
    origin: `${origin}:${catalogPort}`
  }
  }
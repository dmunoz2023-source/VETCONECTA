import * as Joi from 'joi';
import { internalKeySchema } from '@app/shared/config/env-fragments';

/**
 * [A3] Valida las variables de entorno al arrancar el servicio. Si falta la
 * conexión a la base, el servicio no debe levantar en silencio: falla rápido,
 * con un mensaje claro, en vez de dejar que TypeORM reviente más adelante con
 * un error críptico de conexión.
 */
export const validationSchema = Joi.object({
  PORT: Joi.number().default(3004),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  CLIENTS_SERVICE_URL: Joi.string().uri().default('http://localhost:3002'),
  NOTIFICATIONS_SERVICE_URL: Joi.string().uri().default('http://localhost:3005'),
  CATALOG_SERVICE_URL: Joi.string().uri().default('http://localhost:3006'),
  INTERNAL_KEY: internalKeySchema,
});

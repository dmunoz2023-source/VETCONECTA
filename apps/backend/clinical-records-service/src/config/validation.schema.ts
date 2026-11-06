import * as Joi from 'joi';

/**
 * Valida las variables de entorno al arrancar el servicio. Si falta DATABASE_URL
 * o INTERNAL_KEY, el servicio falla rápido y con un mensaje claro en vez de
 * levantar contra la base equivocada o aceptar llamadas internas sin clave.
 */
export const validationSchema = Joi.object({
  PORT: Joi.number().default(3003),
  DATABASE_URL: Joi.string().uri({ scheme: ['postgresql', 'postgres'] }).required(),
  DB_SCHEMA: Joi.string().valid('clinical').default('clinical'),
  CLIENTS_SERVICE_URL: Joi.string().uri().default('http://localhost:3002'),
  SCHEDULING_SERVICE_URL: Joi.string().uri().default('http://localhost:3004'),
  CATALOG_SERVICE_URL: Joi.string().uri().default('http://localhost:3006'),
  INTERNAL_KEY: Joi.string().required(),
});

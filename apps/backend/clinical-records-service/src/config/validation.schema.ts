import * as Joi from 'joi';

/**
 * Valida las variables de entorno al arrancar el servicio. Si falta la conexión
 * a la base o la clave interna, el servicio falla rápido y con un mensaje claro
 * en vez de levantar contra la base equivocada o aceptar llamadas internas sin clave.
 */
export const validationSchema = Joi.object({
  PORT: Joi.number().default(3003),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  CLIENTS_SERVICE_URL: Joi.string().uri().default('http://localhost:3002'),
  SCHEDULING_SERVICE_URL: Joi.string().uri().default('http://localhost:3004'),
  CATALOG_SERVICE_URL: Joi.string().uri().default('http://localhost:3006'),
  INTERNAL_API_KEY: Joi.string().optional(),
  INTERNAL_KEY: Joi.string().optional(),
}).or('INTERNAL_API_KEY', 'INTERNAL_KEY');

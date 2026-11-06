import * as Joi from 'joi';

/** [G3] Falla al arrancar si falta la conexión o la clave interna. */
export const validationSchema = Joi.object({
  PORT: Joi.number().default(3006),
  DATABASE_URL: Joi.string().uri({ scheme: ['postgresql', 'postgres'] }).required(),
  DB_SCHEMA: Joi.string().valid('catalog').default('catalog'),
  INTERNAL_KEY: Joi.string().min(8).required(),
});

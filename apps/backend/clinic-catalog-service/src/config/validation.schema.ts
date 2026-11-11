import * as Joi from 'joi';

/** [G3] Falla al arrancar si falta la conexión o la clave interna. */
export const validationSchema = Joi.object({
  PORT: Joi.number().default(3006),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  INTERNAL_KEY: Joi.string().min(8).required(),
});

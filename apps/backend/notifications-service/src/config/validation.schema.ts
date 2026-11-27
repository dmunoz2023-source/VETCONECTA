import * as Joi from 'joi';

/** [X1] Falla al arrancar si falta la conexión a la base propia del servicio. */
export const validationSchema = Joi.object({
  PORT: Joi.number().default(3005),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
});

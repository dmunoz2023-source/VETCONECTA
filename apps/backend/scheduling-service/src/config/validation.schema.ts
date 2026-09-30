import * as Joi from 'joi';

/**
 * [A3] Valida las variables de entorno al arrancar el servicio. Si falta
 * DATABASE_URL o DB_SCHEMA, el servicio no debe levantar en silencio contra
 * la base equivocada: falla rápido, con un mensaje claro, en vez de dejar
 * que TypeORM reviente más adelante con un error críptico de conexión.
 */
export const validationSchema = Joi.object({
  PORT: Joi.number().default(3004),
  DATABASE_URL: Joi.string().uri({ scheme: ['postgresql', 'postgres'] }).required(),
  DB_SCHEMA: Joi.string().valid('scheduling').default('scheduling'),
});

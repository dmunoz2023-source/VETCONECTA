import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(3002),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgresql', 'postgres'] })
    .required(),
  DB_SCHEMA: Joi.string().valid('clients_pets').default('clients_pets'),
});

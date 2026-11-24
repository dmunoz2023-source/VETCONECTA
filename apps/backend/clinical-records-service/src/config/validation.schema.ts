// src/config/validation.schema.ts
import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  CLIENTS_SERVICE_URL: Joi.string().uri().default('http://localhost:3002'),
  INTERNAL_API_KEY: Joi.string().optional(),
  INTERNAL_KEY: Joi.string().optional(),
});
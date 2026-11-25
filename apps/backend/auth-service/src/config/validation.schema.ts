import * as Joi from 'joi';
import {
  internalKeySchema,
  jwtExpiresInSchema,
  jwtSecretSchema,
} from '@app/shared/config/env-fragments';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(3001),
  CLIENTS_SERVICE_URL: Joi.string().uri().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  JWT_SECRET: jwtSecretSchema,
  JWT_EXPIRES_IN: jwtExpiresInSchema,
  INTERNAL_KEY: internalKeySchema,
});
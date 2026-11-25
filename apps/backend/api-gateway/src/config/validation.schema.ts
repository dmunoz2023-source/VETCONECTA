import * as Joi from 'joi';
import { jwtSecretSchema } from '@app/shared/config/env-fragments';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  JWT_SECRET: jwtSecretSchema,
  // Varios origenes separados por coma
  CORS_ORIGIN: Joi.string().required(),
});
import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(3005),
  DATABASE_URL: Joi.string().required(),
  DB_SCHEMA: Joi.string().default('notifications'),
  REMINDER_LEAD_MINUTES: Joi.number().integer().min(1).default(1440),
  REMINDER_POLL_SECONDS: Joi.number().integer().min(1).default(300),
  REMINDER_MAX_ATTEMPTS: Joi.number().integer().min(1).default(3),
  INTERNAL_KEY: Joi.string().required(),
  // Opcionales: si no están, el servicio usa el envío simulado.
  FIREBASE_PROJECT_ID: Joi.string().allow('').optional(),
  FIREBASE_CLIENT_EMAIL: Joi.string().allow('').optional(),
  FIREBASE_PRIVATE_KEY: Joi.string().allow('').optional(),
});

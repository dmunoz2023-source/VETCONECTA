import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(3005),

  // [X1] Falla al arrancar si falta la conexión a la base propia del servicio.
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().integer().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),

  // [H1] Recordatorios
  REMINDER_LEAD_MINUTES: Joi.number().integer().min(1).default(1440),
  REMINDER_POLL_SECONDS: Joi.number().integer().min(1).default(300),
  REMINDER_MAX_ATTEMPTS: Joi.number().integer().min(1).default(3),
  REMINDER_RETRY_BASE_SECONDS: Joi.number().integer().min(0).default(30),
  INTERNAL_KEY: Joi.string().required(),

  // Opcionales: si no están, el servicio usa el envío simulado.
  FIREBASE_PROJECT_ID: Joi.string().allow('').optional(),
  FIREBASE_CLIENT_EMAIL: Joi.string().allow('').optional(),
  FIREBASE_PRIVATE_KEY: Joi.string().allow('').optional(),
});
import * as Joi from 'joi';

export const internalKeySchema = Joi.string().min(16).required();

/** Secreto de firma JWT. Mismo valor en auth-service y api-gateway. */
export const jwtSecretSchema = Joi.string().min(32).required();

export const jwtExpiresInSchema = Joi.string()
  .pattern(/^\d+(s|m|h|d)$/)
  .required();
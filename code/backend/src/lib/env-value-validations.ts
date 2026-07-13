import * as Joi from 'joi';

const DEFAULT_PORT = 3000;

export default Joi.object({
  PORT: Joi.number().default(DEFAULT_PORT),
  JWT_SECRET: Joi.string().required(),
  REDIS_URL: Joi.string().default('redis://127.0.0.1:6379'),
  DB_DATABASE: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_USERNAME: Joi.string().required(),
  SOCKETIO_ENDPOINT_ON: Joi.boolean().default(false),
  OTP_EXPIRY_MINUTES: Joi.number().default(10),
  MSG91_AUTH_KEY: Joi.string().default(null),
  MAILING_DOMAIN_FOR_MSG91: Joi.string().default(null),
  API_BASE_URL: Joi.string().default(''),
  SOCKETIO_ENDPOINT: Joi.string().default(''),
  PUBLIC_HOST_WITH_PORT: Joi.string().default(
    `http://localhost:${DEFAULT_PORT}`,
  ),
});

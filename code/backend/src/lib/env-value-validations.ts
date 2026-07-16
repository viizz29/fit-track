import * as Joi from 'joi';

const DEFAULT_PORT = 3000;

export default Joi.object({
  PORT: Joi.number().default(DEFAULT_PORT),
  JWT_SECRET: Joi.string().required(),

  REDIS_HOST: Joi.string().default('127.0.0.1'),
  REDIS_PORT: Joi.number().integer().default(6379),
  REDIS_USER: Joi.string().required(),
  REDIS_PASSWORD: Joi.string().required(),

  DB_HOST: Joi.string().default('127.0.0.1'),
  DB_DATABASE: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_USERNAME: Joi.string().required(),
  SOCKETIO_ENDPOINT_ON: Joi.boolean().default(false),

  API_BASE_URL: Joi.string().default(''),
  SOCKETIO_ENDPOINT: Joi.string().default(''),
  PUBLIC_HOST_WITH_PORT: Joi.string().default(
    `http://localhost:${DEFAULT_PORT}`,
  ),
  FRONTEND_BUILD_PATH: Joi.string().default('public'),
  VERIFICATION_TOKEN_EXPIRY_HOURS: Joi.number().integer().default(24),
  PASSWORD_RESET_TOKEN_EXPIRY_HOURS: Joi.number().integer().default(1),
  OTP_EXPIRY_MINUTES: Joi.number().integer().default(10),
  TTS_API: Joi.string().default(`http://localhost:3536/tts/api/speak`),
  ENABLE_NOTIFICATION_EMAILS: Joi.boolean().default(false),
  SCHEDULED_TASKS_ENABLED: Joi.boolean().default(false),

  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().integer().required(),
  SMTP_SECURE: Joi.boolean().required(),
  SMTP_USERNAME: Joi.string().required(),
  SMTP_PASSWORD: Joi.string().required(),
  MAIL_FROM_ADDRESS: Joi.string().email().required(),
  MAIL_FROM_NAME: Joi.string().required(),
});

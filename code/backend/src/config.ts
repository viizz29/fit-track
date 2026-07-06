// backup original env values
const originalEnv = { ...process.env };

process.env.TZ = 'America/Danmarkshavn'; // set the timezone for the config values

export * from './configs/base';
export * from './configs/common';
export * from './configs/socketio-server';
export * from './configs/email-and-sms';

delete originalEnv.NODE_ENV;
process.env = { ...originalEnv }; // restore the config
process.env.TZ = 'America/Danmarkshavn'; // ensure timezone is set after env restoration

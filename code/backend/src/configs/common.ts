export const OTP_EXPIRY_MINUTES = process.env.OTP_EXPIRY_MINUTES
  ? Number(process.env.OTP_EXPIRY_MINUTES)
  : 10;

export const PASSWORD_RESET_TOKEN_EXPIRY_HOURS = process.env
  .PASSWORD_RESET_TOKEN_EXPIRY_HOURS
  ? Number(process.env.PASSWORD_RESET_TOKEN_EXPIRY_HOURS)
  : 1;

export const VERIFICATION_TOKEN_EXPIRY_HOURS = process.env
  .VERIFICATION_TOKEN_EXPIRY_HOURS
  ? Number(process.env.VERIFICATION_TOKEN_EXPIRY_HOURS)
  : 24;

export const ENABLE_NOTIFICATION_EMAILS =
  process.env.ENABLE_NOTIFICATION_EMAILS === 'true';

export const DIARY_DEPLOYMENT_LOCATION = process.env.DIARY_DEPLOYMENT_LOCATION
  ? process.env.DIARY_DEPLOYMENT_LOCATION
  : '/var/www/diary';

export const POSTGRES_DATABASE_HOST_NAME = process.env
  .POSTGRES_DATABASE_HOST_NAME
  ? process.env.POSTGRES_DATABASE_HOST_NAME
  : 'localhost';
export const POSTGRES_DATABASE_BACKUP_USER_NAME = process.env
  .POSTGRES_DATABASE_BACKUP_USER_NAME
  ? process.env.POSTGRES_DATABASE_BACKUP_USER_NAME
  : 'user1';
export const POSTGRES_DATABASE_BACKUP_USER_PASSWORD = process.env
  .POSTGRES_DATABASE_BACKUP_USER_PASSWORD
  ? process.env.POSTGRES_DATABASE_BACKUP_USER_PASSWORD
  : '';

export const MYSQL_DB_BACKUP_USER = process.env.MYSQL_DB_BACKUP_USER
  ? process.env.MYSQL_DB_BACKUP_USER
  : '';
export const MYSQL_DB_BACKUP_PASSWORD = process.env.MYSQL_DB_BACKUP_PASSWORD
  ? process.env.MYSQL_DB_BACKUP_PASSWORD
  : '';

export const DATA_BACKUP_SERVER_BASE_URL = process.env
  .DATA_BACKUP_SERVER_BASE_URL
  ? process.env.DATA_BACKUP_SERVER_BASE_URL
  : '';
export const DATA_BACKUP_SERVER_USER_NAME = process.env
  .DATA_BACKUP_SERVER_USER_NAME
  ? process.env.DATA_BACKUP_SERVER_USER_NAME
  : '';
export const DATA_BACKUP_SERVER_PASSWORD = process.env
  .DATA_BACKUP_SERVER_PASSWORD
  ? process.env.DATA_BACKUP_SERVER_PASSWORD
  : '';

export const TTS_API = process.env.TTS_API
  ? process.env.TTS_API
  : `http://localhost:3536/tts/api/speak`;

export const TUNNEL_CLIENT_ON = process.env.TUNNEL_CLIENT_ON === 'true';
export const TUNNEL_CLIENT_TUNNEL_SERVER_PORT = process.env
  .TUNNEL_CLIENT_TUNNEL_SERVER_PORT
  ? process.env.TUNNEL_CLIENT_TUNNEL_SERVER_PORT
  : 1111;
export const TUNNEL_CLIENT_TUNNEL_SERVER_NAME = process.env
  .TUNNEL_CLIENT_TUNNEL_SERVER_NAME
  ? process.env.TUNNEL_CLIENT_TUNNEL_SERVER_NAME
  : 'ws://localhost';
export const TUNNEL_CLIENT_HOST_LIST_FILENAME = process.env
  .TUNNEL_CLIENT_HOST_LIST_FILENAME
  ? process.env.TUNNEL_CLIENT_HOST_LIST_FILENAME
  : 'tunnel-client-hosts.json';

export const THIS_USER = process.env.THIS_USER ? process.env.THIS_USER : 'kali';
export const ANDROID_SDK_LOCATION = process.env.ANDROID_SDK_LOCATION
  ? process.env.ANDROID_SDK_LOCATION
  : '$HOME/android-sdk';

export const WEB_TERMINAL_ON = process.env.WEB_TERMINAL_ON === 'true';

// NGINX/OPENRESTY THINGS
export const NGINX_RESTART_COMMAND = process.env.NGINX_RESTART_COMMAND
  ? process.env.NGINX_RESTART_COMMAND
  : 'sudo systemctl restart openresty';
export const NGINX_CUSTOM_CONFIG_FOLDER = process.env.NGINX_CUSTOM_CONFIG_FOLDER
  ? process.env.NGINX_CUSTOM_CONFIG_FOLDER
  : '/usr/local/openresty/nginx/conf.d';

export const HIE_SERVER_CHECKING_EVERYDAY =
  process.env.HIE_SERVER_CHECKING_EVERYDAY === 'true';

export const BASH_ON_WINDOWS = process.env.BASH_ON_WINDOWS
  ? process.env.BASH_ON_WINDOWS
  : 'C:/Program Files/Git/bin/bash.exe';

export const SCHEDULED_TASKS_ENABLED =
  process.env.SCHEDULED_TASKS_ENABLED === 'true';

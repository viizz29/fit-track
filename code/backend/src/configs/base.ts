import * as dotenv from 'dotenv';
import path from 'path';
import { addAlias } from 'module-alias';

const NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'production';
export const PROJECT_LOCATION = path.dirname(path.dirname(__dirname));
const configFilePath = `${PROJECT_LOCATION}/.env.${NODE_ENV}`;
dotenv.config({ path: configFilePath });

export const APP_ENV = process.env.APP_ENV ? process.env.APP_ENV : 'production';
export const IS_PRODUCTION = APP_ENV === 'production';
export const IS_STAGING = APP_ENV === 'staging';
export const IS_LOCAL = APP_ENV === 'dev';
export const IS_TESTING = APP_ENV === 'test';

const SOURCE_DIRECTORY = IS_LOCAL
  ? `${PROJECT_LOCATION}/src`
  : `${PROJECT_LOCATION}/.dist/`;
addAlias('@', SOURCE_DIRECTORY);

export const WORKING_DIRECTORY = process.cwd();

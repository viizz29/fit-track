// src/database/sequelize.config.js
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
const PASS = decodeURIComponent(process.env.DB_PASSWORD);

module.exports = {
  username: process.env.DB_USERNAME,
  password: PASS,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  dialect: 'postgres',
};

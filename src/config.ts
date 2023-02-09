export const DB_URI =
  process.env.DB_URI || 'mongodb://scrapper:123456@localhost:27017/scrapper';
export const NAVIGATION_TIMEOUT = 20000;
export const DEFAULT_TIMEOUT = 10000;
export const RABBITMQ_URI = process.env.RABBITMQ_URI || 'amqp://localhost:5672';
export const ZENROWS_KEY =
  process.env.ZENROWS_KEY || '84217c18a2bfca2a4be2dde6c2b1b707486f8dcc';
export const AMQP_TIMEOUT = parseInt(process.env.AMQP_TIMEOUT) || 120000;
export const CRON = '0 * * * *';

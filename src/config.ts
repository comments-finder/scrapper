export const DB_URI = process.env.DB_URI || 'mongodb://scrapper:123456@localhost:27017/scrapper';
export const NAVIGATION_TIMEOUT = 20000;
export const DEFAULT_TIMEOUT = 10000;
export const RABBITMQ_URI = process.env.RABBITMQ_URI || 'amqp://localhost:5672';
export const ZENROWS_KEY = process.env.ZENROWS_KEY || '9cd4e445c7b9e92f0f6d57808380984f0c8e2272';
export const AMQP_TIMEOUT = parseInt(process.env.AMQP_TIMEOUT) || 120000

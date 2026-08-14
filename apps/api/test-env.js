const path = require('path');
const dotenv = require('dotenv');

if (!process.env.DATABASE_URL) {
  dotenv.config({
    path: path.resolve(__dirname, '../../.env'),
  });
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not configured. Set DATABASE_URL before running API tests.');
}

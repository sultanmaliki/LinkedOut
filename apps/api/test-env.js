const path = require('path');
const dotenv = require('dotenv');

if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
  dotenv.config({
    path: path.resolve(__dirname, '../../.env'),
  });
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not configured. Set DATABASE_URL before running API tests.');
}

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not configured. Set JWT_SECRET before running API tests.');
}

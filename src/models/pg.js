
const { Pool } = require('pg');
require('dotenv').config();

const isRender = process.env.RENDER === 'true'; // O usa NODE_ENV === 'production'

const pool = new Pool({
  connectionString: isRender
    ? process.env.DATABASE_URL_INTERNAL
    : process.env.DATABASE_URL_EXTERNAL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;

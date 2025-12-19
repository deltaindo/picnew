const { Pool } = require('pg');
require('dotenv').config();

console.log('\n[DB] Initializing PostgreSQL connection pool...');
console.log(`[DB] Host: ${process.env.DB_HOST}, Port: ${process.env.DB_PORT}, Database: ${process.env.DB_NAME}`);

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'pic_app',
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('\n\u274c [DB ERROR] Unexpected error on idle client:', err.message);
  console.error('[DB] Stack:', err.stack);
});

pool.on('connect', () => {
  console.log('\u2705 [DB] New connection created');
});

pool.on('remove', () => {
  console.log('[DB] Connection removed from pool');
});

// Test connection on module load
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('\n\u274c [DB CRITICAL] DATABASE CONNECTION TEST FAILED!');
    console.error('Error:', err.message);
    console.error('\nMake sure:');
    console.error('  1. PostgreSQL is running');
    console.error('  2. Database "pic_app" exists');
    console.error('  3. .env file has correct credentials');
    console.error('  4. Connection string: postgres://' + (process.env.DB_USER) + ':***@' + (process.env.DB_HOST) + ':' + (process.env.DB_PORT) + '/' + (process.env.DB_NAME));
    console.error();
    // Don't exit - let the app start and show error in route handler
  } else {
    console.log('\u2705 [DB] Connection test successful - time:', res.rows[0].now);
  }
});

module.exports = pool;

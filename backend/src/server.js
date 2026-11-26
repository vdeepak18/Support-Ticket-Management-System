require('dotenv').config();

const app = require('./app');
const { initializeDatabase, pool } = require('./db');

async function start() {
  if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
    console.error('Set DATABASE_URL and JWT_SECRET in backend/.env before starting the server.');
    process.exit(1);
  }
  try {
    await initializeDatabase();
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server listening on port ${port}`));
  } catch (error) {
    console.error(`Could not connect to PostgreSQL: ${error.message}`);
    await pool.end();
    process.exit(1);
  }
}

start();

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool, initializeDatabase } = require('./src/db');
const User = require('./src/models/User');

async function seed() {
  const { DATABASE_URL, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!DATABASE_URL || !ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('Set DATABASE_URL, ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in backend/.env');
  }
  if (ADMIN_PASSWORD.length < 12) throw new Error('ADMIN_PASSWORD must be at least 12 characters');
  await initializeDatabase();
  if (await User.findByEmail(ADMIN_EMAIL)) throw new Error('An account already exists for ADMIN_EMAIL');
  const password = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await User.create({ name: ADMIN_NAME, email: ADMIN_EMAIL, password, role: 'admin' });
  console.log(`Created admin account for ${ADMIN_EMAIL}`);
}

seed().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(async () => {
  await pool.end();
});

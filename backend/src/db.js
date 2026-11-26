const { Pool } = require('pg');

function createPool() {
  const databaseUrl = process.env.DATABASE_URL;
  let ssl;
  let connectionString = databaseUrl;

  if (databaseUrl) {
    const url = new URL(databaseUrl);
    const sslMode = url.searchParams.get('sslmode');
    url.searchParams.delete('sslmode');
    connectionString = url.toString();
    if (sslMode === 'require' || process.env.DATABASE_SSL === 'true') ssl = true;
    if (sslMode === 'disable') ssl = false;
  }

  const pool = new Pool({ connectionString, ssl, max: 10 });
  pool.on('error', (error) => console.error('Unexpected PostgreSQL pool error:', error.message));
  return pool;
}

const pool = createPool();

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS tickets (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
      status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')),
      created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS tickets_created_by_idx ON tickets(created_by);
    CREATE INDEX IF NOT EXISTS tickets_status_idx ON tickets(status);
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS comments_ticket_idx ON comments(ticket_id);
    CREATE TABLE IF NOT EXISTS activity_logs (
      id SERIAL PRIMARY KEY,
      ticket_id INTEGER REFERENCES tickets(id) ON DELETE SET NULL,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      action TEXT NOT NULL CHECK (action IN ('ticket_created', 'ticket_updated', 'status_changed', 'comment_added', 'ticket_resolved', 'ticket_deleted')),
      details TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS activity_logs_ticket_idx ON activity_logs(ticket_id);
  `);
}

module.exports = { pool, initializeDatabase };

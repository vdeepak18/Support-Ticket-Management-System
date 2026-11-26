const { pool } = require('../db');

async function create(ticketId, userId, message) {
  const { rows } = await pool.query(
    `INSERT INTO comments (ticket_id, user_id, message) VALUES ($1, $2, $3)
     RETURNING id, ticket_id AS "ticketId", user_id AS "userId", message, created_at AS "createdAt", updated_at AS "updatedAt"`,
    [ticketId, userId, message]
  );
  return rows[0];
}

async function listByTicket(ticketId) {
  const { rows } = await pool.query(
    `SELECT c.id, c.ticket_id AS "ticketId", c.message, c.created_at AS "createdAt", c.updated_at AS "updatedAt",
            u.id AS "userId", u.name AS "userName", u.role AS "userRole"
     FROM comments c JOIN users u ON u.id = c.user_id WHERE c.ticket_id = $1 ORDER BY c.created_at`,
    [ticketId]
  );
  return rows.map((row) => ({
    id: row.id, ticketId: row.ticketId, message: row.message, createdAt: row.createdAt, updatedAt: row.updatedAt,
    user: { id: row.userId, name: row.userName, role: row.userRole },
  }));
}

module.exports = { create, listByTicket };

const { pool } = require('../db');

async function create({ ticketId, userId, action, details }) {
  const { rows } = await pool.query(
    `INSERT INTO activity_logs (ticket_id, user_id, action, details) VALUES ($1, $2, $3, $4)
     RETURNING id, ticket_id AS "ticketId", user_id AS "userId", action, details, created_at AS "createdAt"`,
    [ticketId, userId, action, details]
  );
  return rows[0];
}

async function listByTicket(ticketId) {
  const { rows } = await pool.query(
    `SELECT a.id, a.ticket_id AS "ticketId", a.action, a.details, a.created_at AS "createdAt",
            u.id AS "userId", u.name AS "userName", u.role AS "userRole"
     FROM activity_logs a JOIN users u ON u.id = a.user_id WHERE a.ticket_id = $1 ORDER BY a.created_at DESC`,
    [ticketId]
  );
  return rows.map((row) => ({
    id: row.id, ticketId: row.ticketId, action: row.action, details: row.details, createdAt: row.createdAt,
    user: { id: row.userId, name: row.userName, role: row.userRole },
  }));
}

module.exports = { create, listByTicket };

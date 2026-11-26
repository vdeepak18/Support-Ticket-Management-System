const { pool } = require('../db');

const ticketSelect = `
  SELECT t.id, t.title, t.description, t.category, t.priority, t.status,
         t.created_by AS "createdById", t.created_at AS "createdAt", t.updated_at AS "updatedAt",
         u.name AS "creatorName", u.email AS "creatorEmail"
  FROM tickets t JOIN users u ON u.id = t.created_by`;

function mapTicket(row) {
  if (!row) return null;
  return {
    id: row.id, title: row.title, description: row.description, category: row.category,
    priority: row.priority, status: row.status, createdAt: row.createdAt, updatedAt: row.updatedAt,
    createdBy: { id: row.createdById, name: row.creatorName, email: row.creatorEmail },
  };
}

async function create({ title, description, category, priority = 'medium' }, userId) {
  const { rows } = await pool.query(
    'INSERT INTO tickets (title, description, category, priority, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [title, description, category, priority, userId]
  );
  return findById(rows[0].id);
}

async function findById(id) {
  const { rows } = await pool.query(`${ticketSelect} WHERE t.id = $1`, [id]);
  return mapTicket(rows[0]);
}

async function update(id, values) {
  await pool.query(
    `UPDATE tickets SET
      title = COALESCE($2, title), description = COALESCE($3, description),
      category = COALESCE($4, category), priority = COALESCE($5, priority), updated_at = NOW()
     WHERE id = $1`,
    [id, values.title ?? null, values.description ?? null, values.category ?? null, values.priority ?? null]
  );
  return findById(id);
}

async function remove(id) {
  const result = await pool.query('DELETE FROM tickets WHERE id = $1', [id]);
  return result.rowCount > 0;
}

function buildFilter({ userId, status, priority, search }) {
  const clauses = [];
  const values = [];
  if (userId !== undefined) { values.push(userId); clauses.push(`t.created_by = $${values.length}`); }
  if (status) { values.push(status); clauses.push(`t.status = $${values.length}`); }
  if (priority) { values.push(priority); clauses.push(`t.priority = $${values.length}`); }
  if (search) { values.push(`%${search}%`); clauses.push(`t.title ILIKE $${values.length}`); }
  return { where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', values };
}

async function list({ userId, page, limit, status, priority, search }) {
  const { where, values } = buildFilter({ userId, status, priority, search });
  const offset = (page - 1) * limit;
  const ticketValues = [...values, limit, offset];
  const [listResult, countResult, openResult, resolvedResult, allResult] = await Promise.all([
    pool.query(`${ticketSelect} ${where} ORDER BY t.updated_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`, ticketValues),
    pool.query(`SELECT COUNT(*)::int AS total FROM tickets t ${where}`, values),
    pool.query("SELECT COUNT(*)::int AS total FROM tickets WHERE created_by = $1 AND status IN ('open', 'in-progress')", [userId]),
    pool.query("SELECT COUNT(*)::int AS total FROM tickets WHERE created_by = $1 AND status = 'resolved'", [userId]),
    pool.query('SELECT COUNT(*)::int AS total FROM tickets WHERE created_by = $1', [userId]),
  ]);
  const total = countResult.rows[0].total;
  return {
    tickets: listResult.rows.map(mapTicket),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    stats: { total: allResult.rows[0].total, open: openResult.rows[0].total, resolved: resolvedResult.rows[0].total },
  };
}

async function listAll({ page, limit, status, priority, search }) {
  const { where, values } = buildFilter({ status, priority, search });
  const result = await pool.query(`${ticketSelect} ${where} ORDER BY t.updated_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`, [...values, limit, (page - 1) * limit]);
  const count = await pool.query(`SELECT COUNT(*)::int AS total FROM tickets t ${where}`, values);
  const total = count.rows[0].total;
  return { tickets: result.rows.map(mapTicket), pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

async function updateStatus(id, status) {
  const { rows } = await pool.query('UPDATE tickets SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING id', [id, status]);
  return rows.length ? findById(id) : null;
}

async function updatePriority(id, priority) {
  const { rows } = await pool.query('UPDATE tickets SET priority = $2, updated_at = NOW() WHERE id = $1 RETURNING id', [id, priority]);
  return rows.length ? findById(id) : null;
}

async function getStats() {
  const [totalResult, statusResult, priorityResult] = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS total FROM tickets'),
    pool.query('SELECT status, COUNT(*)::int AS count FROM tickets GROUP BY status'),
    pool.query('SELECT priority, COUNT(*)::int AS count FROM tickets GROUP BY priority'),
  ]);
  return {
    total: totalResult.rows[0].total,
    byStatus: Object.fromEntries(statusResult.rows.map((row) => [row.status, row.count])),
    byPriority: Object.fromEntries(priorityResult.rows.map((row) => [row.priority, row.count])),
  };
}

module.exports = { create, findById, update, remove, list, listAll, updateStatus, updatePriority, getStats };

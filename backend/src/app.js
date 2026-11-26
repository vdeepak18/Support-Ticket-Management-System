const express = require('express');
const cors = require('cors');
const { pool } = require('./db');
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const clientOrigin = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, '');
app.use(cors({ origin: clientOrigin }));
app.use(express.json({ limit: '20kb' }));
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ success: true, data: { api: 'running', database: 'connected' } });
  } catch (error) { res.status(503).json({ success: false, message: 'Database is disconnected' }); }
});
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/admin', adminRoutes);
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);
module.exports = app;

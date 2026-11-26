const Ticket = require('../models/Ticket');
const events = require('../events/events');

async function list(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await Ticket.listAll({ page, limit, status: req.query.status, priority: req.query.priority, search: req.query.search });
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
}

async function updateStatus(req, res, next) {
  try {
    const previous = await Ticket.findById(req.params.id);
    if (!previous) return res.status(404).json({ success: false, message: 'Ticket not found' });
    const ticket = await Ticket.updateStatus(req.params.id, req.body.status);
    if (previous.status !== ticket.status) {
      const eventData = { ticketId: ticket.id, userId: req.user.id, details: `${previous.status} → ${ticket.status}` };
      events.emit('ticket.statusChanged', eventData);
      if (ticket.status === 'resolved') events.emit('ticket.resolved', { ...eventData, details: 'Ticket resolved' });
    }
    res.json({ success: true, data: { ticket } });
  } catch (error) { next(error); }
}

async function updatePriority(req, res, next) {
  try {
    const ticket = await Ticket.updatePriority(req.params.id, req.body.priority);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    events.emit('ticket.updated', { ticketId: ticket.id, userId: req.user.id, details: `Priority set to ${ticket.priority}` });
    res.json({ success: true, data: { ticket } });
  } catch (error) { next(error); }
}

async function stats(req, res, next) {
  try { res.json({ success: true, data: await Ticket.getStats() }); }
  catch (error) { next(error); }
}

module.exports = { list, updateStatus, updatePriority, stats };

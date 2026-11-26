const Ticket = require('../models/Ticket');
const events = require('../events/events');

async function create(req, res, next) {
  try {
    const ticket = await Ticket.create(req.body, req.user.id);
    events.emit('ticket.created', { ticketId: ticket.id, userId: req.user.id, details: `Created: ${ticket.title}` });
    res.status(201).json({ success: true, data: { ticket } });
  } catch (error) { next(error); }
}

async function list(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await Ticket.list({ userId: req.user.id, page, limit, status: req.query.status, priority: req.query.priority, search: req.query.search });
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
}

async function getOne(req, res, next) {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    if (req.user.role !== 'admin' && String(ticket.createdBy.id) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'You cannot access this ticket' });
    }
    res.json({ success: true, data: { ticket } });
  } catch (error) { next(error); }
}

async function update(req, res, next) {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    if (req.user.role !== 'admin' && String(ticket.createdBy.id) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'You cannot update this ticket' });
    }
    const updated = await Ticket.update(req.params.id, req.body);
    events.emit('ticket.updated', { ticketId: updated.id, userId: req.user.id, details: 'Updated ticket details' });
    res.json({ success: true, data: { ticket: updated } });
  } catch (error) { next(error); }
}

async function remove(req, res, next) {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    if (req.user.role !== 'admin' && String(ticket.createdBy.id) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'You cannot delete this ticket' });
    }
    await Ticket.remove(req.params.id);
    events.emit('ticket.deleted', { ticketId: ticket.id, userId: req.user.id, details: ticket.title });
    res.json({ success: true, data: { ticketId: ticket.id } });
  } catch (error) { next(error); }
}

module.exports = { create, list, getOne, update, remove };

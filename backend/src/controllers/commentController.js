const Ticket = require('../models/Ticket');
const Comment = require('../models/Comment');
const ActivityLog = require('../models/ActivityLog');
const events = require('../events/events');

async function accessibleTicket(id, user) {
  const ticket = await Ticket.findById(id);
  if (!ticket) return { error: { status: 404, message: 'Ticket not found' } };
  if (user.role !== 'admin' && String(ticket.createdBy.id) !== String(user.id)) {
    return { error: { status: 403, message: 'You cannot access this ticket' } };
  }
  return { ticket };
}

async function add(req, res, next) {
  try {
    const result = await accessibleTicket(req.params.id, req.user);
    if (result.error) return res.status(result.error.status).json({ success: false, message: result.error.message });
    const comment = await Comment.create(result.ticket.id, req.user.id, req.body.message);
    events.emit('ticket.commentAdded', { ticketId: result.ticket.id, userId: req.user.id, details: 'Added a comment' });
    res.status(201).json({ success: true, data: { comment } });
  } catch (error) { next(error); }
}

async function list(req, res, next) {
  try {
    const result = await accessibleTicket(req.params.id, req.user);
    if (result.error) return res.status(result.error.status).json({ success: false, message: result.error.message });
    const comments = await Comment.listByTicket(result.ticket.id);
    res.json({ success: true, data: { comments } });
  } catch (error) { next(error); }
}

async function activity(req, res, next) {
  try {
    const result = await accessibleTicket(req.params.id, req.user);
    if (result.error) return res.status(result.error.status).json({ success: false, message: result.error.message });
    const activity = await ActivityLog.listByTicket(result.ticket.id);
    res.json({ success: true, data: { activity } });
  } catch (error) { next(error); }
}

module.exports = { add, list, activity };

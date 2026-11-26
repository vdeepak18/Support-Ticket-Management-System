const EventEmitter = require('events');
const ActivityLog = require('../models/ActivityLog');

const events = new EventEmitter();
const actions = {
  'ticket.created': 'ticket_created',
  'ticket.updated': 'ticket_updated',
  'ticket.statusChanged': 'status_changed',
  'ticket.commentAdded': 'comment_added',
  'ticket.resolved': 'ticket_resolved',
  'ticket.deleted': 'ticket_deleted',
};

for (const [eventName, action] of Object.entries(actions)) {
  events.on(eventName, async ({ ticketId, userId, details = '' }) => {
    try {
      const deleted = eventName === 'ticket.deleted';
      await ActivityLog.create({
        ticketId: deleted ? null : ticketId,
        userId,
        action,
        details: deleted ? `Deleted ticket #${ticketId}. ${details}` : details,
      });
    } catch (error) {
      console.error(`Unable to save ${eventName} activity:`, error.message);
    }
  });
}

module.exports = events;

const express = require('express');
const { z } = require('zod');
const validate = require('../middleware/validate');
const { authenticate, adminOnly } = require('../middleware/auth');
const admin = require('../controllers/adminController');
const router = express.Router();
const idSchema = z.object({ id: z.coerce.number().int().positive() });
const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(['open', 'in-progress', 'resolved', 'closed']).optional(), priority: z.enum(['low', 'medium', 'high']).optional(), search: z.string().trim().max(100).optional(),
});

router.use(authenticate, adminOnly);
router.get('/stats', admin.stats);
router.get('/tickets', validate(querySchema, 'query'), admin.list);
router.patch('/tickets/:id/status', validate(idSchema, 'params'), validate(z.object({ status: z.enum(['open', 'in-progress', 'resolved', 'closed']) })), admin.updateStatus);
router.patch('/tickets/:id/priority', validate(idSchema, 'params'), validate(z.object({ priority: z.enum(['low', 'medium', 'high']) })), admin.updatePriority);
module.exports = router;

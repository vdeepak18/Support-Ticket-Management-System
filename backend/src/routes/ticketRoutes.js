const express = require('express');
const { z } = require('zod');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const tickets = require('../controllers/ticketController');
const comments = require('../controllers/commentController');
const router = express.Router();
const idSchema = z.object({ id: z.coerce.number().int().positive() });
const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(['open', 'in-progress', 'resolved', 'closed']).optional(), priority: z.enum(['low', 'medium', 'high']).optional(), search: z.string().trim().max(100).optional(),
});
const ticketSchema = z.object({ title: z.string().trim().min(3).max(120), description: z.string().trim().min(10).max(5000), category: z.string().trim().min(2).max(60), priority: z.enum(['low', 'medium', 'high']).optional() });
const updateSchema = z.object({ title: z.string().trim().min(3).max(120).optional(), description: z.string().trim().min(10).max(5000).optional(), category: z.string().trim().min(2).max(60).optional(), priority: z.enum(['low', 'medium', 'high']).optional() }).refine((data) => Object.keys(data).length > 0, 'Provide a field to update');
const commentSchema = z.object({ message: z.string().trim().min(1).max(3000) });

router.use(authenticate);
router.post('/', validate(ticketSchema), tickets.create);
router.get('/', validate(querySchema, 'query'), tickets.list);
router.get('/:id/comments', validate(idSchema, 'params'), comments.list);
router.post('/:id/comments', validate(idSchema, 'params'), validate(commentSchema), comments.add);
router.get('/:id/activity', validate(idSchema, 'params'), comments.activity);
router.get('/:id', validate(idSchema, 'params'), tickets.getOne);
router.put('/:id', validate(idSchema, 'params'), validate(updateSchema), tickets.update);
router.delete('/:id', validate(idSchema, 'params'), tickets.remove);
module.exports = router;

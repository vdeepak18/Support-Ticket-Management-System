const express = require('express');
const { z } = require('zod');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const controller = require('../controllers/authController');
const router = express.Router();

router.post('/register', validate(z.object({
  name: z.string().trim().min(2).max(80), email: z.string().trim().email().transform((email) => email.toLowerCase()), password: z.string().min(6).max(72),
})), controller.register);
router.post('/login', validate(z.object({ email: z.string().trim().email().transform((email) => email.toLowerCase()), password: z.string().min(1).max(72) })), controller.login);
router.get('/me', authenticate, controller.me);

module.exports = router;

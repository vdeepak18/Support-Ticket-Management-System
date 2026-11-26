const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function safeUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

async function register(req, res, next) {
  try {
    const password = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({ name: req.body.name, email: req.body.email, password, role: 'user' });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, data: { user: safeUser(user), token } });
  } catch (error) { next(error); }
}

async function login(req, res, next) {
  try {
    const user = await User.findByEmail(req.body.email);
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(401).json({ success: false, message: 'Email or password is incorrect' });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, data: { user: safeUser(user), token } });
  } catch (error) { next(error); }
}

function me(req, res) {
  res.json({ success: true, data: { user: safeUser(req.user) } });
}

module.exports = { register, login, me };

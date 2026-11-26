function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  console.error(error);
  if (error.code === '23505') return res.status(409).json({ success: false, message: 'Email is already registered' });
  if (error.code === '23503' || error.code === '22P02') return res.status(400).json({ success: false, message: 'Submitted reference is invalid' });
  if (error.code === '23514') return res.status(400).json({ success: false, message: 'Submitted data is invalid' });
  if (error.type === 'entity.parse.failed') return res.status(400).json({ success: false, message: 'Request body must be valid JSON' });
  const message = process.env.NODE_ENV === 'production' ? 'An unexpected server error occurred' : error.message;
  res.status(500).json({ success: false, message });
}
module.exports = errorHandler;

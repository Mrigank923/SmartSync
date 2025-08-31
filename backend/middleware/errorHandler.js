// middleware/errorHandler.js
module.exports = (err, req, res, next) => {
  console.error('💥  Error:', err.message);
  if (process.env.NODE_ENV === 'development') console.error(err);

  // Custom status if set, else 500
  const status = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({ message });
};

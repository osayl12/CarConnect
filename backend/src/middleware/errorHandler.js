// Catches any route/controller that returns a 404 and normalizes it.
function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Not found - ${req.originalUrl}`));
}

// Central error handler. Any `next(err)` call in the app ends up here.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message;

  // Errors that already carry an explicit status (e.g. multer fileFilter
  // rejections) — see middleware/upload.js.
  if (err.statusCode) {
    statusCode = err.statusCode;
  }

  // Multer errors (file too large, unexpected field, etc.) -> 400.
  if (err.name === 'MulterError') {
    statusCode = 400;
  }

  // Malformed :id route params (e.g. GET /api/vehicles/not-an-id) throw a
  // Mongoose CastError — that's a bad request, not a server error.
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose schema validation failures -> 400 with the first message.
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)[0]?.message || message;
  }

  // Duplicate key on a unique index -> 409 Conflict.
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `${field} already in use` : 'Duplicate value';
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
}

module.exports = { notFound, errorHandler };

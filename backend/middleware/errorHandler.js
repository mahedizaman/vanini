const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server Error';

  if (err?.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  } else if (err?.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors || {})
      .map((e) => e.message)
      .join(', ');
  } else if (err?.code === 11000) {
    statusCode = 409;
    message = 'Duplicate value entered';
  }

  res.status(statusCode).json({ success: false, message });
};

module.exports = errorHandler;

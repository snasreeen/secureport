export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    message: 'Resource not found',
  });
};

// Centralized error handler
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  console.error(err);

  const status = err.status || 500;
  const message =
    status === 500 ? 'An unexpected error occurred. Please try again later.' : err.message;

  res.status(status).json({
    message,
  });
};


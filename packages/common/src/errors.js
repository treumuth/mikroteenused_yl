/**
 * Ühtne veatüüp teenuste vahel — Express error middleware ootab statusCode välja.
 */

class AppError extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode HTTP staatus
   * @param {string} [code] masinloetav kood (nt USER_NOT_FOUND)
   * @param {object} [details] lisainfo klientidele / logidele
   */
  constructor(message, statusCode, code = 'APP_ERROR', details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

function notFoundHandler(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.path}`, 404, 'NOT_FOUND'));
}

function errorHandler(logger) {
  return (err, req, res, next) => {
    if (res.headersSent) {
      return next(err);
    }

    const status = err.statusCode || err.status || 500;
    const code = err.code || 'INTERNAL_ERROR';
    const message = err.message || 'Internal server error';

    if (status >= 500) {
      logger.error('Unhandled or server error', {
        path: req.path,
        method: req.method,
        status,
        code,
        stack: err.stack,
      });
    } else {
      logger.info('Client error', { path: req.path, method: req.method, status, code });
    }

    res.status(status).json({
      error: {
        code,
        message,
        details: err.details ?? undefined,
      },
    });
  };
}

module.exports = { AppError, notFoundHandler, errorHandler };

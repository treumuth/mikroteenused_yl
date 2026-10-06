function createRequestLogger(logger) {
  return function requestLoggerMiddleware(req, res, next) {
    const start = Date.now();
    res.on('finish', () => {
      const ms = Date.now() - start;
      logger.info('Gateway request', {
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs: ms,
      });
    });
    next();
  };
}

module.exports = { createRequestLogger };

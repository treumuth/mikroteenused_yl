/**
 * Lihtne mälu-põhine rate limit — stub, mitte tootmiskvaliteediga.
 * Näitab gateway "cross-cutting concern" ideed (turve, kaitse).
 */

function createRateLimitStub(maxPerMinute, logger) {
  const hitsByIp = new Map();

  setInterval(() => {
    hitsByIp.clear();
  }, 60_000).unref();

  return function rateLimitMiddleware(req, res, next) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const count = (hitsByIp.get(ip) || 0) + 1;
    hitsByIp.set(ip, count);

    if (count > maxPerMinute) {
      logger.warn('Rate limit exceeded', { ip, count });
      return res.status(429).json({
        error: {
          code: 'RATE_LIMIT',
          message: 'Too many requests — try again later',
        },
      });
    }
    return next();
  };
}

module.exports = { createRateLimitStub };

const express = require('express');

/**
 * Standardne health endpoint — orchestrator (docker, k8s) saab kontrollida, kas protsess elab.
 */
function healthRouter(serviceName, extraChecks = null) {
  const router = express.Router();
  router.get('/health', async (req, res, next) => {
    try {
      const payload = {
        status: 'ok',
        service: serviceName,
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      };
      if (typeof extraChecks === 'function') {
        payload.checks = await extraChecks();
      }
      res.json(payload);
    } catch (err) {
      next(err);
    }
  });
  return router;
}

module.exports = { healthRouter };

const express = require('express');
const { buildRouteTable } = require('./routeTable');

function createMetaRouter(config) {
  const router = express.Router();
  const routes = buildRouteTable(config);

  router.get('/', (req, res) => {
    res.json({
      name: 'Raamatupood API Gateway',
      version: '1.0.0',
      docs: 'See endpoint on informatiivne — õpilased kasutavad ULEANNE.md küsimusi.',
      publicEntrypoints: routes.map((r) => ({
        prefix: r.publicPrefix,
        service: r.name,
        description: r.description,
      })),
    });
  });

  router.get('/routes', (req, res) => {
    res.json({
      routes: routes.map((r) => ({
        publicPrefix: r.publicPrefix,
        upstreamPrefix: r.upstreamPrefix,
        target: r.target,
        name: r.name,
      })),
    });
  });

  return router;
}

module.exports = { createMetaRouter };

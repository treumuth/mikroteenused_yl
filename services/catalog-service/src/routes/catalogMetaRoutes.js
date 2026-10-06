const express = require('express');
const { getRestConventionsSummary } = require('@raamatupood/common');

function createCatalogMetaRouter(queryEngine) {
  const router = express.Router();

  router.get('/catalog/search', (req, res, next) => {
    try {
      res.json(queryEngine.search(req.query));
    } catch (err) {
      next(err);
    }
  });

  router.get('/catalog/stats/by-category', (req, res, next) => {
    try {
      res.json({ categories: queryEngine.aggregateByCategory() });
    } catch (err) {
      next(err);
    }
  });

  router.get('/catalog/conventions', (req, res) => {
    res.json(getRestConventionsSummary());
  });

  return router;
}

module.exports = { createCatalogMetaRouter };

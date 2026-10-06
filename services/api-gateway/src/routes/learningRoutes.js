const express = require('express');
const {
  getLearningScenarios,
  getGlossary,
  getSystemApiCatalog,
} = require('@raamatupood/common');

function createLearningRouter() {
  const router = express.Router();

  router.get('/learning/scenarios', (req, res) => {
    res.json({ scenarios: getLearningScenarios() });
  });

  router.get('/learning/glossary', (req, res) => {
    res.json({ terms: getGlossary() });
  });

  router.get('/learning/api-catalog', (req, res) => {
    res.json({ endpoints: getSystemApiCatalog() });
  });

  return router;
}

module.exports = { createLearningRouter };

const { createLogger } = require('./logger');
const { AppError, notFoundHandler, errorHandler } = require('./errors');
const { validatePositiveInt, validateNonEmptyString, validateArray } = require('./validation');
const { ServiceClient } = require('./serviceClient');
const { healthRouter } = require('./health');
const { getRestConventionsSummary, HTTP_STATUS } = require('./reference/restConventions');
const { getLearningScenarios } = require('./reference/learningScenarios');
const { getGlossary } = require('./reference/glossary');
const { getSystemApiCatalog } = require('./reference/systemApiCatalog');

module.exports = {
  createLogger,
  AppError,
  notFoundHandler,
  errorHandler,
  validatePositiveInt,
  validateNonEmptyString,
  validateArray,
  ServiceClient,
  healthRouter,
  getRestConventionsSummary,
  HTTP_STATUS,
  getLearningScenarios,
  getGlossary,
  getSystemApiCatalog,
};

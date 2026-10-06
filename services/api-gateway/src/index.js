const express = require('express');
const {
  createLogger,
  healthRouter,
  notFoundHandler,
  errorHandler,
} = require('@raamatupood/common');
const config = require('./config');
const { buildRouteTable } = require('./routes/routeTable');
const { createMetaRouter } = require('./routes/metaRoutes');
const { createLearningRouter } = require('./routes/learningRoutes');
const { registerProxies } = require('./proxy/registerProxies');
const { createRateLimitStub } = require('./middleware/rateLimitStub');
const { createRequestLogger } = require('./middleware/requestLogger');

const logger = createLogger(config.serviceName, config.logLevel);
const app = express();

app.set('trust proxy', 1);
app.use(createRequestLogger(logger));
app.use(createRateLimitStub(config.rateLimitPerMinute, logger));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  return next();
});

app.use(healthRouter(config.serviceName));
app.use('/api', createMetaRouter(config));
app.use('/api', createLearningRouter());

const routes = buildRouteTable(config);
registerProxies(app, routes, logger);

app.use(notFoundHandler);
app.use(errorHandler(logger));

app.listen(config.port, () => {
  logger.info('Gateway listening', { port: config.port, routes: routes.length });
});

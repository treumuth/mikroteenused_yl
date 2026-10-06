const express = require('express');
const {
  createLogger,
  healthRouter,
  notFoundHandler,
  errorHandler,
} = require('@raamatupood/common');
const config = require('./config');
const { NotificationRepository } = require('./repositories/notificationRepository');
const { NotificationService } = require('./services/notificationService');
const { createNotifyRouter } = require('./routes/notifyRoutes');

const logger = createLogger(config.serviceName, config.logLevel);
const app = express();

app.use(express.json());
app.use(healthRouter(config.serviceName));

const repo = new NotificationRepository(config.maxHistory, logger);
const service = new NotificationService(repo);
app.use('/', createNotifyRouter(service));

app.use(notFoundHandler);
app.use(errorHandler(logger));

app.listen(config.port, () => {
  logger.info('Listening', { port: config.port });
});

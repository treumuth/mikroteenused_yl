const express = require('express');
const {
  createLogger,
  healthRouter,
  notFoundHandler,
  errorHandler,
} = require('@raamatupood/common');
const config = require('./config');
const { OrderRepository } = require('./repositories/orderRepository');
const { createUpstreamClients } = require('./clients/upstreamClients');
const { OrderService } = require('./services/orderService');
const { createOrdersRouter } = require('./routes/ordersRoutes');

const logger = createLogger(config.serviceName, config.logLevel);
const app = express();

app.use(express.json());
app.use(
  healthRouter(config.serviceName, async () => ({
    upstream: {
      users: config.usersServiceUrl,
      catalog: config.catalogServiceUrl,
      notifications: config.notificationsServiceUrl,
    },
  }))
);

const orderRepo = new OrderRepository(logger);
const upstream = createUpstreamClients(config, logger);
const orderService = new OrderService(orderRepo, upstream, logger);

app.use('/orders', createOrdersRouter(orderService));

app.use(notFoundHandler);
app.use(errorHandler(logger));

app.listen(config.port, () => {
  logger.info('Listening', {
    port: config.port,
    usersServiceUrl: config.usersServiceUrl,
    catalogServiceUrl: config.catalogServiceUrl,
  });
});

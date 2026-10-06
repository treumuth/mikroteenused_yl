const express = require('express');
const {
  createLogger,
  healthRouter,
  notFoundHandler,
  errorHandler,
} = require('@raamatupood/common');
const config = require('./config');
const { UserRepository } = require('./repositories/userRepository');
const { UserService } = require('./services/userService');
const { createUsersRouter } = require('./routes/usersRoutes');

const logger = createLogger(config.serviceName, config.logLevel);
const app = express();

app.use(express.json());
app.use(healthRouter(config.serviceName));

const userRepo = new UserRepository(config.seedPath, logger);
const userService = new UserService(userRepo);
app.use('/users', createUsersRouter(userService));

app.use(notFoundHandler);
app.use(errorHandler(logger));

app.listen(config.port, () => {
  logger.info('Listening', { port: config.port });
});

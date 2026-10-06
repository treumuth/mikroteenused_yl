const express = require('express');
const {
  createLogger,
  healthRouter,
  notFoundHandler,
  errorHandler,
} = require('@raamatupood/common');
const config = require('./config');
const { BookRepository } = require('./repositories/bookRepository');
const { CatalogService } = require('./services/catalogService');
const { createBooksRouter } = require('./routes/booksRoutes');
const { createStockRouter } = require('./routes/stockRoutes');
const { BookQueryEngine } = require('./lib/bookQueryEngine');
const { createCatalogMetaRouter } = require('./routes/catalogMetaRoutes');

const logger = createLogger(config.serviceName, config.logLevel);
const app = express();

app.use(express.json());
app.use(healthRouter(config.serviceName, async () => ({
  catalogLoaded: true,
})));

const bookRepo = new BookRepository(config.seedPath, logger);
const catalogService = new CatalogService(bookRepo);

const queryEngine = new BookQueryEngine(
  () => bookRepo.listBooks({}),
  (id) => bookRepo.getAvailableStock(id)
);

app.use('/books', createBooksRouter(catalogService));
app.use('/stock', createStockRouter(catalogService));
app.use('/', createCatalogMetaRouter(queryEngine));

app.use(notFoundHandler);
app.use(errorHandler(logger));

app.listen(config.port, () => {
  logger.info('Listening', { port: config.port });
});

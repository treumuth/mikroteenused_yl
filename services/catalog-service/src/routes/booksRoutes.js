const express = require('express');
const { AppError } = require('@raamatupood/common');

function createBooksRouter(catalogService) {
  const router = express.Router();

  router.get('/', (req, res, next) => {
    try {
      const result = catalogService.searchBooks({ category: req.query.category });
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', (req, res, next) => {
    try {
      const book = catalogService.getBook(req.params.id);
      if (!book) {
        throw new AppError('Book not found', 404, 'BOOK_NOT_FOUND', { bookId: req.params.id });
      }
      res.json({ book });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = { createBooksRouter };

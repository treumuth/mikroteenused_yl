const express = require('express');
const { validatePositiveInt, validateNonEmptyString } = require('@raamatupood/common');

function createStockRouter(catalogService) {
  const router = express.Router();

  /**
   * POST /stock/reserve — orders-service kutsub enne tellimuse lõplikku salvestamist.
   */
  router.post('/reserve', (req, res, next) => {
    try {
      const bookId = validateNonEmptyString(req.body.bookId, 'bookId');
      const quantity = validatePositiveInt(req.body.quantity, 'quantity');
      const reservationId = validateNonEmptyString(req.body.reservationId, 'reservationId');
      const result = catalogService.reserve({ bookId, quantity, reservationId });
      res.status(200).json({ reserved: true, ...result });
    } catch (err) {
      next(err);
    }
  });

  router.post('/release', (req, res, next) => {
    try {
      const bookId = validateNonEmptyString(req.body.bookId, 'bookId');
      const quantity = validatePositiveInt(req.body.quantity, 'quantity');
      const reservationId = validateNonEmptyString(req.body.reservationId, 'reservationId');
      const result = catalogService.release({ bookId, quantity, reservationId });
      res.json({ released: true, ...result });
    } catch (err) {
      next(err);
    }
  });

  router.post('/commit', (req, res, next) => {
    try {
      const bookId = validateNonEmptyString(req.body.bookId, 'bookId');
      const quantity = validatePositiveInt(req.body.quantity, 'quantity');
      const result = catalogService.commit({ bookId, quantity });
      res.json({ committed: true, ...result });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = { createStockRouter };

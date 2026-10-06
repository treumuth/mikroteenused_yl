const express = require('express');

function createOrdersRouter(orderService) {
  const router = express.Router();

  router.get('/', async (req, res, next) => {
    try {
      res.json(orderService.listOrders());
    } catch (err) {
      next(err);
    }
  });

  /**
   * POST /orders — gateway suunab siia POST /api/orders.
   */
  router.post('/', async (req, res, next) => {
    try {
      const result = await orderService.placeOrder(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  });

  router.get('/:orderId', async (req, res, next) => {
    try {
      const order = orderService.getOrder(req.params.orderId);
      res.json({ order });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = { createOrdersRouter };

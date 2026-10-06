const express = require('express');

function createNotifyRouter(notificationService) {
  const router = express.Router();

  router.post('/notify', (req, res, next) => {
    try {
      const entry = notificationService.notify(req.body);
      res.status(202).json({ accepted: true, notification: entry });
    } catch (err) {
      next(err);
    }
  });

  router.get('/history', (req, res, next) => {
    try {
      const limit = Math.min(Number(req.query.limit) || 50, 200);
      res.json(notificationService.getHistory(limit));
    } catch (err) {
      next(err);
    }
  });

  router.get('/history/order/:orderId', (req, res, next) => {
    try {
      res.json(notificationService.getByOrder(req.params.orderId));
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = { createNotifyRouter };

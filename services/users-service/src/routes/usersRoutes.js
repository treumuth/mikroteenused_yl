const express = require('express');
const { AppError } = require('@raamatupood/common');

function createUsersRouter(userService) {
  const router = express.Router();

  /**
   * GET /users — kõik kasutajad (õppeotstarbeks; gateway võib seda avaldada).
   */
  router.get('/', (req, res, next) => {
    try {
      const limit = Math.min(Number(req.query.limit) || 50, 100);
      const result = userService.listUsers(limit);
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /users/:id — üks kasutaja; orders-service kutsub seda enne tellimust.
   */
  router.get('/:id', (req, res, next) => {
    try {
      const { found, user } = userService.getUserById(req.params.id);
      if (!found) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND', { userId: req.params.id });
      }
      res.json({ user });
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /users/:id/validate-order — kiire kontroll (active + exists).
   */
  router.get('/:id/validate-order', (req, res, next) => {
    try {
      const user = userService.validateUserForOrder(req.params.id);
      res.json({
        valid: true,
        userId: user.id,
        displayName: user.displayName,
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = { createUsersRouter };

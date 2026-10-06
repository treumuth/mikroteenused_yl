const { createOrder } = require('./createOrder');
const { AppError } = require('@raamatupood/common');

class OrderService {
  constructor(orderRepository, upstream, logger) {
    this.orderRepository = orderRepository;
    this.upstream = upstream;
    this.logger = logger;
  }

  async placeOrder(body) {
    if (!body || typeof body !== 'object') {
      throw new AppError('Request body required', 400, 'VALIDATION_ERROR');
    }
    if (body.userId === undefined || body.userId === null || body.userId === '') {
      throw new AppError('userId is required', 400, 'VALIDATION_ERROR', { field: 'userId' });
    }
    return createOrder(
      {
        orderRepository: this.orderRepository,
        upstream: this.upstream,
        logger: this.logger,
      },
      body
    );
  }

  getOrder(orderId) {
    const order = this.orderRepository.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND', { orderId });
    }
    return order;
  }

  listOrders() {
    return { items: this.orderRepository.listRecent() };
  }
}

module.exports = { OrderService };

const crypto = require('crypto');
const {
  AppError,
  validateArray,
  validateNonEmptyString,
  validatePositiveInt,
} = require('@raamatupood/common');

/**
 * Tellimuse loomise orchestration — see on ülesande tuum.
 *
 * Edukas voog:
 * 1) valideeri sisend
 * 2) kontrolli kasutajat users-service'is
 * 3) iga rea kohta loe hind catalog-service'ist ja reserveeri laoseis
 * 4) salvesta tellimus, kinnita lao mahakanded, saada teavitus
 *
 * Kui reserveerimine ebaõnnestub, vabastatakse juba reserveeritud read (saga tagasipööramine).
 */

function buildReservationId(orderId, lineIndex) {
  return `${orderId}-line-${lineIndex}`;
}

function calculateLineTotalCents(unitPriceCents, quantity) {
  return unitPriceCents * quantity;
}

function calculateOrderTotalCents(lines) {
  return lines.reduce((sum, line) => sum + line.lineTotalCents, 0);
}

async function createOrder(deps, input) {
  const { orderRepository, upstream, logger } = deps;

  const userId = validateNonEmptyString(input.userId, 'userId');
  const rawLines = validateArray(input.lines, 'lines', 1);

  const orderId = orderRepository.generateOrderId();
  const reservationSession = crypto.randomBytes(4).toString('hex');

  logger.info('Starting order creation', { orderId, userId, lineCount: rawLines.length });

  // --- Kasutaja kontroll (users-service) ---
  let user;
  try {
    user = await upstream.fetchUser(userId);
  } catch (err) {
    if (err.statusCode === 404) {
      throw new AppError('Cannot create order: user not found', 404, 'USER_NOT_FOUND', { userId });
    }
    throw err;
  }
  if (!user.active) {
    throw new AppError('Cannot create order: user inactive', 403, 'USER_INACTIVE', { userId });
  }

  const reservedLines = [];
  const orderLines = [];

  try {
    for (let i = 0; i < rawLines.length; i += 1) {
      const line = rawLines[i];
      const bookId = validateNonEmptyString(line.bookId, `lines[${i}].bookId`);
      const quantity = validatePositiveInt(line.quantity, `lines[${i}].quantity`);

      const book = await upstream.fetchBook(bookId);
      if (!book) {
        throw new AppError('Book not found for order line', 404, 'BOOK_NOT_FOUND', { bookId });
      }

      const reservationId = buildReservationId(orderId, i);
      await upstream.reserveStock(bookId, quantity, `${reservationSession}-${reservationId}`);

      reservedLines.push({ bookId, quantity, reservationId: `${reservationSession}-${reservationId}` });

      const lineTotalCents = calculateLineTotalCents(book.priceCents, quantity);
      orderLines.push({
        bookId,
        title: book.title,
        quantity,
        unitPriceCents: book.priceCents,
        lineTotalCents,
      });
    }
  } catch (err) {
    logger.warn('Order line failed — rolling back reservations', {
      orderId,
      error: err.message,
      reservedCount: reservedLines.length,
    });
    await rollbackReservations(upstream, logger, reservedLines);
    if (err.statusCode === 409 && err.code === 'INSUFFICIENT_STOCK') {
      throw new AppError('Insufficient stock for one or more items', 409, 'INSUFFICIENT_STOCK', err.details);
    }
    throw err;
  }

  const totalCents = calculateOrderTotalCents(orderLines);

  const order = {
    orderId,
    userId,
    userDisplayName: user.displayName,
    status: 'confirmed',
    lines: orderLines,
    totalCents,
    currency: 'EUR',
  };

  orderRepository.save(order);

  for (const line of orderLines) {
    await upstream.commitStock(line.bookId, line.quantity);
  }

  try {
    await upstream.sendOrderNotification({
      type: 'ORDER_CONFIRMED',
      orderId: order.orderId,
      userId: order.userId,
      email: user.email,
      totalCents: order.totalCents,
      lineCount: order.lines.length,
    });
  } catch (notifyErr) {
    logger.error('Notification failed but order saved', {
      orderId,
      message: notifyErr.message,
    });
  }

  logger.info('Order created successfully', { orderId, totalCents });

  return {
    orderId: order.orderId,
    status: order.status,
    totalCents: order.totalCents,
    totalEuros: (order.totalCents / 100).toFixed(2),
    lines: order.lines,
  };
}

async function rollbackReservations(upstream, logger, reservedLines) {
  for (const r of reservedLines) {
    try {
      await upstream.releaseStock(r.bookId, r.quantity, r.reservationId);
    } catch (releaseErr) {
      logger.error('Failed to release stock during rollback', {
        bookId: r.bookId,
        reservationId: r.reservationId,
        message: releaseErr.message,
      });
    }
  }
}

module.exports = { createOrder, calculateOrderTotalCents, calculateLineTotalCents };

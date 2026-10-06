const { AppError, validatePositiveInt, validateNonEmptyString } = require('@raamatupood/common');

/**
 * Tellimuse ridade valideerimine — eraldi moodul, et createOrder.js jääks loetavaks.
 */

function validateOrderLine(line, index) {
  if (!line || typeof line !== 'object') {
    throw new AppError(`lines[${index}] must be an object`, 400, 'VALIDATION_ERROR');
  }
  const bookId = validateNonEmptyString(line.bookId, `lines[${index}].bookId`);
  const quantity = validatePositiveInt(line.quantity, `lines[${index}].quantity`);
  if (quantity > 100) {
    throw new AppError(`lines[${index}].quantity exceeds max 100`, 400, 'VALIDATION_ERROR');
  }
  return { bookId, quantity };
}

function validateAllLines(rawLines) {
  const seen = new Set();
  const normalized = [];
  for (let i = 0; i < rawLines.length; i += 1) {
    const line = validateOrderLine(rawLines[i], i);
    const key = `${line.bookId}:${line.quantity}`;
    if (seen.has(line.bookId)) {
      // Lubame sama bookId mitmes reas — see on äriloogiline valik; dokumenteeritud siin.
      // Õpilased võivad arutleda, kas peaks mergeima read.
    }
    seen.add(key);
    normalized.push(line);
  }
  return normalized;
}

module.exports = { validateOrderLine, validateAllLines };

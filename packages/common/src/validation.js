const { AppError } = require('./errors');

function fail(field, reason) {
  throw new AppError(`Validation failed for ${field}: ${reason}`, 400, 'VALIDATION_ERROR', {
    field,
    reason,
  });
}

function validatePositiveInt(value, fieldName) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) {
    fail(fieldName, 'must be a positive integer');
  }
  return n;
}

function validateNonEmptyString(value, fieldName) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    fail(fieldName, 'must be a non-empty string');
  }
  return value.trim();
}

function validateArray(value, fieldName, minLength = 1) {
  if (!Array.isArray(value) || value.length < minLength) {
    fail(fieldName, `must be an array with at least ${minLength} item(s)`);
  }
  return value;
}

function validateBoolean(value, fieldName) {
  if (typeof value !== 'boolean') {
    fail(fieldName, 'must be a boolean');
  }
  return value;
}

module.exports = {
  validatePositiveInt,
  validateNonEmptyString,
  validateArray,
  validateBoolean,
};

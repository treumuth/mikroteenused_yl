/**
 * Lihtne struktureeritud logimine — iga teenus saab oma nimega loggeri.
 * Mikroteenuste kontekstis aitab logid eristada, millisest konteinerist rida tuli.
 */

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

function formatMeta(meta) {
  if (!meta || Object.keys(meta).length === 0) {
    return '';
  }
  try {
    return ' ' + JSON.stringify(meta);
  } catch {
    return ' [meta unserializable]';
  }
}

function createLogger(serviceName, minLevel = 'info') {
  const threshold = LEVELS[minLevel] ?? LEVELS.info;
  const prefix = `[${serviceName}]`;

  function log(level, message, meta) {
    if (LEVELS[level] < threshold) {
      return;
    }
    const ts = new Date().toISOString();
    const line = `${ts} ${prefix} ${level.toUpperCase()} ${message}${formatMeta(meta)}`;
    if (level === 'error') {
      console.error(line);
    } else if (level === 'warn') {
      console.warn(line);
    } else {
      console.log(line);
    }
  }

  return {
    debug: (msg, meta) => log('debug', msg, meta),
    info: (msg, meta) => log('info', msg, meta),
    warn: (msg, meta) => log('warn', msg, meta),
    error: (msg, meta) => log('error', msg, meta),
  };
}

module.exports = { createLogger };

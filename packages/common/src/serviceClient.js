/**
 * HTTP klient teiste mikroteenuste kutsumiseks.
 * Orders-service kasutab seda users-, catalog- ja notifications-teenuste poole pöördumiseks.
 */

const { AppError } = require('./errors');

class ServiceClient {
  /**
   * @param {object} options
   * @param {string} options.baseUrl — nt process.env.USERS_SERVICE_URL
   * @param {import('./logger').createLogger extends Function ? ReturnType<createLogger> : object} options.logger
   * @param {number} [options.timeoutMs]
   */
  constructor({ baseUrl, logger, timeoutMs = 8000 }) {
    if (!baseUrl) {
      throw new Error('ServiceClient requires baseUrl');
    }
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.logger = logger;
    this.timeoutMs = timeoutMs;
  }

  async request(method, path, body) {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    const init = {
      method,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      signal: controller.signal,
    };
    if (body !== undefined) {
      init.body = JSON.stringify(body);
    }

    this.logger.debug('Outbound service call', { method, url });

    try {
      const res = await fetch(url, init);
      clearTimeout(timer);
      const text = await res.text();
      let data = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = { raw: text };
        }
      }

      if (!res.ok) {
        const errMsg = data?.error?.message || data?.message || res.statusText;
        const errCode = data?.error?.code || 'UPSTREAM_ERROR';
        throw new AppError(
          `Upstream ${method} ${url} failed: ${errMsg}`,
          res.status >= 400 && res.status < 600 ? res.status : 502,
          errCode,
          data?.error?.details
        );
      }
      return data;
    } catch (err) {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        throw new AppError(`Upstream timeout: ${method} ${url}`, 504, 'UPSTREAM_TIMEOUT');
      }
      if (err instanceof AppError) {
        throw err;
      }
      this.logger.error('Upstream network error', { method, url, message: err.message });
      throw new AppError(`Upstream unreachable: ${method} ${url}`, 502, 'UPSTREAM_UNREACHABLE');
    }
  }

  get(path) {
    return this.request('GET', path);
  }

  post(path, body) {
    return this.request('POST', path, body);
  }
}

module.exports = { ServiceClient };

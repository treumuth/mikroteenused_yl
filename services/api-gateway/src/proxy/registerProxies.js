const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * Registreerib iga routeTable rea jaoks HTTP proxy Expressi appile.
 * pathRewrite eemaldab avaliku /api/... prefiksi ja asendab upstream prefiksiga.
 */
function registerProxies(app, routes, logger) {
  for (const route of routes) {
    app.use(
      route.publicPrefix,
      createProxyMiddleware({
        target: route.target,
        changeOrigin: true,
        pathRewrite(pathname) {
          if (pathname === '/' || pathname === '') {
            return route.upstreamPrefix;
          }
          return `${route.upstreamPrefix}${pathname}`;
        },
        on: {
          proxyReq: (proxyReq, req) => {
            logger.debug('Proxy forward', {
              route: route.name,
              method: req.method,
              from: req.originalUrl,
              target: route.target,
            });
          },
          error: (err, req, res) => {
            logger.error('Proxy error', { route: route.name, message: err.message });
            if (!res.headersSent) {
              res.status(502).json({
                error: {
                  code: 'BAD_GATEWAY',
                  message: `Upstream ${route.name} unavailable`,
                },
              });
            }
          },
        },
      })
    );
  }
}

module.exports = { registerProxies };

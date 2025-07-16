const { logActivity } = require('../utils/activityLogger');

/**
 * Express middleware to log user actions and system events
 * Logs all non-static, non-healthcheck requests
 */
function activityLogger(req, res, next) {
  // Skip static assets and health checks
  if (req.path.startsWith('/static') || req.path.startsWith('/uploads') || req.path === '/favicon.ico' || req.path === '/api/health') {
    return next();
  }

  const start = Date.now();
  const user = req.user ? req.user._id : undefined;
  const ip = req.ip || req.connection?.remoteAddress;
  const userAgent = req.get('User-Agent');

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode < 400 ? 'success' : 'failure';
    const action = req.method.toLowerCase();
    const description = `${req.method} ${req.originalUrl} (${res.statusCode}) in ${duration}ms`;
    logActivity({
      user,
      action,
      targetType: undefined,
      targetId: undefined,
      description,
      metadata: {
        method: req.method,
        path: req.originalUrl,
        query: req.query,
        body: req.body,
        duration,
        statusCode: res.statusCode
      },
      ip,
      userAgent,
      status
    });
  });

  next();
}

module.exports = activityLogger; 
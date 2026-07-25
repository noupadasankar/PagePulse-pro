import app from './app';
import http from 'http';
import { config } from './config/env';
import { logger } from './utils/logger';

const server = http.createServer(app);

server.listen(config.PORT, () => {
  logger.info(`Server listening on port ${config.PORT}`, { env: config.NODE_ENV });
});

// Graceful shutdown: stop accepting connections, let in-flight requests finish.
const shutdown = () => {
  logger.info('Shutdown signal received, closing server gracefully');

  const timeoutId = setTimeout(() => {
    logger.error('Could not close connections in time, forcing shutdown');
    process.exit(1);
  }, 10000);

  server.close(() => {
    logger.info('Closed out remaining connections');
    clearTimeout(timeoutId);
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

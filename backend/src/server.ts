import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import prisma from './config/db.js';
import { cleanupExpiredTokens } from './services/tokenService.js';
import { logger } from './utils/logger.js';
import { env } from './config/env.js';
import { TOKEN } from './constants/index.js';
import { handleUnhandledRejection, handleUncaughtException } from './middlewares/errorHandler.js';

// Handle uncaught exceptions
process.on('uncaughtException', handleUncaughtException);

// Handle unhandled promise rejections
process.on('unhandledRejection', handleUnhandledRejection);

// Connect to database
try {
  await prisma.$connect();
  logger.info('Database connected successfully');
} catch (error) {
  logger.error('Database connection failed', error);
  process.exit(1);
}

// Cleanup expired tokens periodically
setInterval(() => {
  cleanupExpiredTokens().catch((error) => {
    logger.error('Token cleanup failed', error);
  });
}, TOKEN.CLEANUP_INTERVAL_MS);

logger.info('Token cleanup scheduled', { 
  intervalMs: TOKEN.CLEANUP_INTERVAL_MS,
  intervalHours: TOKEN.CLEANUP_INTERVAL_MS / (60 * 60 * 1000)
});

// Start server
const server = app.listen(env.PORT, () => {
  logger.info(`Server running in ${env.NODE_ENV} mode`, {
    port: env.PORT,
    health: `http://localhost:${env.PORT}/health`
  });
});

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.info(`${signal} received, closing server gracefully`);
  
  server.close(async () => {
    logger.info('HTTP server closed');
    
    try {
      await prisma.$disconnect();
      logger.info('Database disconnected');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', error);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

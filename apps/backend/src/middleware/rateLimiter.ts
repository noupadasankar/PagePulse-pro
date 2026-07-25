import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { config } from '../config/env';
import { HTTP_STATUS } from '../constants';

/**
 * Per-IP request throttle.
 *
 * Limits come from config (30 requests/minute by default) rather than being
 * hardcoded, so they can be tuned per environment without a code change.
 *
 * In production with multiple instances, Redis store is required for accurate
 * rate limiting across instances. Set REDIS_URL env var to enable.
 */
let redisStore: any;

async function initRedisStore() {
  if (config.NODE_ENV === 'production' && process.env.REDIS_URL) {
    try {
      const { default: RedisStore } = await import('rate-limit-redis');
      const { createClient } = await import('redis');

      const redisClient = createClient({ url: process.env.REDIS_URL });
      redisClient.connect().catch(() => {});

      redisStore = new RedisStore({
        sendCommand: (...args: string[]) => redisClient.sendCommand(args),
      });
    } catch {
      // Redis not available, fall back to memory store
    }
  }
}

initRedisStore();

export const rateLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore,
  keyGenerator: (req: Request): string => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    // Bucket IPv6 clients by /64: a single user is typically assigned a whole
    // prefix, so keying on the full address would let them evade the limit by
    // rotating addresses within it.
    if (ip.includes(':')) {
      const segments = ip.split(':');
      if (segments.length >= 4) return `${segments.slice(0, 4).join(':')}::/64`;
    }

    return ip;
  },
  handler: (req: Request, res: Response) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please wait a moment and try again.',
        recoveryAdvice: `This endpoint allows ${config.RATE_LIMIT_MAX} requests per ${
          config.RATE_LIMIT_WINDOW_MS / 1000
        } seconds.`,
      },
      meta: {
        requestId: req.id || 'unknown',
        timestamp: new Date().toISOString(),
      },
    });
  },
});
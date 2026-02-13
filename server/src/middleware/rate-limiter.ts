import rateLimit from 'express-rate-limit';
import { config } from '../config';

export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { error: 'API请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});

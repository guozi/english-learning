import cors from 'cors';
import { config } from '../config';

const allowedOrigins = config.nodeEnv === 'production'
  ? [process.env.CLIENT_ORIGIN, process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`].filter(Boolean) as string[]
  : ['http://localhost:5173', 'http://localhost:3000'];

export const corsMiddleware = cors({
  origin: config.nodeEnv === 'production'
    ? (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      }
    : allowedOrigins,
  credentials: true,
});

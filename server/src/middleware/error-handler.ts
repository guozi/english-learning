import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error('[Error]', err.message);

  if (err.message.includes('API')) {
    res.status(502).json({ error: `AI 服务错误: ${err.message}` });
    return;
  }

  res.status(500).json({ error: err.message || '服务器内部错误' });
}

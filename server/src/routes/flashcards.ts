import { Router, Request, Response, NextFunction } from 'express';
import { extractWords } from '../services/ai-service';

export const flashcardsRouter = Router();

flashcardsRouter.post('/extract', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text, maxWords = 10, level = 'all', aiConfig } = req.body;
    if (!text) {
      res.status(400).json({ error: '请提供文本内容' });
      return;
    }
    const result = await extractWords(text, maxWords, level, aiConfig);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

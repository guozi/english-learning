import { Router, Request, Response, NextFunction } from 'express';
import { analyzeSentence } from '../services/ai-service';

export const sentenceRouter = Router();

sentenceRouter.post('/analyze', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sentence, aiConfig } = req.body;
    if (!sentence) {
      res.status(400).json({ error: '请提供句子' });
      return;
    }
    const result = await analyzeSentence(sentence, aiConfig);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

import { Router, Request, Response, NextFunction } from 'express';
import { generateReadingContent } from '../services/ai-service';

export const readingRouter = Router();

readingRouter.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text, language = 'en', aiConfig } = req.body;
    if (!text) {
      res.status(400).json({ error: '请提供文本内容' });
      return;
    }
    const result = await generateReadingContent(text, language, aiConfig);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

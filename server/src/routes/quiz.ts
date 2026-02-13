import { Router, Request, Response, NextFunction } from 'express';
import { generateReadingQuestions, generateVocabularyQuestions } from '../services/ai-service';

export const quizRouter = Router();

quizRouter.post('/reading-questions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reading, questionCount = 5, aiConfig } = req.body;
    if (!reading) {
      res.status(400).json({ error: '请提供阅读内容' });
      return;
    }
    const result = await generateReadingQuestions(reading, questionCount, aiConfig);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

quizRouter.post('/vocabulary-questions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { vocabulary, questionCount = 5, aiConfig } = req.body;
    if (!vocabulary || !Array.isArray(vocabulary)) {
      res.status(400).json({ error: '请提供词汇列表' });
      return;
    }
    const result = await generateVocabularyQuestions(vocabulary, questionCount, aiConfig);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

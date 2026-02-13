import { Router, Request, Response, NextFunction } from 'express';
import { generateLearningReport } from '../services/ai-service';

export const reportRouter = Router();

reportRouter.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reportType, learningData, aiConfig } = req.body;
    if (!reportType || !learningData) {
      res.status(400).json({ error: '请提供报告类型和学习数据' });
      return;
    }
    const result = await generateLearningReport(reportType, learningData, aiConfig);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

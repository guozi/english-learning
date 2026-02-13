import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/toast-context';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  BookOpen, Type, ListChecks, RotateCcw,
  Trophy, ChevronRight, AlertTriangle, CheckCircle2, XCircle,
} from 'lucide-react';
import type { QuizQuestion, ReadingContent, TestResult } from '@/types';
import { AIConfigBanner } from '@/components/settings/AIConfigBanner';

type Phase = 'select' | 'quiz' | 'result';

export function QuizPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentReading = (location.state as { currentReading?: ReadingContent })?.currentReading ?? null;

  const [phase, setPhase] = useState<Phase>('select');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [answered, setAnswered] = useState(false);
  const [testType, setTestType] = useState<'reading' | 'vocabulary'>('reading');
  const [showReview, setShowReview] = useState(false);
  const [, setTestHistory] = useLocalStorage<TestResult[]>('testHistory', []);

  const startQuiz = async (type: 'reading' | 'vocabulary') => {
    if (!currentReading) {
      toast('没有阅读内容，请先在阅读页面生成内容', 'warning');
      navigate('/reading');
      return;
    }
    setTestType(type);
    setLoading(true);
    try {
      const result = type === 'reading'
        ? await api.quiz.readingQuestions(currentReading.english) as QuizQuestion[]
        : await api.quiz.vocabularyQuestions(currentReading.vocabulary) as QuizQuestion[];
      if (!Array.isArray(result) || result.length === 0) {
        toast('未生成有效题目，请重试或更换阅读内容', 'warning');
        return;
      }
      setQuestions(result);
      setUserAnswers(new Array(result.length).fill(null));
      setQIndex(0);
      setAnswered(false);
      setPhase('quiz');
      toast(`已生成 ${result.length} 道${type === 'reading' ? '阅读理解' : '词汇'}题`, 'success');
    } catch (err) {
      toast(`生成测试题失败: ${(err as Error).message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectOption = useCallback((optionIdx: number) => {
    if (answered) return;
    setUserAnswers(prev => {
      const next = [...prev];
      next[qIndex] = optionIdx;
      return next;
    });
    setAnswered(true);
  }, [answered, qIndex]);

  const nextQuestion = useCallback(() => {
    if (!answered) return;
    if (qIndex + 1 >= questions.length) {
      const correct = userAnswers.filter((a, i) => a === questions[i].correctIndex).length;
      const score = Math.round((correct / questions.length) * 100);
      setTestHistory(prev => [...prev, {
        type: testType,
        score,
        date: new Date().toISOString(),
        readingTitle: currentReading?.title || '未知阅读',
      }].slice(-20));
      setPhase('result');
    } else {
      setQIndex(i => i + 1);
      setAnswered(false);
    }
  }, [answered, qIndex, questions, userAnswers, testType, currentReading, setTestHistory]);

  // Keyboard shortcuts
  useEffect(() => {
    if (phase !== 'quiz') return;
    const handler = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '4' && !answered) {
        const idx = parseInt(e.key) - 1;
        if (idx < (questions[qIndex]?.options.length ?? 0)) selectOption(idx);
      }
      if ((e.key === 'Enter' || e.key === ' ') && answered) {
        e.preventDefault();
        nextQuestion();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, answered, qIndex, questions, selectOption, nextQuestion]);

  const correctCount = userAnswers.filter((a, i) => a === questions[i]?.correctIndex).length;
  const wrongCount = questions.length - correctCount;
  const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
  const q = questions[qIndex];

  const wrongQuestions = questions
    .map((q, i) => ({ ...q, userAnswer: userAnswers[i], index: i }))
    .filter(q => q.userAnswer !== q.correctIndex);

  const scoreColor = score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : 'text-red-500';
  const scoreEmoji = score >= 90 ? '🎉' : score >= 70 ? '👍' : score >= 50 ? '💪' : '📚';

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <AIConfigBanner />

      {/* Selection phase */}
      {phase === 'select' && !loading && (
        <>
          {!currentReading ? (
            <EmptyState
              icon={<ListChecks className="h-16 w-16" />}
              title="暂无阅读内容"
              description="请先在双语阅读页面生成内容，然后点击「生成测试」进入测试。"
              action={
                <Button onClick={() => navigate('/reading')}>
                  <BookOpen className="h-4 w-4 mr-1.5" /> 前往双语阅读
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card
                className="cursor-pointer group hover:shadow-xl hover:border-primary-300 dark:hover:border-primary-700 transition-all"
                onClick={() => startQuiz('reading')}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-bold">阅读理解测试</h2>
                </div>
                <p className="text-muted-foreground text-sm">
                  根据阅读内容生成理解题目，测试你对文章的理解程度。
                </p>
              </Card>
              <Card
                className="cursor-pointer group hover:shadow-xl hover:border-primary-300 dark:hover:border-primary-700 transition-all"
                onClick={() => startQuiz('vocabulary')}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                    <Type className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-bold">词汇测试</h2>
                </div>
                <p className="text-muted-foreground text-sm">
                  根据学习的词汇生成测试题，检验词汇掌握情况。
                </p>
              </Card>
              {currentReading.title && (
                <p className="col-span-full text-center text-sm text-muted-foreground">
                  当前阅读：<span className="font-medium text-foreground">{currentReading.title}</span>
                </p>
              )}
            </div>
          )}
        </>
      )}

      {loading && <LoadingSpinner text="AI 正在生成测试题..." />}

      {/* Quiz phase */}
      {phase === 'quiz' && q && (
        <div>
          {/* Progress */}
          <div className="mb-5">
            <div className="flex justify-between text-sm text-muted-foreground mb-1.5">
              <span>问题 {qIndex + 1} / {questions.length}</span>
              <span className="flex items-center gap-1.5">
                {testType === 'reading'
                  ? <><BookOpen className="h-3.5 w-3.5" /> 阅读理解</>
                  : <><Type className="h-3.5 w-3.5" /> 词汇测试</>
                }
              </span>
            </div>
            <div className="flashcard-progress-track">
              <div
                className="flashcard-progress-fill"
                style={{ width: `${((qIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <Card className="analysis-highlight-card pt-6 mb-4">
            <p className="font-semibold text-lg mb-5">{q.question}</p>
            <div className="space-y-3">
              {q.options.map((opt, i) => {
                const isSelected = userAnswers[qIndex] === i;
                const isCorrect = i === q.correctIndex;
                const showResult = answered;

                return (
                  <div
                    key={i}
                    onClick={() => selectOption(i)}
                    className={cn(
                      'quiz-option border rounded-lg p-4 cursor-pointer flex items-center gap-3 transition-all',
                      showResult && isCorrect && 'correct',
                      showResult && isSelected && !isCorrect && 'incorrect',
                      !showResult && 'border-border hover:bg-muted',
                    )}
                  >
                    <span className={cn(
                      'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold border',
                      showResult && isCorrect && 'bg-green-500 text-white border-green-500',
                      showResult && isSelected && !isCorrect && 'bg-red-500 text-white border-red-500',
                      !showResult && 'border-border text-muted-foreground',
                    )}>
                      {showResult && isCorrect ? <CheckCircle2 className="h-4 w-4" /> :
                       showResult && isSelected && !isCorrect ? <XCircle className="h-4 w-4" /> :
                       String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100">
                      {!answered && `按 ${i + 1}`}
                    </span>
                  </div>
                );
              })}
            </div>
            {answered && q.explanation && (
              <div className="analysis-item mt-4 text-sm" style={{ '--item-color': '#0ea5e9' } as React.CSSProperties}>
                <span className="font-semibold text-primary-700 dark:text-primary-300">解释：</span>
                <span className="text-primary-800 dark:text-primary-200">{q.explanation}</span>
              </div>
            )}
          </Card>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              按 1-4 选择答案，Enter 下一题
            </p>
            <Button onClick={nextQuestion} disabled={!answered}>
              {qIndex + 1 >= questions.length ? '查看结果' : '下一题'}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Result phase */}
      {phase === 'result' && (
        <div className="animate-fade-in-up">
          <Card className="analysis-highlight-card pt-6 text-center mb-6">
            <p className="text-4xl mb-2">{scoreEmoji}</p>
            <h2 className="text-2xl font-bold mb-1">
              {testType === 'reading' ? '阅读理解测试' : '词汇测试'} 完成
            </h2>
            <p className={cn('text-6xl font-bold my-6', scoreColor)}>{score}%</p>
            <div className="flex justify-center gap-8 mb-6">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">正确 {correctCount}</span>
              </div>
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">错误 {wrongCount}</span>
              </div>
            </div>

            {score < 80 && (
              <div className="mb-6 text-left text-sm">
                <p className="analysis-card-header !mb-3 justify-center">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" /> <span className="font-semibold">改进建议</span>
                </p>
                <ul className="space-y-2">
                  <li className="analysis-item" style={{ '--item-color': '#f59e0b' } as React.CSSProperties}>加强阅读理解能力，注重把握文章主旨</li>
                  <li className="analysis-item" style={{ '--item-color': '#f59e0b' } as React.CSSProperties}>扩大词汇量，特别是关键学术词汇</li>
                  <li className="analysis-item" style={{ '--item-color': '#f59e0b' } as React.CSSProperties}>练习识别文章的逻辑结构和论证方式</li>
                </ul>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-3">
              {wrongCount > 0 && (
                <Button variant="outline" onClick={() => setShowReview(!showReview)}>
                  <AlertTriangle className="h-4 w-4 mr-1.5" />
                  {showReview ? '收起错题' : `查看错题 (${wrongCount})`}
                </Button>
              )}
              <Button variant="outline" onClick={() => { setPhase('select'); setQuestions([]); setShowReview(false); }}>
                <RotateCcw className="h-4 w-4 mr-1.5" /> 重新选择
              </Button>
              <Button onClick={() => navigate('/achievements')}>
                <Trophy className="h-4 w-4 mr-1.5" /> 查看成就
              </Button>
            </div>
          </Card>

          {/* Error review */}
          {showReview && wrongQuestions.length > 0 && (
            <div className="space-y-4">
              <div className="analysis-card-header">
                <XCircle className="h-5 w-5 text-red-500" />
                <h3 className="font-bold text-lg">错题回顾</h3>
              </div>
              {wrongQuestions.map((wq, i) => (
                <Card key={i} className="border-red-200 dark:border-red-900/50">
                  <p className="font-semibold mb-3">
                    <span className="text-red-500 mr-2">#{wq.index + 1}</span>
                    {wq.question}
                  </p>
                  <div className="space-y-2 text-sm">
                    {wq.options.map((opt, oi) => (
                      <div key={oi} className={cn(
                        'px-3 py-2 rounded-md flex items-center gap-2',
                        oi === wq.correctIndex && 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',
                        oi === wq.userAnswer && oi !== wq.correctIndex && 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 line-through',
                      )}>
                        {oi === wq.correctIndex && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                        {oi === wq.userAnswer && oi !== wq.correctIndex && <XCircle className="h-4 w-4 shrink-0" />}
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                  {wq.explanation && (
                    <p className="mt-3 text-sm text-muted-foreground">
                      <span className="font-medium">解释：</span>{wq.explanation}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

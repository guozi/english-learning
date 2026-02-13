import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/toast-context';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  Trophy, Clock, BookOpen, Target, TrendingUp,
  ThumbsUp, AlertTriangle, Lightbulb, Share2,
  X, BarChart3,
} from 'lucide-react';
import type { LearningReport, Word, ReadingContent, TestResult } from '@/types';
import { AIConfigBanner } from '@/components/settings/AIConfigBanner';

const reportTypes = [
  { value: 'weekly', label: '周报', icon: Clock },
  { value: 'monthly', label: '月报', icon: BarChart3 },
  { value: 'term', label: '学期报告', icon: TrendingUp },
];

export function AchievementsPage() {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState('weekly');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<LearningReport | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [flashcards] = useLocalStorage<Word[]>('flashcards', []);
  const [readingHistory] = useLocalStorage<ReadingContent[]>('readingHistory', []);
  const [testHistory] = useLocalStorage<TestResult[]>('testHistory', []);
  const [, setReportHistory] = useLocalStorage<LearningReport[]>('reportHistory', []);

  const hasData = flashcards.length > 0 || readingHistory.length > 0 || testHistory.length > 0;

  const generateReport = async () => {
    if (!hasData) {
      toast('暂无学习数据，请先完成一些学习活动', 'warning');
      return;
    }
    setLoading(true);
    try {
      const learningData = { flashcards, readingHistory, testHistory };
      const result = await api.report.generate(selectedType, learningData) as LearningReport;
      setReport(result);
      setReportHistory(prev => [{ ...result, timestamp: Date.now() }, ...prev].slice(0, 10));
      toast('学习报告生成成功', 'success');
    } catch (err) {
      toast(`生成报告失败: ${(err as Error).message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = () => {
    const text = report
      ? `📊 ${report.title}\n${report.summary}\n✅ 词汇: ${report.vocabulary.learned} | 📖 阅读: ${report.reading.articles}篇 | 🎯 测试: ${report.tests.averageScore}分`
      : '';
    navigator.clipboard.writeText(text).then(() => {
      toast('已复制到剪贴板', 'success');
      setShowShare(false);
    });
  };

  // Quick stats from localStorage
  const quickStats = [
    { label: '已学单词', value: flashcards.length, icon: BookOpen },
    { label: '阅读篇数', value: readingHistory.length, icon: BookOpen },
    { label: '测试次数', value: testHistory.length, icon: Target },
    { label: '平均分数', value: testHistory.length > 0 ? Math.round(testHistory.reduce((s, t) => s + t.score, 0) / testHistory.length) : 0, icon: TrendingUp, suffix: '分' },
  ];

  const statColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <>
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <AIConfigBanner />

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {quickStats.map((stat, i) => (
          <div
            key={stat.label}
            className="analysis-item bg-card border border-border/50 rounded-xl !rounded-l-none p-4 text-center"
            style={{ '--item-color': statColors[i] } as React.CSSProperties}
          >
            <stat.icon className="h-5 w-5 mx-auto mb-2" style={{ color: statColors[i] }} />
            <p className="text-2xl font-bold text-foreground">{stat.value}{stat.suffix || ''}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Report type selector */}
      <Card className="mb-10">
        <div className="analysis-card-header">
          <BarChart3 className="h-5 w-5 text-primary-500" />
          <h2 className="font-bold">生成学习报告</h2>
        </div>
        <div className="flex flex-wrap gap-3 mb-4">
          {reportTypes.map(rt => {
            const Icon = rt.icon;
            return (
              <button
                key={rt.value}
                onClick={() => setSelectedType(rt.value)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all',
                  selectedType === rt.value
                    ? 'bg-primary-100 dark:bg-primary-900/40 border-primary-500 text-primary-700 dark:text-primary-300 shadow-sm'
                    : 'border-border text-muted-foreground hover:border-primary-300 hover:text-primary-600 dark:hover:text-primary-400',
                )}
              >
                <Icon className="h-4 w-4" />
                {rt.label}
              </button>
            );
          })}
        </div>
        <Button onClick={generateReport} loading={loading} disabled={loading || !hasData}>
          <BarChart3 className="h-4 w-4 mr-1.5" />
          生成学习报告
        </Button>
        {!hasData && (
          <p className="text-xs text-muted-foreground mt-2">暂无学习数据，请先完成一些学习活动。</p>
        )}
      </Card>

      {loading && <LoadingSpinner text="AI 正在分析学习数据..." />}

      {!report && !loading && !hasData && (
        <EmptyState
          icon={<Trophy className="h-16 w-16" />}
          title="开始你的学习之旅"
          description="完成闪卡学习、双语阅读或理解测试后，即可生成学习报告。"
        />
      )}

      {/* Report display */}
      {report && !loading && (
        <div className="space-y-6 animate-fade-in-up">
          <Card className="analysis-highlight-card pt-6">
            <h2 className="text-xl font-bold">{report.title}</h2>
            <p className="text-sm text-muted-foreground mb-3">{report.period}</p>
            <p className="leading-relaxed">{report.summary}</p>
          </Card>

          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="!pl-0 overflow-hidden">
              <div className="analysis-item h-full !rounded-none" style={{ '--item-color': '#0ea5e9' } as React.CSSProperties}>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-sky-500" />
                  <h3 className="font-bold">学习时间</h3>
                </div>
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{report.timeStats.totalHours}h</p>
                <p className="text-sm text-muted-foreground mt-1">日均 {report.timeStats.averageDaily}h · {report.timeStats.trend}</p>
              </div>
            </Card>
            <Card className="!pl-0 overflow-hidden">
              <div className="analysis-item h-full !rounded-none" style={{ '--item-color': '#10b981' } as React.CSSProperties}>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-5 w-5 text-emerald-500" />
                  <h3 className="font-bold">词汇学习</h3>
                </div>
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{report.vocabulary.learned}</p>
                <p className="text-sm text-muted-foreground mt-1">掌握 {report.vocabulary.mastered} · 待复习 {report.vocabulary.needReview}</p>
              </div>
            </Card>
            <Card className="!pl-0 overflow-hidden">
              <div className="analysis-item h-full !rounded-none" style={{ '--item-color': '#f59e0b' } as React.CSSProperties}>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-amber-500" />
                  <h3 className="font-bold">测试成绩</h3>
                </div>
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{report.tests.averageScore}分</p>
                <p className="text-sm text-muted-foreground mt-1">完成 {report.tests.completed} 次 · {report.tests.improvement}</p>
              </div>
            </Card>
          </div>

          {/* Reading stats */}
          <Card>
            <div className="analysis-card-header">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <h3 className="font-bold">阅读情况</h3>
            </div>
            <div className="analysis-item" style={{ '--item-color': '#3b82f6' } as React.CSSProperties}>
              <p>阅读 {report.reading.articles} 篇 · 难度: {report.reading.averageDifficulty}</p>
              <p className="text-sm text-muted-foreground mt-1">常见主题: {report.reading.topTopics.join(', ')}</p>
            </div>
          </Card>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <div className="analysis-card-header">
                <ThumbsUp className="h-5 w-5 text-green-500" />
                <h3 className="font-bold">学习优势</h3>
              </div>
              <ul className="space-y-2">
                {report.strengths.map((s, i) => (
                  <li key={i} className="analysis-item text-sm animate-slide-in" style={{ '--item-color': '#22c55e', animationDelay: `${i * 80}ms` } as React.CSSProperties}>
                    {s}
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <div className="analysis-card-header">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <h3 className="font-bold">待改进</h3>
              </div>
              <ul className="space-y-2">
                {report.weaknesses.map((w, i) => (
                  <li key={i} className="analysis-item text-sm animate-slide-in" style={{ '--item-color': '#f59e0b', animationDelay: `${i * 80}ms` } as React.CSSProperties}>
                    {w}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Suggestions */}
          <Card>
            <div className="analysis-card-header">
              <Lightbulb className="h-5 w-5 text-primary-500" />
              <h3 className="font-bold">学习建议</h3>
            </div>
            <ul className="space-y-2">
              {report.suggestions.map((s, i) => (
                <li key={i} className="analysis-item text-sm animate-slide-in" style={{ '--item-color': '#6366f1', animationDelay: `${i * 80}ms` } as React.CSSProperties}>
                  {s}
                </li>
              ))}
            </ul>
          </Card>

          {/* Share button */}
          <div className="text-center">
            <Button onClick={() => setShowShare(true)}>
              <Share2 className="h-4 w-4 mr-1.5" /> 分享学习成就
            </Button>
          </div>
        </div>
      )}
    </div>

    {/* Share dialog — outside all animated containers */}
    {showShare && report && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-backdrop" onClick={() => setShowShare(false)}>
        <div className="bg-card p-6 rounded-xl shadow-2xl max-w-md w-full mx-4 modal-content" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">分享学习成就</h3>
            <button onClick={() => setShowShare(false)} className="p-1 rounded-full hover:bg-muted transition">
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-muted-foreground text-sm mb-4">选择分享方式：</p>
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: '微信', color: 'bg-green-500', icon: '💬' },
              { label: 'X', color: 'bg-black', icon: '𝕏' },
              { label: '微博', color: 'bg-red-500', icon: '📢' },
              { label: '复制', color: 'bg-gray-600', icon: '🔗', action: copyShareLink },
            ].map(item => (
              <button
                key={item.label}
                onClick={item.action || (() => toast('分享功能开发中', 'info'))}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition"
              >
                <span className={cn('w-12 h-12 rounded-full flex items-center justify-center text-xl text-white', item.color)}>
                  {item.icon}
                </span>
                <span className="text-xs">{item.label}</span>
              </button>
            ))}
          </div>
          <div className="bg-muted rounded-lg p-3 text-sm">
            <p className="font-medium mb-1">{report.title}</p>
            <p className="text-muted-foreground text-xs line-clamp-2">{report.summary}</p>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { AlignLeft, Copy, Check, X } from 'lucide-react';
import { AIConfigBanner } from '@/components/settings/AIConfigBanner';
import type { SentenceAnalysis } from '@/types';

const examples = [
  { label: '简单句', text: 'The cat sat on the mat.' },
  { label: '复合句', text: "I believe that he will come tomorrow if it doesn't rain." },
  { label: '复杂句', text: 'The book, which was written by a famous author, has won several awards and is now being adapted into a movie that will be released next year.' },
];

const componentColorMap: Record<string, string> = {
  主语: 'component-subject', 谓语: 'component-predicate', 宾语: 'component-object',
  定语: 'component-attribute', 状语: 'component-adverbial', 补语: 'component-complement',
  同位语: 'component-appositive',
};

// Color legend for component types
const legend = [
  { label: '主语', cls: 'bg-blue-100 dark:bg-blue-900/60' },
  { label: '谓语', cls: 'bg-red-100 dark:bg-red-900/60' },
  { label: '宾语', cls: 'bg-green-100 dark:bg-green-900/60' },
  { label: '定语', cls: 'bg-yellow-100 dark:bg-yellow-900/60' },
  { label: '状语', cls: 'bg-purple-100 dark:bg-purple-900/60' },
  { label: '补语', cls: 'bg-pink-100 dark:bg-pink-900/60' },
];

function getComponentClass(type: string) {
  for (const [key, cls] of Object.entries(componentColorMap)) {
    if (type.includes(key)) return cls;
  }
  return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
}

export function SentenceAnalysisPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SentenceAnalysis | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const analyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    setActiveTooltip(null);
    try {
      const data = await api.sentence.analyze(input) as SentenceAnalysis;
      setResult(data);
      toast('分析完成', 'success');
    } catch (err) {
      toast(`分析失败: ${(err as Error).message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyResult = async () => {
    if (!result) return;
    const text = JSON.stringify(result, null, 2);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast('已复制到剪贴板', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <h1 className="text-3xl font-bold mb-6 text-primary-700 dark:text-primary-400">句子分析</h1>
      <AIConfigBanner />

      <Card className="mb-8">
        <div className="relative">
          <Textarea
            rows={5}
            placeholder="输入英语句子进行语法分析..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && analyze()}
          />
          {input && (
            <button
              onClick={() => setInput('')}
              className="absolute top-2 right-2 p-1 rounded-full text-muted-foreground hover:bg-muted transition"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <Button onClick={analyze} loading={loading} disabled={!input.trim()}>
            分析句子
          </Button>
          <div className="h-4 w-px bg-border mx-1" />
          {examples.map((ex, i) => (
            <Button key={i} variant="ghost" size="sm" onClick={() => setInput(ex.text)}>
              {ex.label}
            </Button>
          ))}
        </div>
      </Card>

      {loading && <LoadingSpinner text="AI 正在分析句子结构..." />}

      {!result && !loading && (
        <EmptyState
          icon={<AlignLeft className="h-16 w-16" />}
          title="输入句子开始分析"
          description="支持简单句、复合句、复杂句等各种句型，AI 会标注句子成分并解析语法要点。"
        />
      )}

      {result && (
        <div className="space-y-6">
          {/* Structure */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">句子结构</h2>
              <Button variant="ghost" size="sm" onClick={copyResult}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? '已复制' : '复制'}
              </Button>
            </div>
            <p className="text-lg leading-relaxed font-serif bg-muted/50 rounded-lg p-4 border border-border/30">{input}</p>
            {result.structure && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3">
                  <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wide mb-1">句子类型</p>
                  <p className="font-medium">{result.structure.type}</p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">结构解释</p>
                  <p>{result.structure.explanation}</p>
                </div>
              </div>
            )}
          </Card>

          {/* Components with legend */}
          {result.components && result.components.length > 0 && (
            <Card>
              <h2 className="text-lg font-bold mb-2">句子成分</h2>
              {/* Legend */}
              <div className="flex flex-wrap gap-2 mb-4 pb-3 border-b border-border/50">
                {legend.map(l => (
                  <span key={l.label} className={cn('text-xs px-2 py-0.5 rounded', l.cls)}>{l.label}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {result.components.map((comp, i) => (
                  <span
                    key={i}
                    className={cn('component-tag', getComponentClass(comp.type))}
                    role="button"
                    tabIndex={0}
                    onClick={() => setActiveTooltip(activeTooltip === i ? null : i)}
                    onKeyDown={e => e.key === 'Enter' && setActiveTooltip(activeTooltip === i ? null : i)}
                  >
                    <span className="component-label">{comp.type}</span>
                    {comp.text}
                    {activeTooltip === i && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-card border border-border rounded-lg shadow-xl text-sm max-w-xs z-20 animate-fade-in-up">
                        <p className="font-semibold text-primary-600 dark:text-primary-400 mb-1">{comp.type}</p>
                        <p className="text-muted-foreground">{comp.explanation}</p>
                      </div>
                    )}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Clauses & Tense */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h2 className="text-lg font-bold mb-3">从句分析</h2>
              {result.clauses && result.clauses.length > 0 ? (
                <ul className="space-y-2">
                  {result.clauses.map((c, i) => (
                    <li key={i} className="p-3 bg-muted rounded-lg text-sm animate-slide-in" style={{ animationDelay: `${i * 80}ms` }}>
                      <p className="font-semibold">{c.type}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">功能: {c.function}</p>
                      <p className="italic mt-1.5 text-foreground/80">"{c.text}"</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm py-4 text-center">未检测到从句结构</p>
              )}
            </Card>

            <Card>
              <h2 className="text-lg font-bold mb-3">时态分析</h2>
              {result.tense && result.tense.length > 0 ? (
                <ul className="space-y-2">
                  {result.tense.map((t, i) => (
                    <li key={i} className="p-3 bg-muted rounded-lg text-sm animate-slide-in" style={{ animationDelay: `${i * 80}ms` }}>
                      <p className="font-semibold">{t.name}</p>
                      <p className="mt-1 text-muted-foreground">{t.explanation}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm py-4 text-center">无法确定时态</p>
              )}
            </Card>
          </div>

          {/* Phrases & Grammar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h2 className="text-lg font-bold mb-3">重要短语</h2>
              {result.phrases && result.phrases.length > 0 ? (
                <ul className="space-y-2">
                  {result.phrases.map((p, i) => (
                    <li key={i} className="p-3 bg-muted rounded-lg text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 px-1.5 py-0.5 rounded">{p.type}</span>
                      </div>
                      <p className="italic text-foreground/80">"{p.text}"</p>
                      <p className="mt-1 text-muted-foreground">{p.explanation}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm py-4 text-center">未检测到特殊短语</p>
              )}
            </Card>

            <Card>
              <h2 className="text-lg font-bold mb-3">语法要点</h2>
              {result.grammarPoints && result.grammarPoints.length > 0 ? (
                <ul className="space-y-2">
                  {result.grammarPoints.map((g, i) => (
                    <li key={i} className="p-3 bg-muted rounded-lg text-sm">
                      <p className="font-semibold">{g.point}</p>
                      <p className="mt-1 text-muted-foreground">{g.explanation}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm py-4 text-center">未检测到特殊语法点</p>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

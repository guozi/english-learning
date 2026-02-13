import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useTts } from '@/hooks/use-tts';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Volume2, RotateCcw, Layers } from 'lucide-react';
import { AIConfigBanner } from '@/components/settings/AIConfigBanner';
import type { Word } from '@/types';

export function FlashcardsPage() {
  const [words, setWords] = useLocalStorage<Word[]>('flashcards', []);
  const [inputText, setInputText] = useState('');
  const [level, setLevel] = useState('all');
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const { speak } = useTts();
  const { toast } = useToast();

  // Swipe handling
  const touchStart = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleExtract = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const result = await api.flashcards.extract(inputText, 10, level) as Word[];
      if (result.length === 0) {
        toast('未能提取到单词，请尝试更长的文本', 'warning');
        return;
      }
      setWords(result);
      setCurrentIndex(0);
      setFlipped(false);
      toast(`成功提取 ${result.length} 个单词`, 'success');
    } catch (err) {
      toast(`提取失败: ${(err as Error).message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const goTo = useCallback((dir: -1 | 1) => {
    setCurrentIndex(i => {
      const next = i + dir;
      if (next < 0 || next >= words.length) return i;
      return next;
    });
    setFlipped(false);
  }, [words.length]);

  // Keyboard shortcuts
  useEffect(() => {
    if (words.length === 0) return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      switch (e.key) {
        case 'ArrowLeft': goTo(-1); break;
        case 'ArrowRight': goTo(1); break;
        case ' ':
        case 'Enter': e.preventDefault(); setFlipped(f => !f); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goTo, words.length]);

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.changedTouches[0].screenX, y: e.changedTouches[0].screenY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].screenX - touchStart.current.x;
    const dy = Math.abs(e.changedTouches[0].screenY - touchStart.current.y);
    if (Math.abs(dx) > 50 && dy < 75) {
      goTo(dx < 0 ? 1 : -1);
    }
  };

  const word = words[currentIndex];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <h1 className="text-3xl font-bold mb-6 text-primary-700 dark:text-primary-400">闪卡学习</h1>
      <AIConfigBanner />

      {/* Input area */}
      <Card className="mb-8">
        <Textarea
          rows={5}
          placeholder="在此粘贴英文文本，AI 将自动提取值得学习的单词..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
        />
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <Select value={level} onChange={e => setLevel(e.target.value)}>
            <option value="all">全部级别</option>
            <option value="cet4">CET-4 以上</option>
            <option value="cet6">CET-6 以上</option>
            <option value="advanced">高级词汇</option>
          </Select>
          <Button onClick={handleExtract} loading={loading} disabled={!inputText.trim()}>
            提取单词
          </Button>
          {inputText && (
            <Button variant="ghost" size="sm" onClick={() => setInputText('')}>
              <RotateCcw className="h-3.5 w-3.5" /> 清空
            </Button>
          )}
        </div>
      </Card>

      {loading && <LoadingSpinner text="AI 正在分析文本并提取单词..." />}

      {/* Empty state */}
      {words.length === 0 && !loading && (
        <EmptyState
          icon={<Layers className="h-16 w-16" />}
          title="还没有闪卡"
          description="在上方输入英文文本，AI 会自动提取值得学习的单词并生成闪卡。"
        />
      )}

      {/* Flashcard viewer */}
      {words.length > 0 && !loading && word && (
        <>
          {/* 3D Flashcard */}
          <div
            ref={cardRef}
            className="flashcard-container swipe-container mx-auto mb-6 cursor-pointer"
            style={{ maxWidth: 480 }}
            onClick={() => setFlipped(f => !f)}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            role="button"
            tabIndex={0}
            aria-label={flipped ? '点击翻转到正面' : '点击翻转查看详情'}
          >
            <div className={cn('flashcard-inner', flipped && 'flipped')} style={{ minHeight: 380 }}>
              {/* Front */}
              <div className="flashcard-front bg-card border border-border/50 shadow-lg p-8 flex flex-col items-center justify-center">
                <p className="text-3xl md:text-4xl font-bold text-primary-700 dark:text-primary-400 mb-3 text-center">
                  {word.word}
                </p>
                <p className="text-lg text-muted-foreground mb-6">{word.phonetic}</p>
                <button
                  className="p-2 rounded-full hover:bg-muted transition-colors mb-4"
                  onClick={e => { e.stopPropagation(); speak(word.word); }}
                  aria-label="朗读单词"
                >
                  <Volume2 className="h-5 w-5 text-primary-500" />
                </button>
                <p className="text-xs text-muted-foreground/60">点击翻转 · 方向键切换 · 空格翻转</p>
              </div>

              {/* Back */}
              <div className="flashcard-back bg-card border border-border/50 shadow-lg p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xl font-bold text-primary-700 dark:text-primary-400">{word.word}</p>
                    <p className="text-sm text-muted-foreground">{word.phonetic}</p>
                  </div>
                  <button
                    className="p-2 rounded-full hover:bg-muted transition-colors"
                    onClick={e => { e.stopPropagation(); speak(word.example || word.word); }}
                    aria-label="朗读例句"
                  >
                    <Volume2 className="h-4 w-4 text-primary-500" />
                  </button>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3">
                    <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wide mb-1">释义</p>
                    <p className="font-medium">{word.definition}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">词源</p>
                    <p className="text-muted-foreground">{word.etymology}</p>
                  </div>
                  <div className="border-t border-border pt-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">例句</p>
                    <p className="italic leading-relaxed">{word.example}</p>
                    <p className="text-muted-foreground mt-1">{word.exampleTranslation}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <Button variant="outline" size="sm" onClick={() => goTo(-1)} disabled={currentIndex === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {/* Progress dots */}
            <div className="flex items-center gap-1.5">
              {words.length <= 15 ? (
                words.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrentIndex(i); setFlipped(false); }}
                    className={cn(
                      'rounded-full transition-all duration-200',
                      i === currentIndex
                        ? 'w-6 h-2 bg-primary-500'
                        : 'w-2 h-2 bg-border hover:bg-primary-300',
                    )}
                    aria-label={`第 ${i + 1} 张卡片`}
                  />
                ))
              ) : (
                <span className="text-sm font-medium text-muted-foreground tabular-nums">
                  {currentIndex + 1} / {words.length}
                </span>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => goTo(1)} disabled={currentIndex === words.length - 1}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Word list */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">已提取 {words.length} 个单词</h3>
              <span className="text-xs text-muted-foreground">点击跳转</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {words.map((w, i) => (
                <Badge
                  key={w.word}
                  variant={i === currentIndex ? 'primary' : 'default'}
                  className={cn(
                    'cursor-pointer transition-all duration-200',
                    i === currentIndex && 'ring-2 ring-primary-500/30 scale-105',
                  )}
                  onClick={() => { setCurrentIndex(i); setFlipped(false); }}
                >
                  {w.word}
                </Badge>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

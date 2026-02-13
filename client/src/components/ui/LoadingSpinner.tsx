import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ text = '加载中...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      <p className="text-muted-foreground text-sm">{text}</p>
    </div>
  );
}

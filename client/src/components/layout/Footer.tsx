import { GraduationCap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-muted py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <span className="text-lg font-bold">英语学习助手</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">让英语学习更高效、更有趣</p>
          </div>
        </div>
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} 英语学习助手. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  );
}

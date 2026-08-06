import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/theme/theme';

const ThemeToggle = React.memo(() => {
  const { isDark, toggle } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="h-10 w-10 sm:h-11 sm:w-11 text-gray-600 dark:text-gray-400"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="h-4 w-4 sm:h-5 sm:w-5" /> : <Moon className="h-4 w-4 sm:h-5 sm:w-5" />}
    </Button>
  );
});

export default ThemeToggle;

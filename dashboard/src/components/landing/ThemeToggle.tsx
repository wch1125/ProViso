import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

/**
 * Theme toggle button for light/dark mode.
 * Persists preference to localStorage.
 */
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check initial theme
    const saved = localStorage.getItem('proviso-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (saved === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else if (saved === 'dark' || (!saved && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('proviso-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('proviso-theme', 'light');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="
        fixed top-6 right-6 z-50
        w-10 h-10
        bg-white/10 backdrop-blur-sm
        border border-white/20
        hover:border-gold-600 hover:bg-white/20
        rounded-full
        flex items-center justify-center
        text-white hover:text-gold-500
        transition-all duration-150
        focus:outline-none focus:ring-2 focus:ring-gold-600 focus:ring-offset-2 focus:ring-offset-surface-0
      "
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}

export default ThemeToggle;

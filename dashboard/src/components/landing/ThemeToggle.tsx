import { Moon, Sun } from 'lucide-react';
import { useThemeMode } from '../../context';

interface ThemeToggleProps {
  /** Extra classes for the host layout. */
  className?: string;
}

/**
 * Light/dark toggle.
 *
 * Mode state and persistence live in ThemeModeContext; this is only the
 * control. It is styled for the navy top bar, which stays dark in both
 * modes — hence the fixed light-on-navy treatment rather than surface tokens.
 */
export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { isDark, toggleMode } = useThemeMode();

  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      onClick={toggleMode}
      className={`
        w-9 h-9 shrink-0
        flex items-center justify-center
        rounded-full
        bg-white/10 hover:bg-white/20
        border border-white/20 hover:border-gold-500
        text-navy-50 hover:text-gold-400
        transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-navy-900
        ${className}
      `}
      title={label}
      aria-label={label}
    >
      {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
    </button>
  );
}

export default ThemeToggle;

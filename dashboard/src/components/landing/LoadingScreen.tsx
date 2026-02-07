import { useState, useEffect } from 'react';

interface LoadingScreenProps {
  /** Minimum display time in ms before fade out */
  minDisplayTime?: number;
  /** Callback when loading screen has finished */
  onComplete?: () => void;
}

/**
 * Premium loading screen with animated brand reveal.
 * Displays on first visit, then fades out.
 */
export function LoadingScreen({ minDisplayTime = 1600, onComplete }: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      // Wait for fade animation to complete
      setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 600);
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [minDisplayTime, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed inset-0 z-[9999]
        bg-navy-800
        flex flex-col items-center justify-center
        transition-opacity duration-[600ms] ease-out
        ${isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}
      `}
    >
      {/* Brand Text */}
      <div className="flex flex-col items-center">
        <div
          className="
            font-display text-[2.5rem] font-medium text-white
            opacity-0 animate-brand-reveal
          "
          style={{ animationDelay: '0.3s' }}
        >
          Pro<span className="text-blue-500 font-bold">V</span>iso
        </div>

        <div
          className="
            font-body text-[0.7rem] tracking-[0.3em] uppercase
            text-white/50 mt-2
            opacity-0 animate-brand-reveal
          "
          style={{ animationDelay: '0.5s' }}
        >
          Credit Agreements as Code
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-[140px] h-0.5 rounded-[1px] overflow-hidden bg-white/10 mt-6">
        <div
          className="h-full bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 animate-loading-progress"
        />
      </div>

      {/* Tagline */}
      <div
        className="
          font-display text-base italic text-white/40 mt-4
          opacity-0 animate-brand-reveal
        "
        style={{ animationDelay: '1.2s' }}
      >
        Read like documents. Run like programs.
      </div>
    </div>
  );
}

export default LoadingScreen;

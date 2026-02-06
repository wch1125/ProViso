/**
 * Command Suggestions Component
 *
 * Clickable command buttons for non-technical users.
 */

import { Terminal } from 'lucide-react';
import { getSuggestedCommands } from '../../utils/commandRunner';

interface CommandSuggestionsProps {
  onCommandClick: (command: string) => void;
  disabled?: boolean;
}

export function CommandSuggestions({ onCommandClick, disabled = false }: CommandSuggestionsProps) {
  const suggestions = getSuggestedCommands();

  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onCommandClick(suggestion.command)}
          disabled={disabled}
          className={`
            group flex items-center gap-2 px-3 py-1.5
            bg-surface-3 hover:bg-surface-4
            border border-border-DEFAULT hover:border-gold-600/50
            rounded-lg transition-all duration-200
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          title={suggestion.description}
        >
          <Terminal className="w-3.5 h-3.5 text-gold-400" />
          <code className="text-xs font-mono text-text-secondary group-hover:text-text-primary">
            {suggestion.command}
          </code>
        </button>
      ))}
    </div>
  );
}

export default CommandSuggestions;

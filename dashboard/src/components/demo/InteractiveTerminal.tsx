/**
 * Interactive Terminal Component
 *
 * Command input + output display for Act 2.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Terminal as TerminalIcon, Loader2, AlertTriangle } from 'lucide-react';
import { useDemoTerminal, useDemoInterpreter } from '../../context/DemoContext';
import { executeCommand } from '../../utils/commandRunner';
import { TerminalOutput } from './TerminalOutput';
import { CommandSuggestions } from './CommandSuggestions';

export function InteractiveTerminal() {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const {
    terminalHistory,
    addTerminalEntry,
    clearTerminal,
    addCommandToHistory,
    navigateCommandHistory,
    resetCommandHistoryIndex,
  } = useDemoTerminal();

  const { interpreter, isLoading, error } = useDemoInterpreter();

  // Auto-scroll to bottom
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const runCommand = useCallback((command: string) => {
    const trimmed = command.trim();
    if (!trimmed) return;

    // Add command to history
    addTerminalEntry({ type: 'command', content: trimmed });
    addCommandToHistory(trimmed);

    // Execute command
    const result = executeCommand(trimmed, interpreter);

    if (result.type === 'clear') {
      clearTerminal();
    } else {
      addTerminalEntry({ type: result.type === 'error' ? 'error' : result.type === 'info' ? 'info' : 'output', content: result.output });
    }

    setInput('');
    resetCommandHistoryIndex();
  }, [interpreter, addTerminalEntry, addCommandToHistory, clearTerminal, resetCommandHistoryIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runCommand(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevCommand = navigateCommandHistory('up');
      setInput(prevCommand);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextCommand = navigateCommandHistory('down');
      setInput(nextCommand);
    }
  };

  const handleSuggestionClick = (command: string) => {
    runCommand(command);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full bg-surface-1 rounded-xl border border-border-DEFAULT overflow-hidden">
      {/* Terminal Header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-surface-2 border-b border-border-DEFAULT">
        <TerminalIcon className="w-4 h-4 text-gold-400" />
        <span className="text-sm font-medium text-text-secondary">ProViso Terminal</span>
        {isLoading && (
          <Loader2 className="w-4 h-4 text-gold-400 animate-spin ml-auto" />
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-start gap-2 px-4 py-3 bg-danger/10 border-b border-danger/20">
          <AlertTriangle className="w-4 h-4 text-danger mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="text-danger font-medium">Interpreter failed to load</p>
            <p className="text-danger/70 text-xs mt-1 font-mono">{error}</p>
          </div>
        </div>
      )}

      {/* Terminal Output */}
      <div
        ref={outputRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm"
        onClick={() => inputRef.current?.focus()}
      >
        <TerminalOutput entries={terminalHistory} />
      </div>

      {/* Command Input */}
      <div className="border-t border-border-DEFAULT">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3">
          <span className="text-gold-400 font-mono select-none">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
            disabled={isLoading}
            className="
              flex-1 bg-transparent border-none outline-none
              font-mono text-text-primary placeholder:text-text-muted
              disabled:opacity-50
            "
            autoComplete="off"
            spellCheck={false}
          />
        </form>

        {/* Suggestions */}
        <div className="px-4 pb-3">
          <p className="text-xs text-text-muted mb-2">Try these commands:</p>
          <CommandSuggestions
            onCommandClick={handleSuggestionClick}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

export default InteractiveTerminal;

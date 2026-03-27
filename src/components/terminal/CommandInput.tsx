'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CommandInputProps {
  onCommand: (command: string) => void;
  disabled?: boolean;
}

/**
 * CommandInput - Terminal-style input field with command history
 *
 * Features:
 * - Green prompt "> " indicator
 * - Command history navigation (up/down arrows)
 * - Tab autocomplete for commands
 * - Block cursor style
 * - Auto-focus on mount
 */
export const CommandInput: React.FC<CommandInputProps> = ({
  onCommand,
  disabled = false
}) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Available commands for autocomplete
  const commands = ['/help', '/new', '/clear', '/export', '/import', '/theme'];

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onCommand(input.trim());
      setHistory(prev => [...prev, input.trim()]);
      setInput('');
      setHistoryIndex(-1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Command history navigation
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex < history.length - 1
          ? historyIndex + 1
          : historyIndex;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
    // Tab autocomplete
    else if (e.key === 'Tab') {
      e.preventDefault();
      const matches = commands.filter(cmd =>
        cmd.startsWith(input.toLowerCase())
      );
      if (matches.length === 1) {
        setInput(matches[0]);
      }
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="flex items-center gap-1 sm:gap-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Prompt indicator */}
      <span className="font-mono text-green-500 text-base sm:text-lg mr-1 sm:mr-2 whitespace-nowrap">
        {'> '}
      </span>

      {/* Terminal-styled input */}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          flex-1 bg-transparent border-none outline-none
          font-mono text-green-400 text-sm sm:text-base md:text-lg
          disabled:opacity-50 disabled:cursor-not-allowed
          caret-color-green-400
        `}
        style={{ caretColor: '#00ff00' }}
        autoComplete="off"
        spellCheck={false}
        placeholder="Type a command..."
      />

      {/* Submit hint */}
      <span className="font-mono text-green-600 text-[10px] sm:text-xs ml-1 sm:ml-2 whitespace-nowrap opacity-50 hidden xs:inline">
        [Enter]
      </span>
    </motion.form>
  );
};

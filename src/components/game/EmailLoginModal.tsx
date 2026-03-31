'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface EmailLoginModalProps {
  isOpen: boolean;
  correctPassword: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const EmailLoginModal: React.FC<EmailLoginModalProps> = ({
  isOpen,
  correctPassword,
  onSuccess,
  onClose,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPassword('');
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Simulate authentication delay
    setTimeout(() => {
      if (password === correctPassword) {
        onSuccess();
      } else {
        setError('Incorrect password. Access denied.');
        setIsSubmitting(false);
        setPassword('');
        inputRef.current?.focus();
      }
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-black border-2 border-green-500 rounded-lg p-6 sm:p-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">📧</div>
          <h2 className="text-xl sm:text-2xl font-mono text-green-400 font-bold mb-2">
            CEO EMAIL CLIENT
          </h2>
          <div className="text-xs font-mono text-green-600">
            PetroGlobal Secure Mail v2.1
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-xs sm:text-sm text-green-600 mb-2">
              ENTER PASSWORD:
            </label>
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-green-950/20 border-2 border-green-500/50 rounded px-3 py-2 font-mono text-green-400 text-sm sm:text-base focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/20"
              placeholder="••••••••••••"
              disabled={isSubmitting}
              autoComplete="off"
            />
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-xs sm:text-sm text-red-400 text-center bg-red-950/20 border border-red-500/50 rounded px-3 py-2"
            >
              {error}
            </motion.div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 font-mono text-xs sm:text-sm px-4 py-2 border border-green-500/50 text-green-600 hover:bg-green-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={!password || isSubmitting}
              className="flex-1 font-mono text-xs sm:text-sm px-4 py-2 bg-green-500/20 border border-green-500 text-green-400 hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded"
            >
              {isSubmitting ? 'AUTHENTICATING...' : 'LOGIN'}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-4 text-center">
          <div className="font-mono text-[10px] text-green-700">
            Press ESC to cancel
          </div>
        </div>

        {/* Loading Indicator */}
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center font-mono text-xs text-green-500"
          >
            Verifying credentials...
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

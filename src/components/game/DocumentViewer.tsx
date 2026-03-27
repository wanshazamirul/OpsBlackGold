'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface DocumentViewerProps {
  filename: string;
  content: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * DocumentViewer - Modal for reading file contents
 *
 * Features:
 * - ESC key to close
 * - Syntax highlighting for different file types
 * - File metadata display
 * - Terminal green styling
 * - Click outside to close
 */
export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  filename,
  content,
  isOpen,
  onClose,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Detect file type for syntax highlighting
  const getFileType = (name: string): string => {
    const ext = name.split('.').pop()?.toLowerCase();
    const typeMap: Record<string, string> = {
      'txt': 'text',
      'log': 'log',
      'conf': 'config',
      'json': 'json',
      'enc': 'encrypted',
      'sh': 'script',
      'db': 'database',
    };
    return typeMap[ext || ''] || 'text';
  };

  const fileType = getFileType(filename);

  // Format content based on file type
  const formatContent = (text: string, type: string) => {
    const lines = text.split('\n');

    return (
      <div className="space-y-0">
        {lines.map((line, idx) => (
          <div key={idx} className="font-mono text-sm leading-relaxed">
            {formatLine(line, type)}
          </div>
        ))}
      </div>
    );
  };

  // Format individual line based on content
  const formatLine = (line: string, type: string) => {
    if (!line) return <span>&nbsp;</span>;

    switch (type) {
      case 'config':
        return (
          <span>
            {line.startsWith('#') ? (
              <span className="text-green-600">{line}</span>
            ) : (
              <span>{highlightConfig(line)}</span>
            )}
          </span>
        );

      case 'log':
        return (
          <span>
            {line.toLowerCase().includes('error') || line.toLowerCase().includes('warning') ? (
              <span className="text-amber-400">{line}</span>
            ) : line.toLowerCase().includes('success') ? (
              <span className="text-green-300">{line}</span>
            ) : (
              <span className="text-green-200">{line}</span>
            )}
          </span>
        );

      case 'encrypted':
        return <span className="text-amber-300">{line}</span>;

      case 'script':
        return (
          <span>
            {line.startsWith('#') ? (
              <span className="text-green-600">{line}</span>
            ) : (
              <span className="text-green-100">{highlightScript(line)}</span>
            )}
          </span>
        );

      default:
        return <span className="text-green-50">{highlightKeywords(line)}</span>;
    }
  };

  // Highlight config keywords
  const highlightConfig = (line: string) => {
    const parts = line.split(/(ACCEPT|REJECT|--|port|frequency|status|password|user|root|admin)/gi);
    return (
      <>
        {parts.map((part, i) =>
          /^(ACCEPT|REJECT|--|port|frequency|status|password|user|root|admin)$/gi.test(part) ? (
            <span key={i} className="text-cyan-300">{part}</span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Highlight script syntax
  const highlightScript = (line: string) => {
    const parts = line.split(/(\[|\]|\(|\)|if|then|else|fi|do|done|for|while|echo|exit|return)/g);
    return (
      <>
        {parts.map((part, i) =>
          /^(\[|\]|\(|\)|if|then|else|fi|do|done|for|while|echo|exit|return)$/.test(part) ? (
            <span key={i} className="text-amber-300">{part}</span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Highlight important keywords
  const highlightKeywords = (line: string) => {
    const lower = line.toLowerCase();
    const parts = line.split(
      /(classified|secret|top secret|confidential|password|error|warning|success|failed|approved|conspiracy|evidence|bribe|payment|operation|mission|nemesis)/gi
    );

    return (
      <>
        {parts.map((part, i) => {
          const lowerPart = part.toLowerCase();
          if (/^(classified|secret|top secret|confidential)$/i.test(part)) {
            return <span key={i} className="text-red-400 font-bold">{part}</span>;
          } else if (/^(password)$/i.test(part)) {
            return <span key={i} className="text-amber-400 font-bold">{part}</span>;
          } else if (/^(error|warning|failed)$/i.test(part)) {
            return <span key={i} className="text-red-400">{part}</span>;
          } else if (/^(success|approved)$/i.test(part)) {
            return <span key={i} className="text-green-400">{part}</span>;
          } else if (/^(conspiracy|evidence|bribe|payment)$/i.test(part)) {
            return <span key={i} className="text-yellow-300 font-semibold">{part}</span>;
          } else if (/^(operation|mission)$/i.test(part)) {
            return <span key={i} className="text-cyan-300 font-semibold">{part}</span>;
          } else if (/^(nemesis)$/i.test(part)) {
            return <span key={i} className="text-purple-400 font-bold">{part}</span>;
          }
          return part;
        })}
      </>
    );
  };

  // Calculate file size
  const getFileSize = (content: string): string => {
    const bytes = new Blob([content]).size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={(e) => {
            if (e.target === overlayRef.current) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-4xl max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-green-950 border-2 border-green-500 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-green-400 text-2xl">📄</span>
                  <h2 className="font-mono text-green-400 text-lg font-bold truncate">
                    {filename}
                  </h2>
                </div>
                <div className="font-mono text-xs text-green-600">
                  {getFileSize(content)}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-green-400 hover:text-green-300 hover:bg-green-500/20 p-2 rounded transition-all"
                aria-label="Close document"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="bg-black/95 border-x-2 border-b-2 border-green-500 p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
                {formatContent(content, fileType)}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-green-950 border-2 border-t-0 border-green-500 px-4 py-2">
              <div className="font-mono text-xs text-green-600 text-center">
                Press <span className="text-green-400 font-bold">ESC</span> or click outside to close
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

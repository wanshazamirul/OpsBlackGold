'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal } from '@/components/terminal/Terminal';
import { CommandInput } from '@/components/terminal/CommandInput';
import { DocumentViewer } from '@/components/game/DocumentViewer';
import { Timer } from '@/components/game/Timer';
import { GameEngine } from '@/lib/game-engine';
import { GameState, Difficulty } from '@/types/game';
import { Award, RotateCcw } from 'lucide-react';

interface GameTerminalProps {
  difficulty: Difficulty;
  onRestart: () => void;
}

/**
 * GameTerminal - Main game interface with terminal and command processing
 *
 * Features:
 * - Real-time command processing
 * - Document viewer modal for reading files
 * - Timer with pause/resume
 * - File exfiltration tracking
 * - Password system
 * - Level progression with real objectives
 */
export const GameTerminal: React.FC<GameTerminalProps> = ({ difficulty, onRestart }) => {
  const [gameEngine, setGameEngine] = useState<GameEngine | null>(null);
  const [output, setOutput] = useState<string[]>([]);
  const [levelStatus, setLevelStatus] = useState<'playing' | 'complete' | 'gameover' | 'timeup'>('playing');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [isPaused, setIsPaused] = useState(false);
  const [documentViewer, setDocumentViewer] = useState<{
    isOpen: boolean;
    filename: string;
    content: string;
  }>({
    isOpen: false,
    filename: '',
    content: '',
  });

  const outputRef = useRef<HTMLDivElement>(null);

  // Initialize game
  useEffect(() => {
    const handleTimerUpdate = (time: number) => {
      setTimeRemaining(time);
    };

    const handleTimeUp = () => {
      setLevelStatus('timeup');
    };

    const engine = new GameEngine(difficulty, handleTimerUpdate, handleTimeUp);
    setGameEngine(engine);

    const level = engine.getCurrentLevel();
    setTimeRemaining(level.timeLimit);
    setTotalTime(level.timeLimit);

    setOutput([
      `LEVEL ${level.id}: ${level.title}`,
      '',
      `> ${level.objective}`,
      '',
      `TIME LIMIT: ${Math.floor(level.timeLimit / 60)}:${(level.timeLimit % 60).toString().padStart(2, '0')}`,
      '',
      'Type "help" for available commands.',
      'Type "download <filename>" to exfiltrate files.',
    ]);

    // Start timer
    engine.startTimer();

    return () => {
      engine.cleanup();
    };
  }, [difficulty]);

  // Pause timer when document viewer is open
  useEffect(() => {
    if (!gameEngine) return;

    if (documentViewer.isOpen) {
      gameEngine.pauseTimer();
      setIsPaused(true);
    } else {
      gameEngine.resumeTimer();
      setIsPaused(false);
    }
  }, [documentViewer.isOpen, gameEngine]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (outputRef.current && !documentViewer.isOpen) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, documentViewer.isOpen]);

  const handleOpenDocument = useCallback((filename: string, content: string) => {
    setDocumentViewer({
      isOpen: true,
      filename,
      content,
    });
  }, []);

  const handleCloseDocument = useCallback(() => {
    setDocumentViewer({
      isOpen: false,
      filename: '',
      content: '',
    });
  }, []);

  const handleCommand = (input: string) => {
    if (!gameEngine || levelStatus !== 'playing') return;

    // Check if user is trying to read a file
    const parts = input.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Handle cat command - open document viewer
    if (command === 'cat' && args.length > 0) {
      const filename = args[0];
      const fileData = gameEngine.getCurrentLevel().fileSystem[filename];

      if (fileData && typeof fileData === 'string') {
        // Open document viewer
        handleOpenDocument(filename, fileData);

        // Add command to output
        setOutput(prev => [...prev, `$ ${input}`, `Reading file: ${filename}...`]);
        return;
      }
    }

    // Add command to output
    const newOutput = [...output, `$ ${input}`];
    setOutput(newOutput);

    // Process command
    const result = gameEngine.processCommand(input);

    // Add result to output
    setOutput(prev => [...prev, result.message]);

    // Check if level complete
    if (result.nextLevel) {
      setLevelStatus('complete');

      setTimeout(() => {
        if (gameEngine) {
          gameEngine.advanceLevel();
          const newLevel = gameEngine.getCurrentLevel();
          setLevelStatus('playing');
          setTimeRemaining(newLevel.timeLimit);
          setTotalTime(newLevel.timeLimit);
          setIsPaused(false); // Clear paused state
          gameEngine.startTimer(); // Restart timer for new level
          setOutput([
            `LEVEL ${newLevel.id}: ${newLevel.title}`,
            '',
            `> ${newLevel.objective}`,
            '',
            `TIME LIMIT: ${Math.floor(newLevel.timeLimit / 60)}:${(newLevel.timeLimit % 60).toString().padStart(2, '0')}`,
            '',
            'Type "help" for available commands.',
          ]);
        }
      }, 3000);
    }

    // Check if game complete
    if (gameEngine.gameComplete()) {
      setLevelStatus('gameover');
    }
  };

  const handleGetHint = () => {
    if (!gameEngine) return;

    const hint = gameEngine.getHint();
    setOutput(prev => [...prev, '', `> ${hint}`, '']);
  };

  const handleRestart = () => {
    if (gameEngine) {
      gameEngine.cleanup();
    }
    setOutput([]);
    setLevelStatus('playing');
    setTimeRemaining(0);
    setTotalTime(0);
    onRestart();
  };

  // Victory screen
  if (levelStatus === 'gameover') {
    return (
      <Terminal>
        <div className="flex flex-col h-screen items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="text-6xl mb-8">🎉</div>
            <h2 className="text-3xl font-mono text-green-400 text-glow-strong mb-4">
              VICTORY!
            </h2>
            <p className="font-mono text-green-300 mb-8">
              You have exposed the conspiracy and revealed the truth to the world.
            </p>
            {gameEngine && (
              <div className="font-mono text-green-400 text-sm mb-8">
                <div>Files Exfiltrated: {gameEngine.getExfiltratedFiles().length}</div>
                <div className="mt-2">
                  {gameEngine.getExfiltratedFiles().map((file, i) => (
                    <div key={i} className="text-green-300">  ✓ {file}</div>
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={handleRestart}
              className="font-mono text-green-400 px-8 py-4 border-2 border-green-500 hover:bg-green-500/20 transition-all"
            >
              [ PLAY AGAIN ]
            </button>
          </motion.div>
        </div>
      </Terminal>
    );
  }

  // Time's up screen
  if (levelStatus === 'timeup') {
    return (
      <Terminal>
        <div className="flex flex-col h-screen items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="text-6xl mb-8">⏰</div>
            <h2 className="text-3xl font-mono text-red-400 text-glow-strong mb-4">
              TIME'S UP!
            </h2>
            <p className="font-mono text-red-300 mb-8">
              You ran out of time. The security systems detected your presence.
            </p>
            <button
              onClick={handleRestart}
              className="font-mono text-green-400 px-8 py-4 border-2 border-green-500 hover:bg-green-500/20 transition-all"
            >
              [ TRY AGAIN ]
            </button>
          </motion.div>
        </div>
      </Terminal>
    );
  }

  return (
    <Terminal>
      <div className="flex flex-col h-screen">
        {/* Header - Sticky on mobile */}
        <div className="sticky top-0 z-10 bg-black flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 px-3 sm:px-4 py-2 sm:py-3 border-b border-green-500/30">
          <div className="flex items-center gap-2 sm:gap-4">
            <h1 className="font-mono text-green-400 text-base sm:text-lg font-bold">
              MISSION {gameEngine?.getCurrentLevel().id}/10
            </h1>
            {difficulty === 'easy' && (
              <span className="font-mono text-green-600 text-[10px] sm:text-xs px-2 py-1 border border-green-500/30 hidden sm:inline">
                EASY MODE
              </span>
            )}
            {difficulty === 'normal' && (
              <span className="font-mono text-amber-600 text-[10px] sm:text-xs px-2 py-1 border border-amber-500/30 hidden sm:inline">
                NORMAL MODE
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Timer */}
            {gameEngine && (
              <Timer
                timeRemaining={timeRemaining}
                totalTime={totalTime}
                isPaused={isPaused}
              />
            )}

            <button
              onClick={handleGetHint}
              className="font-mono text-green-600 text-[10px] sm:text-xs px-2 sm:px-3 py-1 border border-green-500/30 hover:bg-green-500/20 transition-all flex items-center gap-1 sm:gap-2"
            >
              <Award size={12} className="sm:w-[14px]" />
              <span className="hidden sm:inline">HINT</span>
            </button>
            <button
              onClick={handleRestart}
              className="font-mono text-green-600 text-[10px] sm:text-xs px-2 sm:px-3 py-1 border border-green-500/30 hover:bg-green-500/20 transition-all flex items-center gap-1 sm:gap-2"
            >
              <RotateCcw size={12} className="sm:w-[14px]" />
              <span className="hidden sm:inline">RESTART</span>
            </button>
          </div>
        </div>

        {/* Terminal Output */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 font-mono text-green-400 text-xs sm:text-sm md:text-base">
          {output.map((line, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.1 }}
              className="whitespace-pre-wrap break-words"
            >
              {line}
            </motion.div>
          ))}
          <div ref={outputRef} />
        </div>

        {/* Level Complete Overlay */}
        <AnimatePresence>
          {levelStatus === 'complete' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 flex items-center justify-center z-20"
            >
              <div className="text-center">
                <h2 className="font-mono text-3xl text-green-400 text-glow-strong mb-4">
                  ✓ LEVEL COMPLETE
                </h2>
                <p className="font-mono text-green-300">
                  Loading next mission...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input - Will move above keyboard on mobile */}
        <div className="border-t border-green-500/30 p-4 sticky bottom-0 bg-black">
          <CommandInput
            onCommand={handleCommand}
            disabled={levelStatus !== 'playing'}
          />
        </div>
      </div>

      {/* Document Viewer Modal */}
      <DocumentViewer
        filename={documentViewer.filename}
        content={documentViewer.content}
        isOpen={documentViewer.isOpen}
        onClose={handleCloseDocument}
      />
    </Terminal>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal } from '@/components/terminal/Terminal';
import { CommandInput } from '@/components/terminal/CommandInput';
import { Difficulty, GameState } from '@/types/game';

interface SplashScreenProps {
  onStart: (difficulty: Difficulty) => void;
}

/**
 * SplashScreen - Game introduction and difficulty selection
 *
 * Features:
 * - Animated storyline text
 * - Background context on the oil crisis
 * - Difficulty selector (Easy/Normal)
 * - Typewriter effect for immersion
 * - Keyboard Enter key support
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
  const [showStory, setShowStory] = useState(false);
  const [showDifficulty, setShowDifficulty] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);

  // Handle Enter key press
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !showStory) {
        handleStart();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showStory]);

  const storyline = [
    '> INITIALIZING OPERATION BLACK GOLD...',
    '> ',
    '> THE YEAR IS 2026.',
    '> ',
    '> THE WORLD IS IN CHAOS.',
    '> ',
    '> THE UNITED STATES AND IRAN ARE AT WAR.',
    '> THE STRAIT OF HORMUZ IS BLOCKADED.',
    '> OIL PRICES HAVE SPIKED TO $450 PER BARREL.',
    '> ',
    '> ASIA IMPLEMENTS FUEL RATIONING.',
    '> EUROPE FACES CIVIL UNREST.',
    '> THE GLOBAL ECONOMY IS COLLAPSING.',
    '> ',
    '> BUT WHAT IF THIS WAS ALL PLANNED?',
    '> ',
    '> WHAT IF THE WAR WAS A LIE?',
    '> ',
    '> WHAT IF GOVERNMENTS AND OIL COMPANIES',
    '> CONSPIRED TO MANIPULATE PRICES?',
    '> ',
    '> YOU ARE A FREELANCE HACKER.',
    '> YOUR CLIENT: "NEMESIS"',
    '> YOUR MISSION: EXPOSE THE CONSPIRACY.',
    '> ',
    '> 10 LEVELS OF HACKING AWAIT.',
    '> THE TRUTH MUST BE TOLD.',
    '> ',
    '> PRESS ENTER TO BEGIN...',
  ];

  const [currentLine, setCurrentLine] = useState(0);
  const [displayedText, setDisplayedText] = useState<string[]>([]);

  const handleStart = () => {
    if (!showStory) {
      setShowStory(true);
      // Start typewriter effect
      let lineIndex = 0;
      const interval = setInterval(() => {
        if (lineIndex < storyline.length) {
          setDisplayedText(prev => [...prev, storyline[lineIndex]]);
          lineIndex++;
        } else {
          clearInterval(interval);
          setShowDifficulty(true);
        }
      }, 100); // Adjust speed here
    }
  };

  const handleDifficultySelect = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
    onStart(difficulty);
  };

  return (
    <Terminal>
      <div className="flex flex-col h-screen items-center justify-center p-4 sm:p-8 w-full max-w-6xl mx-auto">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8 w-full flex justify-center"
        >
          <div className="border-2 border-green-400 px-6 sm:px-8 py-3 sm:py-4 bg-green-950/20">
            <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-mono text-green-400 text-glow-strong text-center leading-tight">
              <div className="border-b-2 border-green-400 pb-2 mb-2">
                OPERATION BLACK GOLD v1.0
              </div>
              <div className="text-sm sm:text-base md:text-lg lg:text-xl">
                A HACKING SIMULATOR GAME
              </div>
            </div>
          </div>
        </motion.div>

        {/* Story or Start Button */}
        {!showStory ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <button
              onClick={handleStart}
              className="font-mono text-green-400 text-base sm:text-lg px-4 sm:px-8 py-3 sm:py-4 border-2 border-green-500 hover:bg-green-500/20 transition-all cursor-blink"
            >
              [ PRESS ENTER TO START ]
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-4xl px-2"
          >
            {/* Story text with typewriter effect */}
            <div className="font-mono text-green-400 text-sm sm:text-base md:text-lg whitespace-pre-wrap mb-6 sm:mb-8 overflow-y-auto max-h-[50vh] sm:max-h-[60vh]">
              {displayedText.map((line, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.1 }}
                >
                  {line}
                </motion.div>
              ))}
            </div>

            {/* Difficulty Selection */}
            {showDifficulty && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3 sm:space-y-4"
              >
                <div className="font-mono text-yellow-400 text-center text-base sm:text-lg mb-4 sm:mb-6">
                  &gt; SELECT DIFFICULTY:
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                  <button
                    onClick={() => handleDifficultySelect('easy')}
                    className={`font-mono px-6 sm:px-8 py-3 sm:py-4 border-2 transition-all w-full sm:w-auto ${
                      selectedDifficulty === 'easy'
                        ? 'bg-green-500/30 border-green-400 text-glow-strong'
                        : 'border-green-500/50 hover:bg-green-500/20 text-green-400'
                    }`}
                  >
                    [ EASY ]
                  </button>

                  <button
                    onClick={() => handleDifficultySelect('normal')}
                    className={`font-mono px-6 sm:px-8 py-3 sm:py-4 border-2 transition-all w-full sm:w-auto ${
                      selectedDifficulty === 'normal'
                        ? 'bg-amber-500/30 border-amber-400 text-glow-strong'
                        : 'border-amber-500/50 hover:bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    [ NORMAL ]
                  </button>
                </div>

                {/* Difficulty descriptions */}
                <div className="mt-4 sm:mt-6 space-y-2 text-xs sm:text-sm">
                  <div className="font-mono text-green-300 text-center px-2">
                    &gt; EASY: Hints available, commands explained, perfect for beginners
                  </div>
                  <div className="font-mono text-amber-300 text-center px-2">
                    &gt; NORMAL: Minimal hints, requires IT knowledge, authentic challenge
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 sm:mt-8 font-mono text-[10px] sm:text-xs text-green-600 text-center px-2"
        >
          Developed by Shuhada & Wan | Inspired by true events
        </motion.div>
      </div>
    </Terminal>
  );
};

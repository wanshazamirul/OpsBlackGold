'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Difficulty } from '@/types/game';

interface HackerIntroProps {
  onComplete: (difficulty: Difficulty) => void;
}

export const HackerIntro: React.FC<HackerIntroProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'boot' | 'connection' | 'auth' | 'decrypt' | 'briefing' | 'difficulty' | 'error'>('boot');
  const [error, setError] = useState('');
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [decryptedText, setDecryptedText] = useState<string[]>([]);
  const [decryptProgress, setDecryptProgress] = useState('');
  const [briefingText, setBriefingText] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [glitchActive, setGlitchActive] = useState(false);

  // Global error handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Intro error:', event.error);
      setPhase('error');
      setError(event.error?.message || 'Unknown error occurred');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Phase 1: Boot Sequence
  useEffect(() => {
    if (phase !== 'boot') return;

    const bootSequence = [
      'BIOS Version 4.72 - (C) 2026 Nemesis Systems',
      'Memory Test: 65536K OK',
      'Detecting primary master... Quantum SSD',
      'Loading kernel...',
      '[ OK ] Mounted root filesystem read-only',
      '[ OK ] Started Show Clean Boot Status',
      '[ OK ] Reached target Paths',
      'Initializing secure terminal interface...',
      '',
      'ESTABLISHING ENCRYPTED CONNECTION...',
      '',
    ];

    let lineIndex = 0;
    let mounted = true;

    const bootInterval = setInterval(() => {
      if (!mounted) {
        clearInterval(bootInterval);
        return;
      }

      if (lineIndex < bootSequence.length) {
        setBootLines(prev => [...prev, bootSequence[lineIndex]]);
        lineIndex++;
      } else {
        clearInterval(bootInterval);
        if (mounted) {
          setTimeout(() => {
            if (mounted) setPhase('connection');
          }, 500);
        }
      }
    }, 150);

    return () => {
      mounted = false;
      clearInterval(bootInterval);
    };
  }, [phase]);

  // Phase 2: Connection Sequence
  useEffect(() => {
    if (phase !== 'connection') return;

    const connectionSteps = [
      'Routing through proxy: 192.168.1.1 → 10.0.0.5 → ...',
      'Handshake initiated',
      'Exchanging keys...',
      'Verifying encryption: AES-256-GCM',
      'Connection established',
      'Tracing route to Nemesis secure server...',
      'Hop 7: Tokyo, JP',
      'Hop 12: Reykjavik, IS',
      'Hop 18: Unknown location',
      '',
      '✓ SECURE CONNECTION ESTABLISHED',
      '',
      'NEMESIS SYSTEM v3.7.1',
      'Authentication required',
    ];

    let stepIndex = 0;
    let mounted = true;

    const connectionInterval = setInterval(() => {
      if (!mounted) {
        clearInterval(connectionInterval);
        return;
      }

      if (stepIndex < connectionSteps.length) {
        setConnectionStatus(connectionSteps[stepIndex]);
        stepIndex++;
      } else {
        clearInterval(connectionInterval);
        if (mounted) {
          setTimeout(() => {
            if (mounted) setPhase('auth');
          }, 1000);
        }
      }
    }, 200);

    return () => {
      mounted = false;
      clearInterval(connectionInterval);
    };
  }, [phase]);

  // Phase 3: Authentication
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (authPassword === 'nemesis') {
      setAuthError('');
      setPhase('decrypt');
    } else {
      setAuthError('ACCESS DENIED - Invalid credentials');
      setAuthPassword('');
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }
  };

  // Phase 4: Decryption
  useEffect(() => {
    if (phase !== 'decrypt') return;

    const progressSteps = [
      { progress: 0, label: 'Û²³²²²±±±°°°²²²²Û  [ENCRYPTED TRANSMISSION]' },
      { progress: 0, label: 'Û²³²²±±±°°°²²²²Û  Decrypting with key: NEMESIS-2026-OMEGA' },
      { progress: 30, label: 'Û²³±±±°°°²²²²²Û  Progress: [███░░░░░░░░░░░] 30%' },
      { progress: 60, label: 'Û²±±±°°°²²²²²²Û  Progress: [██████░░░░░░░░] 60%' },
      { progress: 90, label: 'Û²±±±°°°²²²²²²²Û  Progress: [█████████░░░░░] 90%' },
      { progress: 100, label: 'Û²±±±°°°²²²²²²²Û  Progress: [████████████████] 100%' },
      { progress: 100, label: '' },
      { progress: 100, label: '✓ DECRYPTION COMPLETE' },
      { progress: 100, label: '' },
      { progress: 100, label: 'MESSAGE FROM NEMESIS:' },
    ];

    let stepIndex = 0;
    let mounted = true;

    const decryptInterval = setInterval(() => {
      if (!mounted) {
        clearInterval(decryptInterval);
        return;
      }

      if (stepIndex < progressSteps.length) {
        setDecryptProgress(progressSteps[stepIndex].label);
        stepIndex++;
      } else {
        clearInterval(decryptInterval);
        if (mounted) {
          setTimeout(() => {
            if (mounted) setPhase('briefing');
          }, 800);
        }
      }
    }, 180);

    return () => {
      mounted = false;
      clearInterval(decryptInterval);
    };
  }, [phase]);

  // Phase 5: Briefing
  useEffect(() => {
    if (phase !== 'briefing') return;

    const briefing = [
      '',
      'Agent,',
      '',
      'The world believes the US-Iran war is real.',
      'They believe oil shortages are natural.',
      'They believe prices rose to $450/barrel because of conflict.',
      '',
      'THEY ARE WRONG.',
      '',
      'My intelligence sources confirm:',
      '• The war was engineered - a false flag operation',
      '• Oil companies and governments conspired together',
      '• Expected profit: $2.3 TRILLION',
      '• Code name: OPERATION BLACK GOLD',
      '',
      'Your mission: Hack 10 systems. Expose the conspiracy.',
      'The future of global energy depends on you.',
      '',
      'This channel will self-destruct after transmission.',
      '',
      '- Nemesis',
      '',
      '',
      'INITIALIZING MISSION PROTOCOLS...',
      'SELECT DIFFICULTY LEVEL:',
    ];

    let briefingIndex = 0;
    let mounted = true;

    const briefingInterval = setInterval(() => {
      if (!mounted) {
        clearInterval(briefingInterval);
        return;
      }

      if (briefingIndex < briefing.length) {
        setBriefingText(prev => [...prev, briefing[briefingIndex]]);
        briefingIndex++;
      } else {
        clearInterval(briefingInterval);
        if (mounted) {
          setTimeout(() => {
            if (mounted) setPhase('difficulty');
          }, 500);
        }
      }
    }, 100);

    return () => {
      mounted = false;
      clearInterval(briefingInterval);
    };
  }, [phase]);

  // Phase 6: Difficulty Selection
  const handleDifficultySelect = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
    setTimeout(() => onComplete(difficulty), 300);
  };

  return (
    <div className="h-screen bg-black text-green-400 font-mono p-4 sm:p-8 overflow-hidden">
      <div className="max-w-4xl mx-auto h-full flex flex-col justify-center">
        {/* Glitch Effect */}
        <AnimatePresence>
          {glitchActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-red-500/20 z-50 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Phase 1: Boot */}
        {phase === 'boot' && (
          <div className="text-xs sm:text-sm space-y-1">
            {bootLines.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.05 }}
                className={line?.includes('[ OK ]') ? 'text-green-300' : ''}
              >
                {line || ''}
              </motion.div>
            ))}
          </div>
        )}

        {/* Phase 2: Connection */}
        {phase === 'connection' && (
          <div className="text-xs sm:text-sm space-y-2">
            <div className="text-green-600 mb-4">
              {bootLines.join('\n')}
            </div>
            {connectionStatus && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-yellow-400"
              >
                {connectionStatus}
              </motion.div>
            )}
          </div>
        )}

        {/* Phase 3: Authentication */}
        {phase === 'auth' && (
          <div className="text-xs sm:text-sm space-y-4">
            <div className="text-green-600">
              {bootLines.join('\n')}
              {'\n'}
              {connectionStatus}
            </div>

            <div className="border border-green-500/50 p-4 bg-green-950/20">
              <div className="text-yellow-400 mb-4">NEMESIS SECURE GATEWAY</div>
              <div className="text-green-600 mb-2">Enter access code:</div>

              <form onSubmit={handleAuthSubmit}>
                <div className="flex gap-2 items-center">
                  <span className="text-green-600">password:</span>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="flex-1 bg-green-950/30 border border-green-500/50 px-2 py-1 text-green-400 focus:outline-none focus:border-green-400"
                    autoComplete="off"
                    autoFocus
                  />
                </div>

                {authError && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-red-400 mt-2 text-xs"
                  >
                    {authError}
                  </motion.div>
                )}

                <div className="mt-3 text-xs text-green-700">
                  Hint: The client's name is the password
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Phase 4: Decryption */}
        {phase === 'decrypt' && (
          <div className="text-xs sm:text-sm space-y-1">
            <div className="text-green-600 mb-4">
              {bootLines.join('\n')}
              {'\n'}
              {connectionStatus}
            </div>

            <motion.div
              key="decrypt-progress"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={decryptProgress?.includes('DECRYPTION COMPLETE') ? 'text-green-300' : ''}
            >
              {decryptProgress || ''}
            </motion.div>
          </div>
        )}

        {/* Phase 5: Briefing */}
        {phase === 'briefing' && (
          <div className="text-xs sm:text-sm space-y-1 overflow-y-auto max-h-[60vh]">
            <div className="text-green-600 mb-4">
              {bootLines.join('\n')}
              {'\n'}
              {connectionStatus}
            </div>

            <div className="text-green-600 mb-4">
              {decryptProgress}
            </div>

            {briefingText.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.05 }}
                className={
                  line?.includes('Agent,') ? 'text-yellow-400 mt-4' :
                  line?.includes('- Nemesis') ? 'text-yellow-400' :
                  line?.includes('$2.3 TRILLION') ? 'text-red-400 font-bold' :
                  line?.includes('OPERATION BLACK GOLD') ? 'text-red-400 font-bold' :
                  ''
                }
              >
                {line || ''}
              </motion.div>
            ))}
          </div>
        )}

        {/* Phase 6: Difficulty Selection */}
        {phase === 'difficulty' && (
          <div className="text-xs sm:text-sm space-y-4">
            <div className="text-green-600 mb-4">
              {bootLines.join('\n')}
              {'\n'}
              {connectionStatus}
            </div>

            <div className="text-green-600 mb-4">
              {decryptProgress}
            </div>

            <div className="mb-6">
              {briefingText.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="text-yellow-400 text-center">&gt; SELECT DIFFICULTY:</div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => handleDifficultySelect('easy')}
                  className={`px-8 py-3 border-2 transition-all ${
                    selectedDifficulty === 'easy'
                      ? 'bg-green-500/30 border-green-400 text-glow-strong'
                      : 'border-green-500/50 hover:bg-green-500/20 text-green-400'
                  }`}
                >
                  [ EASY ]
                </button>

                <button
                  onClick={() => handleDifficultySelect('normal')}
                  className={`px-8 py-3 border-2 transition-all ${
                    selectedDifficulty === 'normal'
                      ? 'bg-amber-500/30 border-amber-400 text-glow-strong'
                      : 'border-amber-500/50 hover:bg-amber-500/20 text-amber-400'
                  }`}
                >
                  [ NORMAL ]
                </button>
              </div>

              <div className="mt-4 space-y-1 text-xs text-green-600">
                <div className="text-center">&gt; EASY: Hints available, commands explained</div>
                <div className="text-center">&gt; NORMAL: Minimal hints, authentic challenge</div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {phase === 'error' && (
          <div className="text-xs sm:text-sm space-y-4">
            <div className="text-red-400 text-center mb-4">
              ⚠️ CRITICAL ERROR
            </div>
            <div className="text-red-300 text-center mb-4">
              {error}
            </div>
            <div className="text-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 border border-red-500 text-red-400 hover:bg-red-500/20"
              >
                [ RELOAD ]
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-[10px] text-green-800 text-center">
          Developed by Shu & Wan | Inspired by true events
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { SplashScreen } from '@/components/game/SplashScreen';
import { GameTerminal } from '@/components/game/GameTerminal';
import { Difficulty } from '@/types/game';

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);

  const handleStart = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setGameStarted(true);
  };

  const handleRestart = () => {
    setGameStarted(false);
    setDifficulty(null);
  };

  if (!gameStarted || !difficulty) {
    return <SplashScreen onStart={handleStart} />;
  }

  return <GameTerminal difficulty={difficulty} onRestart={handleRestart} />;
}

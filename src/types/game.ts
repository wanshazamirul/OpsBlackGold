// Game Types

export type Difficulty = 'easy' | 'normal';

export type CompletionRequirementType =
  | 'download'
  | 'password_change'
  | 'file_creation'
  | 'command_execution'
  | 'upload'
  | 'decrypt';

export interface CompletionRequirement {
  type: CompletionRequirementType;
  target?: string | string[];
  count?: number;
}

export interface GameState {
  status: 'splash' | 'playing' | 'level-complete' | 'game-over' | 'victory' | 'time-up';
  difficulty: Difficulty | null;
  currentLevel: number;
  maxLevels: number;
  score: number;
  commands: string[];
  exfiltratedFiles: string[];
  timeRemaining: number;
  totalTime: number;
  passwordChanged: boolean;
  currentPassword: string;
  currentDirectory: string;
  hintsUsed: number; // Track hints used in current level
  completedSteps: string[]; // Track completed steps for progressive hints
}

export interface Level {
  id: number;
  title: string;
  objective: string;
  hint: string; // Deprecated - use hints array instead
  hints?: string[]; // Progressive hints - each gets more specific
  allowedCommands: string[];
  expectedCommands: string[];
  completionRequirements: CompletionRequirement[];
  timeLimit: number; // in seconds
  fileSystem: Record<string, string | string[]>;
  victoryMessage: string;
}

export interface CommandResult {
  success: boolean;
  message: string;
  nextLevel?: boolean;
  gameOver?: boolean;
  downloadedFile?: string;
  passwordChanged?: boolean;
  isDownloading?: boolean;
}

import { GameState, CommandResult, Level, Difficulty, CompletionRequirement } from '@/types/game';
import { GAME_LEVELS } from '@/data/levels';

export class GameEngine {
  private state: GameState;
  private currentLevel: Level;
  private commandHistory: string[] = [];
  private timerInterval: NodeJS.Timeout | null = null;
  private onTimerUpdate?: (timeRemaining: number) => void;
  private onTimeUp?: () => void;
  private downloadProgress: { filename: string; progress: number; speed: string; isComplete: boolean } | null = null;

  // Track actual completion of objectives
  private grepResults: string[] = [];
  private decryptedFiles: string[] = [];
  private createdFilesWithContent: Map<string, string> = new Map();
  private satctlOverrideExecuted = false;
  private sqliteCommandsExecuted: string[] = [];
  private uploadsCompleted: string[] = [];
  private emailLoginSuccessful = false;

  constructor(difficulty: Difficulty, onTimerUpdate?: (timeRemaining: number) => void, onTimeUp?: () => void) {
    this.state = {
      status: 'playing',
      difficulty,
      currentLevel: 1,
      maxLevels: GAME_LEVELS.length,
      score: 0,
      commands: [],
      exfiltratedFiles: [],
      timeRemaining: GAME_LEVELS[0].timeLimit,
      totalTime: GAME_LEVELS[0].timeLimit,
      passwordChanged: false,
      currentPassword: '', // Will be set per level
      currentDirectory: '', // Start at root
      hintsUsed: 0,
      completedSteps: [],
    };
    this.currentLevel = GAME_LEVELS[0];
    this.initializeFileSystem();
    this.onTimerUpdate = onTimerUpdate;
    this.onTimeUp = onTimeUp;
  }

  private initializeFileSystem(): void {
    // File system is managed by the levels themselves
    // Reset per-level state
    this.state.exfiltratedFiles = [];
    this.state.passwordChanged = false;
    this.state.currentDirectory = ''; // Reset to root
    this.state.hintsUsed = 0; // Reset hint counter
    this.state.completedSteps = []; // Reset completed steps

    // Reset objective tracking
    this.grepResults = [];
    this.decryptedFiles = [];
    this.createdFilesWithContent.clear();
    this.satctlOverrideExecuted = false;
    this.sqliteCommandsExecuted = [];
    this.uploadsCompleted = [];
    this.emailLoginSuccessful = false;

    // Set initial password for level 2
    if (this.currentLevel.id === 2) {
      this.state.currentPassword = 'BlackGold2026!';
    }
  }

  startTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = setInterval(() => {
      if (this.state.status !== 'playing') return;

      this.state.timeRemaining--;

      if (this.onTimerUpdate) {
        this.onTimerUpdate(this.state.timeRemaining);
      }

      if (this.state.timeRemaining <= 0) {
        this.stopTimer();
        this.state.status = 'time-up';
        if (this.onTimeUp) {
          this.onTimeUp();
        }
      }
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  pauseTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  resumeTimer(): void {
    this.startTimer();
  }

  getCurrentLevel(): Level {
    return this.currentLevel;
  }

  getGameState(): GameState {
    return this.state;
  }

  getTimeRemaining(): number {
    return this.state.timeRemaining;
  }

  getExfiltratedFiles(): string[] {
    return this.state.exfiltratedFiles;
  }

  getCurrentDirectory(): string {
    return this.state.currentDirectory;
  }

  private simulateFileSystem(): string {
    const fs = this.currentLevel.fileSystem;
    const currentDir = this.state.currentDirectory;
    let output: string[] = [];

    // Get all unique top-level directories and files
    const topLevelItems = new Set<string>();
    const currentDirItems: string[] = [];

    Object.entries(fs).forEach(([name, content]) => {
      // Check if this is a directory marker (ends with /)
      if (name.endsWith('/')) {
        const dirName = name.slice(0, -1); // Remove trailing slash
        topLevelItems.add(dirName);
      } else if (!name.includes('/')) {
        // Top-level file (no slashes)
        topLevelItems.add(name);
      } else if (currentDir) {
        // Check if this file is in the current directory
        const prefix = currentDir + '/';
        if (name.startsWith(prefix)) {
          // Get the filename relative to current directory
          const relativeName = name.slice(prefix.length);
          // Only show direct children, not nested items
          if (!relativeName.includes('/')) {
            currentDirItems.push(relativeName);
          }
        }
      }
    });

    // If we're in a subdirectory, show its contents
    if (currentDir) {
      if (currentDirItems.length === 0) {
        return `Directory: ${currentDir}\nEmpty directory`;
      }
      return `Directory: ${currentDir}\n${currentDirItems.join('\n')}`;
    }

    // Show top-level items
    if (topLevelItems.size === 0) {
      return 'Empty directory';
    }

    // Sort and format output
    const sortedItems = Array.from(topLevelItems).sort();
    sortedItems.forEach(item => {
      // Check if it's a directory
      const dirKey = item + '/';
      if (fs[dirKey] !== undefined) {
        output.push(`${item}/`);
      } else {
        output.push(item);
      }
    });

    return output.join('\n');
  }

  private simulateReadFile(filename: string): { content: string; found: boolean } {
    const fs = this.currentLevel.fileSystem;

    // Remove path separators for lookup
    let cleanName = filename.replace(/^\.\//, '').replace(/\/$/, '');

    // If we're in a subdirectory and filename doesn't contain a path, prepend current directory
    if (this.state.currentDirectory && !cleanName.includes('/')) {
      cleanName = this.state.currentDirectory + '/' + cleanName;
    }

    if (fs[cleanName]) {
      const content = fs[cleanName];
      if (typeof content === 'string') {
        return { content, found: true };
      } else if (Array.isArray(content)) {
        return { content: content.join('\n'), found: true };
      }
    }

    return { content: `Error: File '${filename}' not found`, found: false };
  }

  private simulateDownloadFile(filename: string): { success: boolean; message: string; isDownloading?: boolean } {
    const fs = this.currentLevel.fileSystem;

    // Build full path for storage
    let fullPath = filename.replace(/^\.\//, '').replace(/\/$/, '');

    // If we're in a subdirectory and filename doesn't contain a path, prepend current directory
    if (this.state.currentDirectory && !fullPath.includes('/')) {
      fullPath = this.state.currentDirectory + '/' + fullPath;
    }

    // Check if file exists
    if (!fs[fullPath]) {
      return {
        success: false,
        message: `Error: File '${filename}' not found. Cannot download.`,
      };
    }

    // Check if already downloaded
    if (this.state.exfiltratedFiles.includes(fullPath)) {
      return {
        success: true,
        message: `File '${filename}' already downloaded to your secure server.\n\nLocation: /home/agent/exfil/${filename}`,
      };
    }

    // Get file content and calculate size
    const content = fs[fullPath];
    const contentStr = typeof content === 'string' ? content : content.join('\n');
    const size = new Blob([contentStr]).size;

    // Start progressive download simulation
    this.startDownloadSimulation(filename, size);

    return {
      success: true,
      message: `Initializing download: ${filename}...\nSize: ${size} bytes\nConnecting to secure exfiltration server...`,
      isDownloading: true,
    };
  }

  private startDownloadSimulation(filename: string, totalSize: number): void {
    let progress = 0;
    const stages = [5, 15, 30, 50, 70, 85, 95, 100];
    let currentStage = 0;

    // Initialize downloadProgress immediately so polling can find it
    this.downloadProgress = {
      filename,
      progress: 0,
      speed: 'Initializing...',
      isComplete: false,
    };

    // Random connection speed (in KB/s) - varies by "network conditions"
    const getConnectionSpeed = (): string => {
      const speeds = [
        { min: 50, max: 150, label: 'KB/s' },   // Fast
        { min: 20, max: 80, label: 'KB/s' },    // Medium
        { min: 5, max: 30, label: 'KB/s' },     // Slow
        { min: 1, max: 10, label: 'KB/s' },     // Very slow
      ];
      const speed = speeds[Math.floor(Math.random() * speeds.length)];
      const value = Math.floor(Math.random() * (speed.max - speed.min + 1)) + speed.min;
      return `${value} ${speed.label}`;
    };

    const updateProgress = () => {
      if (currentStage >= stages.length) {
        // Download complete - add suspense delay before finalizing
        this.downloadProgress = {
          filename,
          progress: 100,
          speed: getConnectionSpeed(),
          isComplete: false,
        };

        // Suspense delay: 2-4 seconds before finalizing
        const suspenseDelay = Math.floor(Math.random() * 2000) + 2000;

        setTimeout(() => {
          // Store the full path for level completion checks
          let fullPath = filename;
          if (this.state.currentDirectory && !filename.includes('/')) {
            fullPath = this.state.currentDirectory + '/' + filename;
          }
          this.state.exfiltratedFiles.push(fullPath);

          this.downloadProgress = {
            filename,
            progress: 100,
            speed: getConnectionSpeed(),
            isComplete: true,
          };
        }, suspenseDelay);

        return;
      }

      const targetProgress = stages[currentStage];
      const speed = getConnectionSpeed();
      const progressBar = this.createProgressBar(targetProgress);

      this.downloadProgress = {
        filename,
        progress: targetProgress,
        speed,
        isComplete: false,
      };

      currentStage++;

      // Variable delay between progress updates (simulating network conditions)
      const baseDelay = 800; // Base delay in ms
      const randomDelay = Math.floor(Math.random() * 1200); // Random 0-1200ms
      const totalDelay = baseDelay + randomDelay;

      setTimeout(updateProgress, totalDelay);
    };

    // Start the download simulation
    updateProgress();
  }

  private createProgressBar(progress: number): string {
    const barLength = 25;
    const filledLength = Math.floor((progress / 100) * barLength);
    const emptyLength = barLength - filledLength;
    const filledBar = '█'.repeat(filledLength);
    const emptyBar = '░'.repeat(emptyLength);
    return `${filledBar}${emptyBar} ${progress}%`;
  }

  getDownloadProgress(): { filename: string; progress: number; speed: string; isComplete: boolean } | null {
    return this.downloadProgress;
  }

  isDownloadInProgress(): boolean {
    return this.downloadProgress !== null && !this.downloadProgress.isComplete;
  }

  clearDownloadProgress(): void {
    this.downloadProgress = null;
  }

  private simulateGrep(pattern: string, target?: string): string {
    const fs = this.currentLevel.fileSystem;
    const results: string[] = [];

    const searchIn = (content: string) => {
      const lines = content.split('\n');
      lines.forEach(line => {
        if (line.toLowerCase().includes(pattern.toLowerCase())) {
          results.push(line);
        }
      });
    };

    if (target) {
      // Search in specific file
      const content = fs[target.replace(/^\.\//, '')];
      if (typeof content === 'string') {
        searchIn(content);
      }
    } else {
      // Search in all files
      Object.values(fs).forEach(content => {
        if (typeof content === 'string') {
          searchIn(content);
        }
      });
    }

    // Track grep results for validation
    if (results.length > 0) {
      this.grepResults = results;
    }

    if (results.length === 0) {
      return `No matches found for pattern: ${pattern}`;
    }

    return results.join('\n');
  }

  private simulateEcho(content: string, filename?: string): string {
    if (filename) {
      // Build full path considering current directory
      let fullPath = filename.replace(/^\.\//, '').replace(/\/$/, '');

      // If we're in a subdirectory and filename doesn't contain a path, prepend current directory
      if (this.state.currentDirectory && !fullPath.includes('/')) {
        fullPath = this.state.currentDirectory + '/' + fullPath;
      }

      // Add file to filesystem
      this.currentLevel.fileSystem[fullPath] = content;

      // Track file creation with content for validation (Level 6)
      this.createdFilesWithContent.set(fullPath, content);

      return `File written: ${filename}\n${content}`;
    }
    return content;
  }

  private simulateCd(directory: string): string {
    const fs = this.currentLevel.fileSystem;

    // Handle special cases
    if (directory === '..') {
      // Go to parent directory (back to root)
      if (this.state.currentDirectory === '') {
        return ''; // Already at root, no message needed
      }
      this.state.currentDirectory = '';
      return ''; // Changed to root, no message needed (prompt will update)
    }

    // Clean the directory name
    let cleanDir = directory.replace(/^\.\//, '').replace(/\/$/, '');

    // Check if directory exists (with or without trailing slash)
    const dirWithSlash = cleanDir + '/';

    // Check if we're trying to cd into a subdirectory from current directory
    if (this.state.currentDirectory) {
      const fullPath = this.state.currentDirectory + '/' + cleanDir;
      const fullPathWithSlash = fullPath + '/';

      if (fs[fullPathWithSlash] !== undefined || (fs[fullPath] !== undefined && typeof fs[fullPath] === 'object')) {
        this.state.currentDirectory = fullPath;
        return ''; // Changed successfully, no message needed (prompt will update)
      }

      return `Error: Directory '${directory}' not found`;
    }

    // Check at root level
    if (fs[dirWithSlash] !== undefined || (fs[cleanDir] !== undefined && typeof fs[cleanDir] === 'object')) {
      this.state.currentDirectory = cleanDir;
      return ''; // Changed successfully, no message needed (prompt will update)
    }

    return `Error: Directory '${directory}' not found`;
  }

  private simulateLs(): string {
    return this.simulateFileSystem();
  }

  private simulateHelp(): string {
    const levelCmds = this.currentLevel.allowedCommands.join(', ');
    return `Available commands: ${levelCmds}\nUse 'man <command>' for help with specific commands.\nLevel hint: ${this.currentLevel.hint}\n\nType 'exfil list' to see downloaded files.`;
  }

  private simulatePwd(): string {
    const base = '/home/agent/mission_' + this.currentLevel.id;
    return this.state.currentDirectory ? `${base}/${this.state.currentDirectory}` : base;
  }

  private simulateClear(): string {
    return ''; // Clear handled by UI
  }

  private simulateCat(args: string[]): string {
    if (args.length === 0) {
      return 'Usage: cat <filename>';
    }

    if (args.length > 1) {
      return args.map(arg => this.simulateReadFile(arg).content).join('\n\n');
    }

    return this.simulateReadFile(args[0]).content;
  }

  private simulateGrepCommand(args: string[]): string {
    if (args.length < 1) {
      return 'Usage: grep <pattern> [filename]';
    }

    const pattern = args[0];
    const target = args[1];

    return this.simulateGrep(pattern, target);
  }

  private simulateFind(args: string[]): string {
    if (args.length === 0) {
      return 'Usage: find <name>';
    }

    const name = args[0];
    const fs = this.currentLevel.fileSystem;

    const results = Object.keys(fs).filter(key =>
      key.toLowerCase().includes(name.toLowerCase())
    );

    if (results.length === 0) {
      return `No files found matching: ${name}`;
    }

    return results.join('\n');
  }

  private simulateStrings(filename: string): string {
    const fs = this.currentLevel.fileSystem;
    const content = fs[filename.replace(/^\.\//, '')];

    if (typeof content !== 'string') {
      return `Error: ${filename} is not a readable file`;
    }

    // Extract printable strings (4+ characters)
    const strings = content.match(/[A-Za-z0-9]{4,}/g) || [];
    return strings.join('\n');
  }

  private simulateBase64(args: string[]): string {
    if (args.length === 0) {
      return 'Usage: base64 -d <filename> to decode';
    }

    const hasDecodeFlag = args.includes('-d') || args.includes('--decode');

    if (!hasDecodeFlag) {
      return 'Usage: base64 -d <filename> to decode\nUse -d flag to decode base64 content';
    }

    const filename = args[args.length - 1];
    const fs = this.currentLevel.fileSystem;
    const content = fs[filename.replace(/^\.\//, '')];

    if (typeof content !== 'string') {
      return `Error: ${filename} is not a readable file`;
    }

    try {
      const decoded = atob(content);

      // Track successful decryption for validation
      this.decryptedFiles.push(filename.replace(/^\.\//, ''));

      return decoded;
    } catch {
      return 'Error: Invalid base64 content';
    }
  }

  private simulateEchoCommand(args: string[]): string {
    const content = args.join(' ');

    // Check if writing to file
    if (content.includes('>')) {
      const parts = content.split('>');
      const message = parts[0].trim();
      const filename = parts[1].trim();
      return this.simulateEcho(message, filename);
    }

    return content;
  }

  private simulateMkdir(dirname: string): string {
    // Build full path considering current directory
    let fullPath = dirname.replace(/^\.\//, '').replace(/\/$/, '');

    // If we're in a subdirectory and dirname doesn't contain a path, prepend current directory
    if (this.state.currentDirectory && !fullPath.includes('/')) {
      fullPath = this.state.currentDirectory + '/' + fullPath;
    }

    // Add directory to filesystem (with trailing slash to indicate it's a directory)
    this.currentLevel.fileSystem[fullPath + '/'] = '';

    return `Directory created: ${dirname}`;
  }

  private simulateTouch(filename: string): string {
    // Build full path considering current directory
    let fullPath = filename.replace(/^\.\//, '').replace(/\/$/, '');

    // If we're in a subdirectory and filename doesn't contain a path, prepend current directory
    if (this.state.currentDirectory && !fullPath.includes('/')) {
      fullPath = this.state.currentDirectory + '/' + fullPath;
    }

    // Add empty file to filesystem
    this.currentLevel.fileSystem[fullPath] = '';

    return `File created: ${filename}`;
  }

  private simulateChmod(args: string[]): string {
    return `Permissions updated: ${args.join(' ')}`;
  }

  private simulateChown(args: string[]): string {
    return `Ownership changed: ${args.join(' ')}`;
  }

  private simulateSqlite(args: string[]): string {
    if (args.length === 0) {
      return 'Usage: sqlite <database>';
    }

    const dbname = args[0];

    // Track that sqlite command was executed
    if (!this.sqliteCommandsExecuted.includes(dbname)) {
      this.sqliteCommandsExecuted.push(dbname);
    }

    return `SQLite database: ${dbname}\n\nTables:\n- manifests\n- tankers\n- routes\n\nType .help for SQLite help\nType your SQL queries followed by ;\n\nHint: Try UPDATE manifests SET status="delayed";`;
  }

  private simulateSudo(command: string): string {
    return `[sudo] Executing: ${command}\nAccess granted. Privileged command executed.`;
  }

  private simulateHead(args: string[]): string {
    if (args.length === 0) {
      return 'Usage: head <filename> [lines]';
    }

    const filename = args[0];
    const lines = parseInt(args[1]) || 10;

    const content = this.simulateReadFile(filename).content;
    const contentLines = content.split('\n').slice(0, lines);

    return contentLines.join('\n');
  }

  private simulateTail(args: string[]): string {
    if (args.length === 0) {
      return 'Usage: tail <filename> [lines]';
    }

    const filename = args[0];
    const lines = parseInt(args[1]) || 10;

    const content = this.simulateReadFile(filename).content;
    const contentLines = content.split('\n').slice(-lines);

    return contentLines.join('\n');
  }

  private simulateUpload(args: string[]): string {
    if (args.length < 2) {
      return 'Usage: upload <source_file> <destination>\n\nDestinations: cnn, foxnews, reuters, bbc, aljazeera, wikileaks';
    }

    const source = args[0];
    const dest = args[1];

    // Track upload for validation
    const uploadKey = `${source}→${dest}`;
    if (!this.uploadsCompleted.includes(uploadKey)) {
      this.uploadsCompleted.push(uploadKey);
    }

    return `Uploading ${source} to ${dest}...\n\n███████████████████ 100%\n\nUpload complete!\n\nEvidence released to ${dest.toUpperCase()}!\n\nGlobal broadcast initiated...`;
  }

  private simulateExfilCommand(args: string[]): string {
    if (args.length === 0) {
      return 'Usage:\n  exfil list - List downloaded files\n  exfil status - Show exfiltration progress';
    }

    const command = args[0];

    if (command === 'list') {
      if (this.state.exfiltratedFiles.length === 0) {
        return 'No files downloaded yet.\nUse: download <filename>';
      }

      return 'Downloaded files:\n' + this.state.exfiltratedFiles.map(f => `  - ${f}`).join('\n');
    }

    if (command === 'status') {
      const total = this.state.exfiltratedFiles.length;
      return `Exfiltration Status:\n  Files downloaded: ${total}\n  Location: /home/agent/exfil/`;
    }

    return `Unknown exfil command: ${command}\nAvailable: list, status`;
  }

  private simulatePasswd(args: string[]): { success: boolean; message: string } {
    if (this.currentLevel.id !== 2) {
      return {
        success: false,
        message: 'Error: passwd command not available in this level',
      };
    }

    if (args.length === 0) {
      return {
        success: false,
        message: 'Usage: passwd <new_password>\nExample: passwd MyNewPassword123!',
      };
    }

    const newPassword = args[0];
    this.state.currentPassword = newPassword;
    this.state.passwordChanged = true;

    return {
      success: true,
      message: `Password changed successfully!\nNew password: ${newPassword}\n\nUse 'login ${newPassword}' to verify the password works.`,
    };
  }

  private simulateLogin(args: string[]): { success: boolean; message: string } {
    if (this.currentLevel.id !== 2) {
      return {
        success: false,
        message: 'Error: login command not available in this level',
      };
    }

    if (args.length === 0) {
      return {
        success: false,
        message: 'Usage: login <password>\nExample: login MyPassword123!',
      };
    }

    const password = args[0];

    if (password === this.state.currentPassword) {
      return {
        success: true,
        message: `Login successful!\n\nWelcome, CEO.\nEmail access granted.\nInbox contains: 47 messages\n  - 12 from Nemesis (marked urgent)\n  - 8 from Board of Directors\n  - 27 from oil cartel representatives\n\nYou now have full access to the CEO's email account.`,
      };
    }

    return {
      success: false,
      message: `Login failed: Incorrect password\n\nCurrent password: ${this.state.currentPassword}\n\nTry: login ${this.state.currentPassword}`,
    };
  }

  private simulateCustomCommand(command: string, args: string[]): CommandResult {
    // Level-specific commands
    if (this.currentLevel.id === 7 && command === 'satctl') {
      // Check if user is trying to override
      if (args.includes('--override')) {
        this.satctlOverrideExecuted = true;
        return {
          success: true,
          message: 'Override initiated...\n\nBroadcast frequency unlocked.\nOverride code: BLACKGOLD-2026\n\nSatellite control transferred to your command.\nReady to broadcast evidence file.',
        };
      }

      return {
        success: true,
        message: 'Satellite Control Utility\nCommands:\n- --list: List satellites\n- --override: Override broadcast frequency\n- --broadcast: Broadcast message file\n\nCurrent satellite: SAT-1 (Global Coverage)\nFrequency: 101.5 MHz\nStatus: ACTIVE',
      };
    }

    return {
      success: true,
      message: `Command '${command}' recognized. See level hints for usage.`,
    };
  }

  processCommand(input: string): CommandResult {
    this.commandHistory.push(input);
    this.state.commands = [...this.commandHistory];

    // Parse command
    const parts = input.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Check if command is allowed
    if (!this.currentLevel.allowedCommands.includes(command)) {
      return {
        success: false,
        message: `Error: Command '${command}' is not allowed or does not exist in this system.\nAvailable commands: ${this.currentLevel.allowedCommands.join(', ')}`,
      };
    }

    let output = '';

    // Special commands
    if (command === 'download') {
      if (args.length === 0) {
        return {
          success: false,
          message: 'Usage: download <filename>\nExample: download intel_report.txt',
        };
      }

      const downloadResult = this.simulateDownloadFile(args[0]);
      const levelComplete = this.checkLevelCompletion();

      return {
        success: downloadResult.success,
        message: downloadResult.message,
        downloadedFile: downloadResult.success ? args[0] : undefined,
        nextLevel: levelComplete,
        isDownloading: true,
      };
    }

    if (command === 'exfil') {
      return {
        success: true,
        message: this.simulateExfilCommand(args),
      };
    }

    if (command === 'passwd') {
      const result = this.simulatePasswd(args);
      return {
        success: result.success,
        message: result.message,
        passwordChanged: result.success,
      };
    }

    if (command === 'login') {
      const result = this.simulateLogin(args);
      const levelComplete = this.checkLevelCompletion();

      return {
        success: result.success,
        message: result.message,
        nextLevel: levelComplete,
      };
    }

    // Execute command
    try {
      switch (command) {
        case 'ls':
          output = this.simulateLs();
          break;
        case 'cat':
          output = this.simulateCat(args);
          break;
        case 'cd':
          if (args.length === 0) {
            output = 'Usage: cd <directory>';
          } else {
            output = this.simulateCd(args[0]);
          }
          break;
        case 'pwd':
          output = this.simulatePwd();
          break;
        case 'help':
        case '?':
          output = this.simulateHelp();
          break;
        case 'clear':
        case 'cls':
          output = this.simulateClear();
          break;
        case 'grep':
          output = this.simulateGrepCommand(args);
          break;
        case 'find':
          output = this.simulateFind(args);
          break;
        case 'strings':
          if (args.length === 0) {
            output = 'Usage: strings <filename>';
          } else {
            output = this.simulateStrings(args[0]);
          }
          break;
        case 'base64':
          output = this.simulateBase64(args);
          break;
        case 'echo':
          output = this.simulateEchoCommand(args);
          break;
        case 'mkdir':
          if (args.length === 0) {
            output = 'Usage: mkdir <directory>';
          } else {
            output = this.simulateMkdir(args[0]);
          }
          break;
        case 'touch':
          if (args.length === 0) {
            output = 'Usage: touch <filename>';
          } else {
            output = this.simulateTouch(args[0]);
          }
          break;
        case 'chmod':
          output = this.simulateChmod(args);
          break;
        case 'chown':
          output = this.simulateChown(args);
          break;
        case 'sqlite':
          output = this.simulateSqlite(args);
          break;
        case 'sudo':
          if (args.length === 0) {
            output = 'Usage: sudo <command>';
          } else {
            output = this.simulateSudo(args.join(' '));
          }
          break;
        case 'head':
          output = this.simulateHead(args);
          break;
        case 'tail':
          output = this.simulateTail(args);
          break;
        case 'upload':
          output = this.simulateUpload(args);
          break;
        default:
          const customResult = this.simulateCustomCommand(command, args);
          return customResult;
      }
    } catch (error) {
      return {
        success: false,
        message: `Error executing command: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }

    // Check if level is complete
    if (this.checkLevelCompletion()) {
      return {
        success: true,
        message: output + '\n\n' + this.currentLevel.victoryMessage,
        nextLevel: true,
      };
    }

    return {
      success: true,
      message: output,
    };
  }

  private checkLevelCompletion(): boolean {
    const requirements = this.currentLevel.completionRequirements;

    if (requirements.length === 0) {
      // Fallback to old behavior
      const recentCommands = this.commandHistory.slice(-5);
      return this.currentLevel.expectedCommands.some(cmd =>
        recentCommands.some(history => history.startsWith(cmd))
      );
    }

    // Check all requirements are met
    return requirements.every(req => this.checkRequirement(req));
  }

  private checkRequirement(requirement: CompletionRequirement): boolean {
    switch (requirement.type) {
      case 'download':
        if (Array.isArray(requirement.target)) {
          const downloadedCount = requirement.target.filter(file =>
            this.state.exfiltratedFiles.includes(file)
          ).length;
          return requirement.count
            ? downloadedCount >= requirement.count
            : downloadedCount === requirement.target.length;
        }
        return requirement.target
          ? this.state.exfiltratedFiles.includes(requirement.target)
          : false;

      case 'password_change':
        return this.state.passwordChanged;

      case 'file_creation':
        // Level 6: Check if file was created
        const targetFile = requirement.target as string;
        // Check if file exists in the filesystem (created via echo or touch)
        return this.currentLevel.fileSystem[targetFile] !== undefined ||
               this.commandHistory.some(cmd =>
                 cmd.startsWith('touch') && cmd.includes(targetFile)
               );

      case 'command_execution':
        const cmdTarget = requirement.target as string;

        // Level 2: Verify email login was successful
        if (cmdTarget === 'email_login') {
          return this.emailLoginSuccessful;
        }

        // Level 4: Verify grep actually found something useful
        if (cmdTarget === 'grep') {
          return this.grepResults.length > 0;
        }

        // Level 7: Verify satctl override was executed
        if (cmdTarget === 'satctl') {
          return this.satctlOverrideExecuted;
        }

        // Level 8: Verify SQLite command was executed
        if (cmdTarget === 'sqlite') {
          return this.sqliteCommandsExecuted.length > 0;
        }

        // General fallback: check command was executed
        return this.commandHistory.some(cmd => cmd.startsWith(cmdTarget));

      case 'upload':
        // Level 10: Verify uploads to required destinations
        if (Array.isArray(requirement.target)) {
          const uniqueDests = new Set(
            this.uploadsCompleted.map(u => u.split('→')[1])
          );
          const requiredCount = requirement.count || requirement.target.length;
          return uniqueDests.size >= requiredCount;
        }
        return this.uploadsCompleted.some(u => u.includes(requirement.target as string));

      case 'decrypt':
        // Level 5: Verify base64 decoded the SPECIFIC target file
        const decryptTarget = requirement.target as string;
        return this.decryptedFiles.includes(decryptTarget);

      default:
        return false;
    }
  }

  advanceLevel(): void {
    this.stopTimer();

    if (this.state.currentLevel < this.state.maxLevels) {
      this.state.currentLevel++;
      this.currentLevel = GAME_LEVELS[this.state.currentLevel - 1];
      this.state.timeRemaining = this.currentLevel.timeLimit;
      this.state.totalTime = this.currentLevel.timeLimit;
      this.commandHistory = [];
      this.initializeFileSystem();
    } else {
      this.state.status = 'victory';
    }
  }

  gameComplete(): boolean {
    return this.state.status === 'victory';
  }

  getHint(): string {
    // If level has progressive hints, use them
    if (this.currentLevel.hints && this.currentLevel.hints.length > 0) {
      const hintIndex = Math.min(this.state.hintsUsed, this.currentLevel.hints.length - 1);
      this.state.hintsUsed++;

      const hint = this.currentLevel.hints[hintIndex];
      const remaining = this.currentLevel.hints.length - this.state.hintsUsed;

      let output = `HINT (${this.state.hintsUsed}/${this.currentLevel.hints.length}):\n${hint}`;

      if (this.state.difficulty === 'easy') {
        output += `\n\nAvailable commands: ${this.currentLevel.allowedCommands.join(', ')}`;
      }

      if (remaining > 0) {
        output += `\n\nHints remaining: ${remaining}`;
      } else {
        output += `\n\nNo more hints available!`;
      }

      return output;
    }

    // Fall back to old single hint behavior
    if (this.state.difficulty === 'easy') {
      return `HINT: ${this.currentLevel.hint}\n\nTry these commands: ${this.currentLevel.allowedCommands.join(', ')}\n\nProgress: ${this.state.exfiltratedFiles.length} files downloaded`;
    }
    return `HINT: ${this.currentLevel.hint}`;
  }

  private markStepCompleted(step: string): void {
    if (!this.state.completedSteps.includes(step)) {
      this.state.completedSteps.push(step);
    }
  }

  cleanup(): void {
    this.stopTimer();
  }

  setEmailLoginSuccessful(): void {
    this.emailLoginSuccessful = true;
  }
}

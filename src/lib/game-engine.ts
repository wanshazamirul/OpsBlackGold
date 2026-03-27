import { GameState, CommandResult, Level, Difficulty, CompletionRequirement } from '@/types/game';
import { GAME_LEVELS } from '@/data/levels';

export class GameEngine {
  private state: GameState;
  private currentLevel: Level;
  private commandHistory: string[] = [];
  private timerInterval: NodeJS.Timeout | null = null;
  private onTimerUpdate?: (timeRemaining: number) => void;
  private onTimeUp?: () => void;

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

  private simulateDownloadFile(filename: string): { success: boolean; message: string } {
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

    // Simulate download
    const downloadProgress = [
      '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100%',
      `\nFile '${filename}' downloaded successfully!`,
      `Saved to: /home/agent/exfil/${filename}`,
      `Size: ${size} bytes`,
    ];

    // Store the full path for level completion checks
    this.state.exfiltratedFiles.push(fullPath);

    return {
      success: true,
      message: downloadProgress.join('\n'),
    };
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

    if (results.length === 0) {
      return `No matches found for pattern: ${pattern}`;
    }

    return results.join('\n');
  }

  private simulateEcho(content: string, filename?: string): string {
    if (filename) {
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
        return 'Already at root directory';
      }
      this.state.currentDirectory = '';
      return 'Changed to root directory';
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
        return `Changed to directory: ${fullPath}`;
      }

      return `Error: Directory '${directory}' not found`;
    }

    // Check at root level
    if (fs[dirWithSlash] !== undefined || (fs[cleanDir] !== undefined && typeof fs[cleanDir] === 'object')) {
      this.state.currentDirectory = cleanDir;
      return `Changed to directory: ${cleanDir}`;
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

    const filename = args[args.length - 1];
    const fs = this.currentLevel.fileSystem;
    const content = fs[filename.replace(/^\.\//, '')];

    if (typeof content !== 'string') {
      return `Error: ${filename} is not a readable file`;
    }

    try {
      const decoded = atob(content);
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
    return `Directory created: ${dirname}`;
  }

  private simulateTouch(filename: string): string {
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
        // Check if specific file was created (tracked via touch command)
        return this.commandHistory.some(cmd =>
          cmd.startsWith('touch') && cmd.includes(requirement.target as string)
        );

      case 'command_execution':
        return this.commandHistory.some(cmd =>
          cmd.startsWith(requirement.target as string)
        );

      case 'upload':
        return this.commandHistory.some(cmd =>
          cmd.startsWith('upload') && cmd.includes(requirement.target as string)
        );

      case 'decrypt':
        return this.commandHistory.some(cmd =>
          cmd.startsWith('base64') || cmd.includes('decrypt')
        );

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
    if (this.state.difficulty === 'easy') {
      return `HINT: ${this.currentLevel.hint}\n\nTry these commands: ${this.currentLevel.allowedCommands.join(', ')}\n\nProgress: ${this.state.exfiltratedFiles.length} files downloaded`;
    }
    return `HINT: ${this.currentLevel.hint}`;
  }

  cleanup(): void {
    this.stopTimer();
  }
}

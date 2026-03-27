# Operation Black Gold - Game Redesign Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Transform the game from a simple command typer to a realistic hacking simulator with actual objectives, file exfiltration, and time pressure.

**Architecture:**
- Add Document Viewer modal for reading files
- Implement Exfiltration tracking system (files downloaded to remote server)
- Add Timer component with countdown and game-over state
- Validate actual objective completion instead of command usage
- Implement password changing and login verification

**Tech Stack:**
- React portals for modal rendering
- useState for tracking exfiltrated files
- Timer component with useEffect for countdown
- Enhanced game engine with real validation logic

---

## LEVEL OBJECTIVES REDESIGN

### Current Problem
- Players just type commands to advance
- No actual mission completion required
- Too easy, no challenge

### New System
Each level has specific **completion requirements** that must be met:

| Level | Objective | Completion Requirement |
|-------|-----------|----------------------|
| 1 | Gather intelligence | **Download** `intel_report.txt` to your server |
| 2 | Reset CEO password | Change password using `passwd` AND verify with `login <new_pass>` |
| 3 | Steal classified docs | **Download** 3 classified files (war_plan.txt, payments.txt, secret_cabal.txt) |
| 4 | Bypass firewall | Find backdoor port and **document** it in a report file |
| 5 | Decrypt war plans | **Decrypt** the encrypted file using base64 and read the content |
| 6 | Plant evidence | **Create** false_flag.txt in /public/classified/ with specific content |
| 7 | Hijack satellite | **Execute** satellite override command successfully |
| 8 | Inject database | **Modify** database records (UPDATE statements) |
| 9 | Breach mainframe | **Download** master_evidence.txt using sudo |
| 10 | Final upload | **Upload** evidence to 3+ media outlets |

---

## IMPLEMENTATION TASKS

### Task 1: Create Document Viewer Component

**Files:**
- Create: `src/components/game/DocumentViewer.tsx`
- Modify: `src/components/game/GameTerminal.tsx`

**Implementation:**
```typescript
// DocumentViewer.tsx
interface DocumentViewerProps {
  filename: string;
  content: string;
  onClose: () => void;
}

// Features:
- Modal overlay with React Portal
- ESC key to close
- Syntax highlighting for code/config files
- File metadata display (name, size, type)
- Nice typography for readability
- Green terminal styling
```

**Step 1:** Create the component structure with modal overlay
**Step 2:** Add ESC key handler with useEffect
**Step 3:** Style with Tailwind (green terminal theme)
**Step 4:** Add syntax highlighting for different file types
**Step 5:** Add close button and click-outside-to-close
**Step 6:** Test with various file types
**Step 7:** Commit changes

---

### Task 2: Implement File Exfiltration System

**Files:**
- Modify: `src/types/game.ts` - Add exfiltratedFiles array to GameState
- Modify: `src/lib/game-engine.ts` - Add download/exfil command and tracking
- Modify: `src/components/game/GameTerminal.tsx` - Show downloaded files indicator

**Implementation:**
```typescript
// New state tracking
interface GameState {
  // ... existing
  exfiltratedFiles: string[];  // List of downloaded files
  currentDownloads: number;    // Total files downloaded
}

// New commands
download <filename>    // Download file to remote server
exfil list             // Show downloaded files
exfil status           // Show exfiltration progress

// Game engine changes
- trackDownloadedFile(filename: string)
- isFileDownloaded(filename: string): boolean
- getExfiltrationProgress(): { downloaded: number, required: number }
```

**Step 1:** Add exfiltratedFiles to GameState type
**Step 2:** Implement download command in game engine
**Step 3:** Add file download simulation with progress bar
**Step 4:** Track which files are downloaded per level
**Step 5:** Add "exfil list" command to show downloads
**Step 6:** Add UI indicator showing downloaded files count
**Step 7:** Test download flow
**Step 8:** Commit changes

---

### Task 3: Add Timer Component

**Files:**
- Create: `src/components/game/Timer.tsx`
- Modify: `src/components/game/GameTerminal.tsx` - Add timer display
- Modify: `src/types/game.ts` - Add timeRemaining to GameState

**Implementation:**
```typescript
// Timer.tsx
interface TimerProps {
  timeRemaining: number;  // seconds
  totalTime: number;      // seconds
  isPaused?: boolean;
}

// Features:
- Circular progress or countdown display
- Color changes: Green (>50%), Yellow (20-50%), Red (<20%)
- Flashing when critical (<30 seconds)
- Pause on document viewer open
- Game over modal when time expires
- Configurable time per level
```

**Level Time Limits:**
- Level 1: 3 minutes (easy recon)
- Level 2: 2 minutes (simple password change)
- Level 3: 4 minutes (search and download multiple files)
- Level 4: 3 minutes (find backdoor)
- Level 5: 5 minutes (decrypt challenge)
- Level 6: 3 minutes (plant evidence)
- Level 7: 4 minutes (satellite override)
- Level 8: 4 minutes (database work)
- Level 9: 5 minutes (final breach)
- Level 10: 3 minutes (upload and finish)

**Step 1:** Create Timer component with countdown
**Step 2:** Add color transitions based on time
**Step 3:** Add critical warning animation
**Step 4:** Implement pause/resume logic
**Step 5:** Add game-over state when time expires
**Step 6:** Integrate with GameTerminal
**Step 7:** Add level-specific time limits
**Step 8:** Test timer across all levels
**Step 9:** Commit changes

---

### Task 4: Implement Password Reset Validation

**Files:**
- Modify: `src/lib/game-engine.ts` - Add password state and validation
- Modify: `src/data/levels.ts` - Add password requirements to Level 2
- Modify: `src/components/game/GameTerminal.tsx` - Add password change UI

**Implementation:**
```typescript
// Password system
interface PasswordSystem {
  currentPassword: string;
  newPassword: string | null;
  isLoggedIn: boolean;
}

// Commands
passwd <new_password>              // Change password
login <password>                   // Test login/password
whoami                            // Show current user

// Level 2 validation
- Must change password from "BlackGold2026!" to something else
- Must verify new password works with login command
- Only completes level after successful login with new password
```

**Step 1:** Add password state to game engine
**Step 2:** Implement passwd command to change password
**Step 3:** Implement login command to verify password
**Step 4:** Add Level 2 validation logic (password changed AND login successful)
**Step 5:** Add feedback messages for success/failure
**Step 6:** Test password change flow
**Step 7:** Commit changes

---

### Task 5: Update Level Completion Logic

**Files:**
- Modify: `src/lib/game-engine.ts` - Replace command-based with objective-based validation
- Modify: `src/data/levels.ts` - Add completionRequirements to each level
- Modify: `src/types/game.ts` - Add LevelCompletionRequirements type

**Implementation:**
```typescript
// New validation system
interface LevelCompletionRequirements {
  type: 'download' | 'password_change' | 'file_creation' | 'command_execution' | 'upload';
  target: string | string[];  // File names or commands
  count?: number;             // For multiple items (e.g., download 3 files)
}

// Level examples
Level 1: {
  requirements: [
    { type: 'download', target: 'intel_report.txt' }
  ]
}

Level 2: {
  requirements: [
    { type: 'password_change' },
    { type: 'command_execution', target: 'login' }
  ]
}

Level 3: {
  requirements: [
    { type: 'download', target: ['war_plan.txt', 'payments.txt', 'secret_cabal.txt'], count: 3 }
  ]
}

// Validation function
validateLevelComplete(): boolean {
  // Check all requirements met
  // Return true only when ALL requirements satisfied
}
```

**Step 1:** Define LevelCompletionRequirements type
**Step 2:** Add requirements array to each level
**Step 3:** Implement validateLevelComplete() with real logic
**Step 4:** Add per-requirement validation functions
**Step 5:** Test each level's completion logic
**Step 6:** Commit changes

---

### Task 6: Add Mission Briefing & Tutorial

**Files:**
- Modify: `src/components/game/SplashScreen.tsx` - Add remote server explanation
- Create: `src/components/game/TutorialModal.tsx` - First-time tutorial
- Modify: `src/data/levels.ts` - Add detailed mission briefings

**Implementation:**
```typescript
// Mission briefing text
"Nemesis: Welcome, agent.

I am Nemesis, your handler for this operation.

YOUR REMOTE SERVER:
You have a secure server at /home/agent/exfil/ for downloading stolen files.
Use 'download <filename>' to exfiltrate documents to your server.

THE MISSION:
Expose the conspiracy between oil companies and governments.
10 levels of hacking await.

COMMANDS:
- ls, cat: View files
- download: Copy files to your server
- help: Show available commands

TIME LIMIT:
Each mission has a time limit. Move fast, stay undetected.

Good luck, agent. The world is counting on you."

// Tutorial features:
- First-time tutorial modal
- Explain basic commands
- Show document viewer example
- Explain download system
- Can be replayed from menu
```

**Step 1:** Create tutorial modal component
**Step 2:** Add Nemesis briefing text
**Step 3:** Add command examples
**Step 4:** Show document viewer preview
**Step 5:** Explain download system
**Step 6:** Add "show tutorial" button in menu
**Step 7:** Test tutorial flow
**Step 8:** Commit changes

---

### Task 7: Update Level Data with New Requirements

**Files:**
- Modify: `src/data/levels.ts` - Update all 10 levels with new completion requirements

**Implementation:**
Update each level with:
1. Detailed mission briefing
2. Specific completion requirements
3. Time limit
4. Required files to download
5. Success/failure messages

**Step 1:** Update Level 1 (download intel report, 3 min)
**Step 2:** Update Level 2 (password change + login, 2 min)
**Step 3:** Update Level 3 (download 3 files, 4 min)
**Step 4:** Update Level 4 (find backdoor, 3 min)
**Step 5:** Update Level 5 (decrypt file, 5 min)
**Step 6:** Update Level 6 (create file, 3 min)
**Step 7:** Update Level 7 (execute override, 4 min)
**Step 8:** Update Level 8 (modify database, 4 min)
**Step 9:** Update Level 9 (download master evidence, 5 min)
**Step 10:** Update Level 10 (upload to media, 3 min)
**Step 11:** Test all level completions
**Step 12:** Commit changes

---

### Task 8: Add Game Over & Victory Screens

**Files:**
- Create: `src/components/game/GameOverScreen.tsx`
- Create: `src/components/game/VictoryScreen.tsx`
- Modify: `src/components/game/GameTerminal.tsx` - Handle game-over state

**Implementation:**
```typescript
// Game Over scenarios:
- Time expired
- Too many failed attempts
- Detected by security (add detection meter?)

// Victory screen:
- Show completion stats
- Time taken
- Files exfiltrated
- Commands executed
- Difficulty completed
- Replay button
- Main menu button
```

**Step 1:** Create game over component
**Step 2:** Create victory component
**Step 3:** Add stats tracking
**Step 4:** Add restart functionality
**Step 5:** Test both screens
**Step 6:** Commit changes

---

### Task 9: Polish & Testing

**Files:**
- Modify: All components for consistency
- Add: Animations and transitions
- Add: Sound effects (optional)

**Implementation:**
- Smooth document viewer animations
- Progress bar for file downloads
- Timer warning effects
- Level completion celebrations
- Error feedback for invalid commands
- Hint system improvements for Normal mode

**Step 1:** Add download progress animation
**Step 2:** Add timer warning effects
**Step 3:** Polish document viewer transitions
**Step 4:** Add command feedback
**Step 5:** Test complete game flow on Easy
**Step 6:** Test complete game flow on Normal
**Step 7:** Fix any bugs
**Step 8:** Final commit

---

## TESTING CHECKLIST

### Manual Testing Required:
- [ ] Level 1: Can view files, download intel report, complete level
- [ ] Level 2: Can change password, login with new password, complete level
- [ ] Level 3: Can search, download multiple files, complete level
- [ ] Level 4: Can find backdoor port, document it, complete level
- [ ] Level 5: Can decrypt file, read content, complete level
- [ ] Level 6: Can create file in correct location, complete level
- [ ] Level 7: Can execute satellite override, complete level
- [ ] Level 8: Can modify database, complete level
- [ ] Level 9: Can use sudo, download master file, complete level
- [ ] Level 10: Can upload to multiple media outlets, complete game
- [ ] Timer works correctly and causes game over
- [ ] Document viewer ESC key works
- [ ] All downloads are tracked correctly
- [ ] Password system works properly
- [ ] Game over screen appears correctly
- [ ] Victory screen shows stats
- [ ] Tutorial is helpful for new players
- [ ] Easy mode hints are sufficient
- [ ] Normal mode is challenging but fair

---

## SUCCESS CRITERIA

✅ Players must actually complete objectives, not just type commands
✅ Document viewer provides immersive file reading experience
✅ File exfiltration system tracks downloads
✅ Timer adds urgency without being frustrating
✅ Password system requires actual verification
✅ All 10 levels are playable and completable
✅ Game provides clear feedback on progress
✅ Tutorial explains all new systems
✅ Both Easy and Normal modes are balanced

---

**Estimated Implementation Time:** 8-12 hours
**Priority:** HIGH (core game mechanics)
**Dependencies:** None (can implement in parallel)

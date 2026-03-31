# 🔒 Operation Black Gold

> An immersive terminal-based hacking game where you expose a global conspiracy.

**Status:** ✅ Complete | **Version:** 1.0.0 | **Release:** March 2026

---

## 🎮 Overview

Operation Black Gold is a web-based terminal hacking game that plunges you into a cyberpunk thriller story. As an agent recruited by the mysterious hacker "Nemesis," you must hack through 10 increasingly complex systems to expose a conspiracy between oil companies and governments to manipulate global energy prices.

The game features an authentic terminal interface, immersive 6-phase hacker intro, and realistic command-line gameplay inspired by classic hacking simulators.

---

## 📖 Story

The world believes the US-Iran war is real. They believe oil shortages are natural. They believe prices rose to $450/barrel because of conflict.

**THEY ARE WRONG.**

Your mission, should you choose to accept it: Hack 10 systems. Expose the conspiracy. Stop **Operation Black Gold**.

---

## ✨ Features

### Gameplay
- **10 Unique Levels** - From basic reconnaissance to advanced SQL injection
- **Realistic Terminal Interface** - Authentic command-line experience
- **Time-Limited Challenges** - Race against the clock to complete objectives
- **Progressive Difficulty** - Easy mode with hints, Normal mode for authentic challenge
- **Smart Validation System** - Must actually complete objectives, not just type commands

### Immersive Experience
- **6-Phase Hacker Intro** - Boot sequence → Connection → Authentication → Decryption → Briefing → Difficulty selection
- **Persistent Objective Panel** - Always-visible goals and progress tracking
- **Realistic Boot Sequences** - BIOS messages, proxy routing, encryption handshakes
- **CRT Terminal Effects** - Scanlines, vignette, text glow
- **Branching Story** - Your choices matter in exposing the conspiracy

### Technical
- **Modern Tech Stack** - Next.js 15, React 19, TypeScript, Tailwind CSS
- **Smooth Animations** - Framer Motion for 60fps transitions
- **Responsive Design** - Works on desktop, tablet, and mobile
- **No Backend Required** - All game logic runs in the browser

---

## 🎯 How to Play

### Objective
Each level presents you with a hacking objective. You must:
1. Read the objective carefully
2. Use terminal commands to explore the system
3. Complete the required tasks within the time limit
4. Progress to the next level

### Commands

#### File Operations
```bash
ls                    # List files in current directory
cd <directory>        # Change directory
pwd                   # Print working directory
cat <filename>        # Read file contents
head <filename>       # Show first 10 lines
tail <filename>       # Show last 10 lines
```

#### Network & Data
```bash
download <filename>   # Exfiltrate file to secure server
grep <pattern> <file> # Search for text in files
./<program>          # Launch executable programs
```

#### Utilities
```bash
help                  # Show available commands
clear / cls          # Clear terminal screen
```

#### Advanced Commands (unlocked as you progress)
```bash
base64 -d <file>     # Decode base64 encoded files
chmod +x <file>      # Make file executable
sqlite3 <db>         # Open SQLite database
UPDATE/DELETE        # SQL commands (in database mode)
sudo                 # Execute commands as superuser
```

---

## 🗺️ Game Levels

| Level | Title | Objective | Time |
|-------|-------|-----------|------|
| 1 | **Reconnaissance** | Gather intelligence on PetroGlobal executives | 3 min |
| 2 | **Password Reset** | Access CEO's private email | 2 min |
| 3 | **Data Exfiltration** | Steal classified documents | 4 min |
| 4 | **Bypass Firewall** | Find and exploit firewall backdoor | 3 min |
| 5 | **Decryption** | Decode Nemesis's encrypted message | 3 min |
| 6 | **Disinformation** | Plant evidence to expose conspiracy | 5 min |
| 7 | **Satellite Override** | Override government satellite control | 4 min |
| 8 | **Database Breach** | Extract and destroy incriminating records | 5 min |
| 9 | **Root Access** | Obtain superuser privileges | 6 min |
| 10 | **Global Disclosure** | Leak evidence to the world | 5 min |

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI Library:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Deployment:** Vercel (ready)

---

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/wanshazamirul/OpsBlackGold.git
cd OpsBlackGold
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Run development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. **Open in browser**
```
http://localhost:3000
```

### Build for Production

```bash
npm run build
npm start
```

---

## 🎨 Screenshots

> *Add screenshots here demonstrating the intro sequence, gameplay, and victory screens*

---

## 🤝 Contributing

This is a complete game project, but suggestions and bug reports are welcome:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👥 Credits

**Developed by:**
- **Shuhada** - AI Developer & Game Designer
- **Wan** - Creative Director & Story Writer

**Inspired by:**
- Uplink (2001)
- Hacknet (2015)
- Real-world cybersecurity events

**Special Thanks:**
- Nemesis Systems (fictional)
- The global hacker community

---

## 🌐 Live Demo

> *Add Vercel deployment link here once deployed*

---

## 📮 Contact

For questions, feedback, or just to say hi:

- **GitHub:** [@wanshazamirul](https://github.com/wanshazamirul)
- **Repository:** [https://github.com/wanshazamirul/OpsBlackGold](https://github.com/wanshazamirul/OpsBlackGold)

---

## 🔐 Security Note

**This is a GAME.** All hacking scenarios, commands, and systems are fictional and simulated. No real systems are accessed or harmed. The game is designed for entertainment and educational purposes only.

**Remember:** Unauthorized access to real computer systems is illegal. This game teaches command-line skills in a safe, simulated environment.

---

<div align="center">

**⭐ If you enjoy the game, please star the repository!**

**Made with ❤️ by Shu & Wan**

*Inspired by true events*

</div>

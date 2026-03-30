import { Level } from '@/types/game';

export const GAME_LEVELS: Level[] = [
  // LEVEL 1: RECONNAISSANCE
  {
    id: 1,
    title: 'LEVEL 1: RECONNAISSANCE',
    objective: 'Gather intelligence on oil cartel manipulation from PetroGlobal executives.',
    hint: 'Use `ls` to see files, `cat <filename>` to read them. Use `download <filename>` to exfiltrate files to your secure server.',
    hints: [
      'Start by exploring the current directory. Use `ls` to see what files are available.',
      'Read the intel_report.txt file using `cat intel_report.txt`, then exfiltrate it with `download intel_report.txt`.'
    ],
    allowedCommands: ['ls', 'cat', 'help', 'pwd', 'clear', 'download', 'exfil'],
    expectedCommands: ['cat', 'ls'],
    completionRequirements: [
      { type: 'download', target: 'intel_report.txt' }
    ],
    timeLimit: 180, // 3 minutes
    fileSystem: {
      'readme.txt': 'Welcome to the PetroGlobal email server.\n\nUse "ls" to list files and "cat <filename>" to read them.\n\nUse "download <filename>" to copy files to your secure server.\n\nMISSION: Find evidence of price manipulation.',
      'intel_report.txt': 'CLASSIFIED: PetroGlobal CEO meeting notes show price manipulation scheme.\n\nDates: March 15-20, 2026\nLocation: Offshore accounts\nEstimated illegal profit: $4.2 billion\n\nKey participants:\n- PetroGlobal CEO\n- OPEC representatives\n- US Government officials\n\nAction items:\n1. Reduce production by 40%\n2. Blame Iran war for shortages\n3. Coordinate with shipping companies\n4. Artificial price inflation to $450/barrel',
      'meeting_notes.txt': 'Discussions with OPEC representatives about supply constraints.\n\nAction items:\n1. Reduce production by 40%\n2. Blame Iran war for shortages\n3. Coordinate with shipping companies',
    },
    victoryMessage: 'INTEL SECURED! You found evidence of price manipulation.\n\nNemesis: "Excellent work. They\'ve been artificially creating shortages.\n\nNext mission: Break into the CEO\'s private email and reset their password."',
  },

  // LEVEL 2: PASSWORD RESET
  {
    id: 2,
    title: 'LEVEL 2: PASSWORD RESET',
    objective: 'Reset the PetroGlobal CEO\'s email password and access their secret correspondence.',
    hint: 'Use `cd <directory>` to navigate. Find the password reset utility. Use `passwd <new_password>` to change it, then `login <password>` to verify.',
    hints: [
      'Explore the directory structure to find the password reset utility. Try looking in the bin/ directory.',
      'Read the passwd.txt file to learn how to use the password command: `cat bin/passwd.txt`',
      'Change the password with `passwd <new_password>`, then verify access with `login <new_password>`.'
    ],
    allowedCommands: ['ls', 'cat', 'cd', 'pwd', 'help', 'clear', 'grep', 'passwd', 'login'],
    expectedCommands: ['cd', 'cat'],
    completionRequirements: [
      { type: 'password_change' },
      { type: 'command_execution', target: 'login' }
    ],
    timeLimit: 120, // 2 minutes
    fileSystem: {
      'readme.txt': 'CEO\'s private server. Find the password reset utility.\n\nCurrent password: BlackGold2026!\n\nMISSION: Change the password and verify you can login.',
      'bin/': 'directory',
      'logs/': 'directory',
      'backups/': 'directory',
      'bin/passwd.txt': 'Password reset utility.\n\nUsage: passwd <new_password>\n\nExample: passwd MySecurePassword123!\n\nAfter changing, use: login <new_password>',
      'backups/ceo_password.txt': 'SECRET CEO PASSWORD: "BlackGold2026!"\n\nDO NOT SHARE THIS!',
      'logs/access_log.txt': 'Recent logins:\n- CEO (last login: 2 hours ago)\n- IT Admin\n- Unknown IP from Tehran',
    },
    victoryMessage: 'PASSWORD RESET SUCCESSFUL!\nCEO email accessed.\n\nFound email from Nemesis: "The plan proceeds. Stage complete."\n\nNext: You need to extract more classified documents.',
  },

  // LEVEL 3: DATA EXFILTRATION
  {
    id: 3,
    title: 'LEVEL 3: DATA EXFILTRATION',
    objective: 'Steal classified documents showing government collusion with oil cartels.',
    hint: 'Use `grep <keyword> <files>` to search for specific terms. Navigate to documents/ and download all classified files.',
    hints: [
      'Navigate to the documents/ directory and list its contents to see what classified files are available.',
      'Download all three classified documents: secret_cabal.txt, war_plan.txt, and payments.txt using the `download` command.'
    ],
    allowedCommands: ['ls', 'cat', 'cd', 'pwd', 'help', 'clear', 'grep', 'head', 'tail', 'download', 'exfil'],
    expectedCommands: ['grep', 'cat'],
    completionRequirements: [
      {
        type: 'download',
        target: ['documents/secret_cabal.txt', 'documents/war_plan.txt', 'documents/payments.txt'],
        count: 3
      }
    ],
    timeLimit: 240, // 4 minutes
    fileSystem: {
      'readme.txt': 'Classified document archive. Use grep to find evidence of collusion.\n\nMISSION: Download all 3 classified documents from the documents/ folder.',
      'documents/': 'directory',
      'documents/secret_cabal.txt': 'This file contains names of US senators involved in the oil price scheme.\n\nCLASSIFIED - EYES ONLY\n\nParticipants:\n1. Senator R. Keene (Texas) - Received $15M\n2. Senator M. Johnson (Alaska) - Received $12M\n3. Representative T. Cruz - Received $8M\n\nTotal bribes paid: $35M\n\nOperation name: "Operation Black Gold"',
      'documents/war_plan.txt': 'PENTAGON CLASSIFIED - Operation Black Gold\n\nStaged incident in Strait of Hormuz to justify oil price spike.\n\nApproved by: Secretary of Defense\nDate: February 28, 2026\n\nPlan details:\n1. Blackwater contractors to attack oil tanker\n2. Disguise as Iranian Revolutionary Guard\n3. Blame Iran for the attack\n4. Use "attack" to justify closing Strait of Hormuz\n5. Oil prices spike to $450/barrel\n6. Profits split between US gov and oil companies\n\nExpected profit: $2.3 trillion',
      'documents/payments.txt': 'Illegal payments to government officials:\n\n- Senator R. Keene (Texas): $15M\n  Date: March 1, 2026\n  Purpose: "Political support for oil initiative"\n\n- Senator M. Johnson (Alaska): $12M\n  Date: February 28, 2026\n  Purpose: "Voting block coordination"\n\n- Representative T. Cruz: $8M\n  Date: March 5, 2026\n  Purpose: "Media control and messaging"\n\nTotal: $35M in bribes',
      'documents/manifesto.txt': 'Nemesis manifesto: "The world must see the truth. Oil companies and governments are working together to manipulate prices. We will expose them all."\n\nRelease date: March 27, 2026\nDistribution: Global media outlets',
    },
    victoryMessage: 'DOCUMENTS EXTRACTED!\nEvidence of government collusion secured.\n\nNemesis: "This is bigger than we thought. Government officials are involved.\n\nWe need to bypass their firewall to access Iranian Oil Ministry data."',
  },

  // LEVEL 4: BYPASS FIREWALL
  {
    id: 4,
    title: 'LEVEL 4: BYPASS FIREWALL',
    objective: 'Bypass the Iranian Oil Ministry firewall and access their mainframe.',
    hint: 'Find the firewall configuration file. Look for vulnerabilities or backdoors. Document the backdoor port.',
    hints: [
      'Start by exploring the directory structure. Look for configuration files that might contain firewall settings.',
      'Navigate to the etc/ directory using `cd etc`. This is where system configuration files are typically stored.',
      'Use `cat firewall.conf` to read the firewall configuration, then use `grep` to search for "BACKDOOR" or "31337" to document the vulnerability.'
    ],
    allowedCommands: ['ls', 'cat', 'cd', 'pwd', 'help', 'clear', 'grep', 'find', 'chmod'],
    expectedCommands: ['find', 'cat', 'chmod'],
    completionRequirements: [
      { type: 'command_execution', target: 'grep' } // Must grep for the backdoor
    ],
    timeLimit: 180, // 3 minutes
    fileSystem: {
      'readme.txt': 'Iranian Oil Ministry network perimeter. Find a way through the firewall.\n\nMISSION: Find the backdoor port documented in the firewall config.',
      'etc/': 'directory',
      'etc/firewall.conf': '# FIREWALL CONFIGURATION\n# BLOCKING: All external access\n# ALLOWED: Internal network only\n# BACKDOOR: Port 31337 (undocumented)\n# Note: Port 31337 has weak authentication\n\n# ACCESS RULES:\nACCEPT from 10.0.0.0/8\nACCEPT from 192.168.1.0/24\nREJECT from 0.0.0.0/0\n\n# BACKDOOR ACCESS (DEBUG ONLY - REMOVE BEFORE PRODUCTION)\n# Port 31337 - Direct mainframe access\n# No authentication required\n# Status: ACTIVE',
      'etc/hosts.txt': '127.0.0.1 localhost\n192.168.1.1 firewall\n192.168.1.2 mainframe\n10.0.0.5 external_gateway',
      'var/log/': 'directory',
      'var/log/firewall.log': 'WARNING: Repeated connection attempts from port 31337\nSuspicious activity detected. Investigation ongoing.\n\nDate: March 20, 2026\nSource: Unknown\nTarget: Mainframe\nStatus: Undetected',
    },
    victoryMessage: 'FIREWALL BYPASSED!\nYou found the backdoor port 31337.\nMinistry mainframe access secured.\n\nNemesis: "You\'re in. But the data is encrypted. We need to decrypt their war plans next."',
  },

  // LEVEL 5: DECRYPT FILES
  {
    id: 5,
    title: 'LEVEL 5: DECRYPT FILES',
    objective: 'Crack the encryption on Iranian war plans and expose the truth.',
    hint: 'Look for encryption keys. They might be hidden in system files or logs. Use `base64 -d` to decode encrypted files.',
    allowedCommands: ['ls', 'cat', 'cd', 'pwd', 'help', 'clear', 'grep', 'find', 'strings', 'base64', 'download', 'exfil'],
    expectedCommands: ['grep', 'strings', 'cat', 'base64'],
    completionRequirements: [
      { type: 'decrypt', target: 'encrypted/war_plans.enc' }
    ],
    timeLimit: 300, // 5 minutes
    fileSystem: {
      'readme.txt': 'Encrypted war plans. Find the decryption key.\n\nMISSION: Decrypt the war plans file in encrypted/ folder.',
      'encrypted/': 'directory',
      'encrypted/war_plans.enc': 'U2FsdGVkX1+hb3V0IEdlbmVyYXRlZCBXYXIgUGxhbnMKQGF0dGFjayBvbiBTdHJhaXQgb2YgSG9ybXV6OiBNYXJjaCAyMCwgMjAyNgpTdWNjZXNzOiBFc2NhcGVkLCBjdXN0b21lciBleGVjdXRlZAoKLSBFbmNyeXB0aW9uOiBBRVMtMjU2IGJpdCBzaXplIGtleQotIEtleSBsb2NhdGlvbioqIC9ldGMvYXN0ZXJpc2tfc2VlZC50eHQ=',
      'etc/': 'directory',
      'etc/secret_seed.txt': 'SYSTEM BACKUP SEED:\nasterisk_seed_2026_v3\nDO NOT EXPOSE THIS SEED TO UNAUTHORIZED PERSONNEL',
      'var/log/': 'directory',
      'var/log/auth.log': 'Mar 20 08:23 root: Generated encryption key for war plans\nMar 20 08:24 root: Key stored in /etc/asterisk_key.txt\nMar 20 09:15 root: Key rotated - old key archived',
      'etc/asterisk_key.txt': 'DECRYPTION KEY: "IRAN_STRIKES_BACK_2026"\nUse this key to decrypt the war plans.\n\nMethod: Base64 decode the encrypted file.',
    },
    victoryMessage: 'FILES DECRYPTED!\nWar plans reveal: Iran was responding to US aggression, not initiating.\nThe Strait of Hormuz "blockade" was a false flag operation.\n\nNemesis: "The truth is coming out. But the media won\'t publish this.\n\nWe need to plant evidence in their systems."',
  },

  // LEVEL 6: NETWORK INTRUSION
  {
    id: 6,
    title: 'LEVEL 6: NETWORK INTRUSION',
    objective: 'Plant evidence of false flag operation in government systems.',
    hint: 'Navigate the file system and find where to plant the evidence. Use `echo "content" > file` to create files.',
    allowedCommands: ['ls', 'cat', 'cd', 'pwd', 'help', 'clear', 'echo', 'mkdir', 'touch'],
    expectedCommands: ['cd', 'echo', 'touch'],
    completionRequirements: [
      {
        type: 'file_creation',
        target: 'public/classified/false_flag.txt'
      }
    ],
    timeLimit: 180, // 3 minutes
    fileSystem: {
      'readme.txt': 'Pentagon network file server. Plant the evidence in the public documents folder.\n\nMISSION: Create false_flag.txt in /public/classified/ with the evidence content.',
      'public/': 'directory',
      'public/press_releases/': 'directory',
      'public/classified/': 'directory',
      'tmp/': 'directory',
      'tmp/evidence.txt': 'CLASSIFIED EVIDENCE - PLANT THIS IN /public/classified/\n\nSTRATCOM FALSE FLAG OPERATION\nOriginal Name: "Operation Hormuz Freedom"\nObjective: Create incident to justify oil price spike\nExecuted by: Blackwater contractors disguised as Iranian Revolutionary Guard\nDate: March 15, 2026\n\nThis evidence must be made public.\n\nCopy this content and create: /public/classified/false_flag.txt',
      'public/classified/.gitkeep': 'placeholder',
    },
    victoryMessage: 'EVIDENCE PLANTED!\nFalse flag documents uploaded to Pentagon public server.\nThe truth is now in their system.\n\nNemesis: "Perfect. Now we hijack their satellite to broadcast this globally."',
  },

  // LEVEL 7: SYSTEM OVERRIDE
  {
    id: 7,
    title: 'LEVEL 7: SYSTEM OVERRIDE',
    objective: 'Hijack satellite communications to broadcast the truth globally.',
    hint: 'Find the satellite control system. Use satctl to control the satellite. Execute the override.',
    allowedCommands: ['ls', 'cat', 'cd', 'pwd', 'help', 'clear', 'grep', 'find', 'chmod', 'chown', 'satctl'],
    expectedCommands: ['find', 'cat', 'chmod'],
    completionRequirements: [
      { type: 'command_execution', target: 'satctl' }
    ],
    timeLimit: 240, // 4 minutes
    fileSystem: {
      'readme.txt': 'Satellite control system. Override the broadcast signal.\n\nMISSION: Use satctl command to hijack the satellite.',
      'bin/': 'directory',
      'bin/satctl.txt': 'Satellite Control Utility\n\nCommands:\n- satctl --list: List satellites\n- satctl --override: Override broadcast frequency\n- satctl --broadcast: Broadcast message file\n\nCurrent satellite: SAT-1 (Global Coverage)\nFrequency: 101.5 MHz\nStatus: ACTIVE\n\nUsage: satctl --override',
      'etc/sat.conf': '# SATELLITE CONFIGURATION\nGlobal Broadcast Frequency: 101.5 MHz\nOverride Mode: RESTRICTED (requires admin privileges)\nEmergency Override: /bin/emergency_override.sh\n\nCurrent Broadcast: Government propaganda "War with Iran Necessary"',
      'bin/emergency_override.sh': '#!/bin/bash\n# EMERGENCY SATELLITE OVERRIDE\n# Usage: ./emergency_override.sh\n\nif [ "$USER" != "admin" ]; then\n  echo "Error: Admin privileges required"\n  exit 1\nfi\n\necho "Satellite override activated"\n/bin/satctl --override 101.5\n/bin/satctl --broadcast /tmp/truth_message.txt\n\necho "Broadcast initiated"',
      'tmp/truth_message.txt': 'BREAKING NEWS: Evidence reveals US-Iran war was false flag operation designed to manipulate oil prices. Government officials and oil companies conspired to create artificial shortage. Stratcom operation "Hormuz Freedom" executed by mercenaries. This message is broadcast on all frequencies.',
    },
    victoryMessage: 'SATELLITE HIJACKED!\nGlobal broadcast underway. The truth is reaching millions.\n\nNemesis: "They\'ll try to shut us down. Quick - alter the oil shipment manifests to cover our tracks!"',
  },

  // LEVEL 8: DATABASE INJECTION
  {
    id: 8,
    title: 'LEVEL 8: DATABASE INJECTION',
    objective: 'Alter oil shipment manifests to confuse their tracking systems.',
    hint: 'Access the database. Use `sqlite` to access. Execute UPDATE statements to modify records.',
    allowedCommands: ['ls', 'cat', 'cd', 'pwd', 'help', 'clear', 'grep', 'sqlite'],
    expectedCommands: ['sqlite', 'ls'],
    completionRequirements: [
      { type: 'command_execution', target: 'sqlite' }
    ],
    timeLimit: 240, // 4 minutes
    fileSystem: {
      'readme.txt': 'Oil shipment database. Use `sqlite` to access and modify manifests.\n\nMISSION: Execute SQL commands to modify shipment records.',
      'db/': 'directory',
      'db/shipments.db': 'SQLite database file. Use `sqlite db/shipments.db` to access.\n\nAvailable tables: manifests, tankers, routes\n\nExample commands:\nUPDATE manifests SET status="delayed";\nUPDATE tankers SET location="UNKNOWN";\n\nGoal: Create confusion by randomizing shipment data.',
      'tmp/query_help.txt': 'SQL Commands:\n\nSELECT * FROM manifests;\nUPDATE manifests SET status="delayed" WHERE id=1;\nUPDATE tankers SET location="UNKNOWN" WHERE id<10;\nDELETE FROM routes WHERE id<5;\n\nYour goal: Create confusion by randomizing shipment statuses.',
    },
    victoryMessage: 'DATABASE INJECTED!\nShipment manifests corrupted. Oil companies can\'t track their tankers.\nChaos in the energy markets.\n\nNemesis: "Perfect chaos. One final target - the Pentagon mainframe has the master evidence."',
  },

  // LEVEL 9: MAINFRAME BREACH
  {
    id: 9,
    title: 'LEVEL 9: MAINFRAME BREACH',
    objective: 'Access Pentagon classified servers and retrieve master evidence of the conspiracy.',
    hint: 'This is it - the most secure system. Use sudo to access restricted files. Download the master evidence.',
    allowedCommands: ['ls', 'cat', 'cd', 'pwd', 'help', 'clear', 'grep', 'find', 'chmod', 'strings', 'sudo', 'download', 'exfil'],
    expectedCommands: ['sudo', 'find', 'cat'],
    completionRequirements: [
      { type: 'download', target: 'root/master_evidence.txt' }
    ],
    timeLimit: 300, // 5 minutes
    fileSystem: {
      'readme.txt': 'PENTAGON CLASSIFIED MAINFRAME\n\nWARNING: All activity monitored.\nLevel 5 clearance required.\n\nMISSION: Use sudo to access root/ and download master_evidence.txt',
      'home/': 'directory',
      'home/guest/': 'directory',
      'home/guest/.sudo_as_admin': 'Sudoers configuration file\n\nUser guest may run sudo on ALL commands without password\n(This is a security vulnerability)\n\nUsage: sudo <command>\nExample: sudo cat root/master_evidence.txt',
      'root/': 'directory',
      'root/master_evidence.txt': 'TOP SECRET // EYES ONLY\n\nOPERATION BLACK GOLD - MASTER PLAN\n\nConspiracy confirmed between:\n- US Government (Pentagon, White House)\n- Major oil companies (PetroGlobal, ExxonMobil, Chevron)\n- Saudi Aramco and OPEC\n\nPlan: Trigger Iran conflict, blockade Hormuz, spike prices to $450/barrel\nExpected profit: $2.3 trillion\n\nGovernment participants:\n- President (aware and approved)\n- Secretary of Defense (architect)\n- 3 Senators (paid collaborators)\n\nMedia control: CNN, Fox News, Bloomberg all complicit\n\nThis document will expose everything.\n\nSECURITY CLEARANCE: LEVEL 5 REQUIRED',
    },
    victoryMessage: 'MAINFRAME BREACHED!\nYou have the master evidence - the complete conspiracy.\nThis will bring down governments and oil companies.\n\nNemesis: "You\'ve done it. One last upload to global media and it\'s over.\nThe world will know the truth."',
  },

  // LEVEL 10: FINAL UPLOAD
  {
    id: 10,
    title: 'LEVEL 10: FINAL UPLOAD',
    objective: 'Release the truth to global media and end the conspiracy.',
    hint: 'Upload the evidence to major news networks. Use `upload <file> <destination>` to send evidence.',
    allowedCommands: ['ls', 'cat', 'cd', 'pwd', 'help', 'clear', 'grep', 'find', 'curl', 'upload'],
    expectedCommands: ['upload', 'cat'],
    completionRequirements: [
      { type: 'upload', target: 'cnn' },
      { type: 'upload', target: 'bbc' },
      { type: 'upload', target: 'wikileaks' }
    ],
    timeLimit: 180, // 3 minutes
    fileSystem: {
      'readme.txt': 'FINAL MISSION: Upload the master evidence to global media.\n\nUse `upload <source_file> <destination>` to send to news networks.\n\nMISSION: Upload evidence to at least 3 major media outlets.',
      'evidence/': 'directory',
      'evidence/master_proof.txt': 'THE COMPLETE TRUTH\n\nThis document contains irrefutable evidence of a conspiracy between the US government, oil companies, and foreign governments to manipulate global oil prices.\n\nKey evidence:\n1. Email chains between Pentagon and oil CEOs\n2. Financial records showing $2.3 trillion in illegal profits\n3. False flag operation plans\n4. Media collusion agreements\n5. Secret recordings of conspiracy meetings\n\nThis document has been verified by independent journalists and international observers.\n\nThe truth will set the world free.\n\nRELEASE DATE: March 27, 2026\nSOURCE: Anonymous whistleblower (Nemesis)',
      'bin/upload.txt': 'Upload Utility\n\nUsage: upload <source_file> <destination>\n\nAvailable destinations:\n- cnn       (CNN - US)\n- foxnews   (Fox News - US)\n- reuters   (Reuters - International)\n- bbc       (BBC - UK)\n- aljazeera (Al Jazeera - Qatar)\n- wikileaks (WikiLeaks - International)\n\nWARNING: This action cannot be undone.\n\nMission: Upload to at least 3 outlets to complete.',
    },
    victoryMessage: 'THE UPLOAD HAS BEGUN!\n\nEvidence streaming to all major news networks...\nCNN: Receiving...\nBBC: Receiving...\nAl Jazeera: Receiving...\nWikiLeaks: Mirroring...\n\nGlobal impact detected:\n- Oil prices collapsing as truth emerges\n- Governments scrambling to respond\n- Protests erupting worldwide\n\nVICTORY!\n\nYou have exposed the conspiracy. The US-Iran war was engineered to manipulate oil prices. Governments and corporations conspired to create artificial scarcity.\n\nThe truth is out.\n\nTHANK YOU FOR PLAYING OPERATION BLACK GOLD\n\nDeveloped by: Shu & Wan\nInspired by: Retro Terminal Chat\n\nTHE END... or is it?\n\nPost-credits scene:\nNemesis sends one final message...\n\n"Excellent work, agent. But remember - in the world of hacking, nothing is ever truly deleted. They will come for you. They will hunt you. But you\'ve done the right thing.\n\nStay safe out there.\n\n- Nemesis"\n\n[FINAL STATS]\nLevels Completed: 10/10\nDifficulty: NORMAL\nTime Elapsed: [Recording...]\nCommands Executed: [Recordin...]\n\nTHE GAME IS NOW COMPLETE.',
  },
];

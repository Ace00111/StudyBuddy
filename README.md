# Study Buddy

## 1. Project Description
Phase 1: A decentralized storage system using the Shelby Protocol. 
This application allows students to upload and retrieve study materials (files) securely using their Petra wallet for identity. It features a modern, dark-mode compatible UI for managing your study notes, lectures, and web links.

## 2. Installation

```bash
git clone <repo-url>
cd study-buddy
npm install
npm run dev
```

## 3. Requirements
- Node.js (latest LTS recommended)
- npm or yarn
- Petra Wallet extension installed

## 4. How It Works
- **Storage:** Files are uploaded to the Shelby Protocol network.
- **Links:** External web links are stored locally in the application state.
- **Identity:** The Petra wallet is used for ownership identity and authentication.

## 5. Git Setup Instructions
```bash
git init
git add .
git commit -m "initial phase 1 build"
git branch -M main
git remote add origin <repo-url>
git push -u origin main
```

## 6. Notes
- Shelby API endpoints may need adjustment based on official docs (currently using placeholders).
- This is Phase 1 (storage layer only).
- AI + learning system comes later.

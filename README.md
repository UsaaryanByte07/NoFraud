# NoFraud: Universal Threat Intelligence Hub 🛡️

**A Finalist Project for IndiaNext 24hr Hackathon by Team VAAS** 🇮🇳
(Organized at Kandivli Education Society's BK Shroff College Of Arts and MH Shroff College Of Commerce)

[![Vercel Deployment](https://img.shields.io/badge/Frontend-Vercel-black?style=for-the-badge&logo=vercel)](https://no-fraud.vercel.app/)
[![Render Deployment](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://nofraud-backend.onrender.com)
[![Status](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)]()

---

## 🏆 The IndiaNext Hackathon Journey
From **226 registrations**, the top **100 teams** were selected for the on-campus 24-hour hackathon. The event was split into two tracks: *Idea Sprint* and *Brainstorm*. 
Team VAAS competed in the highly competitive **Brainstorm track** alongside 70 other teams. Surviving a rigorous mid-hackathon elimination round that cut 30 teams, we successfully advanced to the **Final Round**, presenting our comprehensive cyber-defense solution. 

**Problem Statement:** *Design and develop a smart cyber defense platform that can detect, analyze, and explain emerging cyber threats using AI/ML techniques.*

---

## 🚫 The Problem
Digital fraud is no longer just "spam." It has evolved into a multi-vector attack surface involving **polymorphic phishing, malicious file attachments, social engineering, and AI-generated deepfakes.** Most users are overwhelmed by the technical complexity required to distinguish a legitimate message from a high-stakes fraud attempt.

## ✨ The Solution
**NoFraud** is a comprehensive, centralized ecosystem designed to democratize cybersecurity. We provide a single interface where users can analyze *any* suspicious digital artifact—be it a link, a file, a video, or an email—and receive an instant, AI-driven verdict.

---

## 🚀 Key Features

### 🌐 Centralized Analysis Hub (Web App)
Analyze any digital artifact in a unified, beautiful interface:
- **URL Scanner**: Real-time reputation checks.
- **File Analyzer**: Automated malware detection and signature analysis.
- **Deepfake Detector**: Advanced AI analysis to detect manipulated media and AI-generated content.
- **Threat Explanation Chat**: Contextual, GenAI-powered explanations of *why* the threat is dangerous.

### 🤖 AI-Powered Verdict Engine
- **Semantic Analysis**: Uses Google Gemini to detect psychological manipulation (urgency, impersonation) that traditional scanners miss.
- **Actionable Advice**: Every scan provides a "Why this is fraud" explanation and a step-by-step "What to do next" guide.
- **Security Reporting**: Downloadable PDF security reports featuring data visualization for threats identified over the last 15 days.

### 🧩 Chrome Extension (Active Protection)
- **Real-time Threat Detection**: Automatically identifies suspicious links while browsing.
- **Privacy Guard & Ad Blocker**: Enhanced privacy protection built into your browser, blocking invasive trackers.
- **Context Scripting Integration**: Directly ties browsing context into the NoFraud backend verdict engine.
- **Customizable Security PIN**: Lock specific extension features with a master PIN.

---

## 🛠️ Technical Architecture

The platform operates on a robust MERN-stack architecture enriched with multiple 3rd-party security and AI APIs:

```mermaid
graph TD
    User((User)) -->|Interacts| UI[React Frontend - Vercel]
    User -->|Real-time Protection| Extension[Chrome Extension]
    
    UI -->|API Calls via Axios| Backend[Node.js + Express Backend - Render]
    Extension -->|Content & Background Scripts| Backend
    
    Backend -->|Mongoose| DB[(MongoDB Atlas)]
    
    subgraph "Orchestration & Intelligence Layer"
        Backend --> Gemini[Google Gemini AI API]
        Backend --> VT[VirusTotal API]
        Backend --> Sight[Sightengine Deepfake API]
        Backend --> SendGrid[SendGrid API for OTP/Auth]
    end
    
    Backend -->|JSON Response| UI
    Backend -->|Verdict| Extension
```

---

## 💻 Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS (Neumorphic Design System), jsPDF, Chart.js for data visualization.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT Authentication, bcryptjs.
- **Extension**: Vanilla JS, Chrome Extension API (Manifest V3).
- **AI/Security APIs**: 
    - **Google Gemini**: Psychological & semantic threat analysis.
    - **Sightengine**: AI-media & deepfake detection.
    - **VirusTotal**: Malicious file & URL signatures.
- **DevOps**: Vercel (Frontend), Render (Backend).

---

## 🎨 Design Philosophy: Premium Neumorphism
The UI/UX is built on a **Light Neumorphic Design System** (Soft UI). Unlike traditional "flat" security tools, NoFraud uses calculated shadows, highlights, and subtle gradients to feel tactile, modern, and high-end. This approach transforms a stressful "technical security chore" into an engaging, premium interaction.

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account / Local URI
- API Keys for Gemini, VirusTotal, Sightengine, SendGrid

### Backend Setup
```bash
cd backend
npm install
# Create a .env file with your credentials (see .env config logic)
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
# Set VITE_API_URL in .env (e.g., http://localhost:3010/api)
npm run dev
```

### Chrome Extension Setup
1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **"Developer mode"** in the top right corner.
3. Click **"Load unpacked"** and select the `Extension` folder from the repository.

---

## 👥 Meet Team VAAS

- **Aryan Upadhyay** (Team Leader)
  - *Role:* Backend Developer
  - *GitHub:* [@UsaaryanByte07](https://github.com/UsaaryanByte07)
- **Varun Mange**
  - *Role:* Frontend Developer
  - *GitHub:* [@VarunQuantDev](https://github.com/VarunQuantDev)
- **Salman Ansari**
  - *Role:* Chrome Extension Developer
  - *GitHub:* [@BitSplice-pix](https://github.com/BitSplice-pix)
- **Ajinkya Salvi**
  - *Role:* Chrome Extension Developer
  - *GitHub:* [@SalviAjinkya](https://github.com/SalviAjinkya)

*Our Vision: To make the internet safe for everyone, one scan at a time.*

---

© 2026 Team VAAS | All Rights Reserved.

<div align="center">

# 🛡️ NoFraud: Universal Threat Intelligence Hub

**A Finalist Project for IndiaNext 24hr Hackathon by Team VAAS** 🇮🇳
*(Organized at Kandivli Education Society's BK Shroff College Of Arts and MH Shroff College Of Commerce)*

[![Vercel Deployment](https://img.shields.io/badge/Frontend-Vercel-black?style=for-the-badge&logo=vercel)](https://no-fraud.vercel.app/)
[![Render Deployment](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://nofraud-backend.onrender.com)
[![Status](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)]()

<br/>

*Design and develop a smart cyber defense platform that can detect, analyze, and explain emerging cyber threats using AI/ML techniques.*

</div>

---

## 💻 Tech Stack

<div align="center">
  <br/>
  
  ### Frontend
  ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
  
  ### Backend
  ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
  ![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
  ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
  
  ### APIs & Intelligence
  ![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white)
  ![VirusTotal](https://img.shields.io/badge/VirusTotal-394EFF?style=for-the-badge&logo=virustotal&logoColor=white)
  ![SendGrid](https://img.shields.io/badge/SendGrid-009DD9?style=for-the-badge&logo=twilio&logoColor=white)
  ![Sightengine](https://img.shields.io/badge/Sightengine_AI-FF4B4B?style=for-the-badge&logo=ai&logoColor=white)

  ### Extension & DevOps
  ![Chrome Extensions](https://img.shields.io/badge/Chrome_Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)
  ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
  ![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

  <br/>
</div>

---

## 🏆 The IndiaNext Hackathon Journey
From **226 registrations**, the top **100 teams** were selected for the on-campus 24-hour hackathon. The event was split into two tracks: *Idea Sprint* and *Brainstorm*. 
Team VAAS competed in the highly competitive **Brainstorm track** alongside 70 other teams. Surviving a rigorous mid-hackathon elimination round that cut out 30 teams, we successfully advanced to the **Final Round**, presenting our comprehensive cyber-defense solution. 

---

## 🚫 The Problem
Digital fraud is no longer just "spam." It has evolved into a multi-vector attack surface involving **polymorphic phishing, malicious file attachments, social engineering, and AI-generated deepfakes.** Most users are overwhelmed by the technical complexity required to distinguish a legitimate message from a high-stakes fraud attempt.

## ✨ The Solution
**NoFraud** is a comprehensive, centralized ecosystem designed to democratize cybersecurity. We provide a single interface where users can analyze *any* suspicious digital artifact—be it a link, a file, a video, or an email—and receive an instant, AI-driven verdict.

---

## 🚀 Key Features

### 🌐 Centralized Analysis Hub (Web App)
Analyze any digital artifact in a unified, beautiful interface:
- 🔗 **URL Scanner**: Real-time reputation checks.
- 📁 **File Analyzer**: Automated malware detection and signature analysis.
- 🎥 **Deepfake Detector**: Advanced AI analysis to detect manipulated media and AI-generated content.
- 💬 **Threat Explanation Chat**: Contextual, GenAI-powered explanations of *why* the threat is dangerous.

### 🤖 AI-Powered Verdict Engine
- 🧠 **Semantic Analysis**: Uses Google Gemini to detect psychological manipulation (urgency, impersonation) that traditional scanners miss.
- 🛡️ **Actionable Advice**: Every scan provides a "Why this is fraud" explanation and a step-by-step "What to do next" guide.
- 📊 **Security Reporting**: Downloadable PDF security reports featuring data visualization for threats identified over the last 15 days.

### 🧩 Chrome Extension (Active Protection)
- 🚨 **Real-time Threat Detection**: Automatically identifies suspicious links while browsing.
- 🛑 **Privacy Guard & Ad Blocker**: Enhanced privacy protection built into your browser, blocking invasive trackers.
- 🔗 **Context Scripting Integration**: Directly ties browsing context into the NoFraud backend verdict engine.
- 🔐 **Customizable Security PIN**: Lock specific extension features with a master PIN.

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

<table>
  <tr>
    <td align="center"><a href="https://github.com/UsaaryanByte07"><img src="https://avatars.githubusercontent.com/u/148785055?v=4" width="100px;" alt=""/><br /><sub><b>Aryan Upadhyay</b></sub></a><br />Backend Dev & Leader</td>
    <td align="center"><a href="https://github.com/VarunQuantDev"><img src="https://avatars.githubusercontent.com/u/152864669?v=4" width="100px;" alt=""/><br /><sub><b>Varun Mange</b></sub></a><br />Frontend Developer</td>
    <td align="center"><a href="https://github.com/BitSplice-pix"><img src="https://avatars.githubusercontent.com/u/user-id-here?v=4" width="100px;" alt=""/><br /><sub><b>Salman Ansari</b></sub></a><br />Chrome Extension Dev</td>
    <td align="center"><a href="https://github.com/SalviAjinkya"><img src="https://avatars.githubusercontent.com/u/user-id-here?v=4" width="100px;" alt=""/><br /><sub><b>Ajinkya Salvi</b></sub></a><br />Chrome Extension Dev</td>
  </tr>
</table>

<div align="center">
  <i>Our Vision: To make the internet safe for everyone, one scan at a time.</i>
  <br/><br/>
  © 2026 Team VAAS | All Rights Reserved.
</div>


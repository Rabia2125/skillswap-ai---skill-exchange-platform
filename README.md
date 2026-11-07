# SkillSwap AI - Professional Full-Stack Skill Exchange Platform

**Project Name:** SkillSwap AI  
**Project Type:** AI-Powered Skill Exchange Web Application  
**Project Purpose:** Software Construction & Development (SCD) Academic Project  
**Tagline:** *"Share Your Skills. Learn Something New. Grow Together."*  

---

## 🚀 Overview

SkillSwap AI is a full-stack, AI-powered skill exchange platform where people connect with others, share their existing skills, learn new skills, and exchange knowledge without any monetary payments.

### Key Use Case
- **User A (Alex Rivera)** knows React.js & Web Development and wants to learn UI/UX & Figma.
- **User B (Maya Lin)** knows UI/UX & Figma and wants to learn React.js.
- Both users discover each other, send mutual swap requests, accept the proposal, communicate through real-time chat, and schedule Google Meet / Zoom learning sessions with Gemini AI roadmaps.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 19 SPA with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (Plus Jakarta Sans typography, custom design system)
- **Icons:** Lucide React
- **Animations:** Motion
- **State Management:** React Context API + LocalStorage persistence

### Backend & API
- **Live Server:** Node.js Express + TSX full-stack entry point on Port 3000
- **Academic Python Backend:** FastAPI architecture in `backend/app` with Pydantic validation
- **Real-Time Duplex:** WebSockets (`ws` protocol) with typing indicators & instant delivery
- **Security & Auth:** JSON Web Tokens (JWT) & Bcrypt salted password hashing
- **Database:** MongoDB document architecture with persistent local storage engine
- **AI Engine:** Google Gemini 3.8 Flash (`@google/genai`)

---

## ✨ Features Implemented

1. **User Authentication Module**
   - Secure Sign Up & Login with email validation and password requirements.
   - JWT-based authorization and session recovery.
   - 1-click Academic Demo Login accounts (Alex Rivera & Maya Lin).
   - Password reset flow with development expiring tokens.

2. **Personal Profile Management**
   - 14 distinct profile fields including bio, skills offered, skills wishlist, experience, education, availability, and learning goals.
   - Profile completion score meter.
   - Immediate automatic synchronization with Browse Skills.

3. **Browse Skills & Discovery**
   - Search bar across Skill Name, User Name, Category, and Location.
   - All 14 SCD Skill Categories (Web Dev, App Dev, UI/UX, AI, Python, Video Editing, etc.).
   - Working filters for Beginner, Intermediate, Advanced, and Expert.
   - Send Swap Request modal with offer/request pickers and custom messaging.

4. **Swap Request Management**
   - **Tab 1: Received Requests** (Accept & Decline buttons).
   - **Tab 2: Sent Requests** (Pending, Accepted, Rejected, Cancelled with Cancel button).
   - **Tab 3: Accepted Requests** (Direct link to real-time chat and video session).

5. **Real-Time Chat & Video Links**
   - WebSockets live messaging with typing indicator.
   - Google Meet & Zoom meeting launcher cards with 1-click Join and Copy Link buttons.
   - Session scheduler modal.

6. **Gemini-Powered AI Skill Assistant**
   - Step-by-step personalized learning roadmaps.
   - Skill exchange strategy & partner matching advice.
   - Collaborative project recommendations.
   - Curated educational resources.

7. **Guest User Security (Section 15.1)**
   - Unauthenticated visitors can view the landing page, browse categories, and explore public skill cards with private emails hidden.
   - Protected actions (swap requests, profiles, chat, dashboard, AI assistant) enforce authentication guards and open login prompts.

8. **Automated SCD Academic Test Suite**
   - In-app interactive test runner executing all 21 test cases (TC-01..11 and GTC-01..10) against live backend endpoints with real-time pass/fail indicators.

---

## 🏃 Running the Application

```bash
# Install dependencies
npm install

# Start full-stack dev server (Vite + Express + WebSockets + Gemini API on port 3000)
npm run dev
```

Visit `http://localhost:3000` to interact with the platform.

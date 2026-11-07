# SkillSwap AI - System Architecture Documentation

**Project Purpose:** Software Construction & Development (SCD) Academic Project  
**Author / Engineering Lead:** Senior Full-Stack Software Engineer  
**Architecture Style:** Layered Micro-Service & Modular Monolith with Real-Time Event-Driven Messaging  

---

## 1. High-Level Architecture Overview

SkillSwap AI is designed as a decoupled, multi-tiered web platform supporting two operational tiers:
1. **Interactive Client Application (React SPA + Tailwind CSS + TypeScript)**
2. **Backend Services & API Layer (Python FastAPI / Node.js Express)**
3. **Database Tier (MongoDB Document Database)**
4. **AI Intelligence Engine (Google Gemini 3.8 Flash)**
5. **Real-Time Duplex Communication (WebSockets)**

```
┌──────────────────────────────────────────────────────────────┐
│                       Client Layer                           │
│  - React 19 SPA (Vite)                                       │
│  - Tailwind CSS UI with Plus Jakarta Sans & Modern Blue SaaS │
│  - Protected Route Guards (Guest vs Authenticated)           │
└──────────────┬──────────────────────────────▲────────────────┘
               │ HTTP REST API                │ WebSockets
               │ Requests                     │ Real-Time Events
┌──────────────▼──────────────────────────────┴────────────────┐
│                       Server Layer                           │
│  - FastAPI / Express REST Routers                            │
│  - JWT Bearer Authentication & Bcrypt Password Hashing       │
│  - WebSocket Connection & Event Manager                      │
│  - Google Gemini 3.8 Flash Server-Side Integration           │
└──────────────┬──────────────────────────────▲────────────────┘
               │ Driver Queries               │
               ▼                              │
┌─────────────────────────────────────────────┴────────────────┐
│                   Data & Persistence Layer                   │
│  - MongoDB Document Collections (Users, Profiles, Requests)  │
│  - Real-Time JSON Document Persistence Engine                │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Core Modules Breakdown

### A. Authentication & Session Module
- **JWT Authentication:** Tokens signed using HS256 with 7-day expiration.
- **Password Security:** Salted and hashed using `bcrypt` (10 rounds).
- **Guest Separation:** Public discovery endpoints filter private identifiers; protected views require valid Bearer token.

### B. Browse & Smart Skill Discovery Engine
- **Search:** Case-insensitive multi-attribute indexing (Skill, User, Category, Location).
- **Categories:** All 14 SCD categories indexed and filtered.
- **Smart Matching Algorithm:** Calculates intersection between current user's taught skills and partner's learning wishlist, prioritizing mutual win-win swaps.

### C. Swap Request State Machine
- States: `Pending` -> `Accepted` | `Rejected` | `Cancelled` | `Completed`.
- Invariant rules prevent:
  - Self-swapping.
  - Duplicate active pending requests between identical user pairs.
  - Unauthorized status transitions (e.g. non-recipients accepting requests).

### D. Real-Time Chat & Meeting Integration
- Full-duplex WebSocket connections handle message broadcasting and typing status.
- Automatic parser recognizes Google Meet and Zoom URLs, formatting them into rich interactive meeting action cards.

### E. AI Skill Assistant
- Connected server-side to **Google Gemini 3.8 Flash**.
- Injects authenticated user profile metadata into system context for deeply personalized roadmap generation.

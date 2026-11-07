# SkillSwap AI - Database Design & Schema Specification

**Database Engine:** MongoDB  
**Document Architecture:** Normalized Document References with Embedded High-Frequency Profile Fields  

---

## 1. MongoDB Collections Overview

SkillSwap AI organizes its data model into distinct collections:

1. `users`: Core account credentials, email, password hash, created timestamps.
2. `profiles`: Rich user profile data, skills offered, skills wishlist, bio, experience.
3. `swap_requests`: Formal skill exchange proposals, status state machine, audit trails.
4. `conversations`: Messaging session links between accepted swap partners.
5. `messages`: Real-time chat messages, meeting session attachments, read states.
6. `notifications`: In-app event alerts (requests, acceptances, messages).
7. `exchange_history`: Finished and ongoing learning partnerships with reviews and ratings.
8. `ai_chat_history`: Historical prompt-response turns with Gemini AI.

---

## 2. Collection Schemas

### `users` Collection
```json
{
  "_id": "ObjectId",
  "name": "Alex Rivera",
  "email": "alex.rivera@example.com",
  "passwordHash": "$2a$10$...",
  "location": "San Francisco, CA",
  "createdAt": "ISODate"
}
```
**Indexes:** `unique: email`, `index: location`.

### `profiles` Collection
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId(users)",
  "title": "Full-Stack Software Engineer",
  "bio": "Senior developer with 6+ years experience...",
  "avatar": "url_string",
  "skillsToTeach": [
    {
      "id": "sk_1",
      "name": "React.js & Next.js",
      "category": "Web Development",
      "level": "Advanced",
      "experienceYears": 5,
      "description": "Component architecture and state management"
    }
  ],
  "skillsToLearn": ["UI/UX Designing", "Figma Prototyping"],
  "experience": "Senior Engineer at CloudScale Tech",
  "education": "B.S. in Computer Science, UC Berkeley",
  "availability": "Weekday evenings",
  "learningGoals": "Create production-ready design mockups in Figma",
  "rating": 4.9,
  "exchangesCompleted": 8
}
```
**Indexes:** `text: skillsToTeach.name`, `index: skillsToTeach.category`.

### `swap_requests` Collection
```json
{
  "_id": "ObjectId",
  "senderId": "ObjectId(users)",
  "receiverId": "ObjectId(users)",
  "offeredSkill": "React.js & Next.js",
  "requestedSkill": "UI/UX Designing",
  "message": "Hi Maya! Let's swap skills.",
  "status": "Pending",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```
**Compound Index:** `{ senderId: 1, receiverId: 1, status: 1 }` (enforces uniqueness for pending requests).

### `messages` Collection
```json
{
  "_id": "ObjectId",
  "conversationId": "ObjectId(conversations)",
  "senderId": "ObjectId(users)",
  "content": "Tomorrow at 6 PM EST works!",
  "meeting": {
    "provider": "Google Meet",
    "url": "https://meet.google.com/abc-defg-hij",
    "title": "React Architecture Session"
  },
  "read": true,
  "createdAt": "ISODate"
}
```
**Indexes:** `index: conversationId`, `index: createdAt`.

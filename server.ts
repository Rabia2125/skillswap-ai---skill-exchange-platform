import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  INITIAL_USERS,
  INITIAL_SWAP_REQUESTS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_EXCHANGES,
  SKILL_CATEGORIES
} from './src/data/mockDatabase';
import { User, SwapRequest, Conversation, Message, NotificationItem, ExchangeRecord } from './src/types';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'skillswap-ai-secure-development-jwt-secret-2026';
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const DB_FILE = path.resolve(process.cwd(), 'data', 'db.json');

// --- Persistent Database Initialization ---
interface DatabaseSchema {
  users: (User & { passwordHash?: string })[];
  swapRequests: SwapRequest[];
  conversations: Conversation[];
  messages: Message[];
  notifications: NotificationItem[];
  exchanges: ExchangeRecord[];
  aiHistory: { userId: string; role: 'user' | 'assistant'; content: string; timestamp: string }[];
}

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read db.json, initializing fresh store:', err);
  }

  // Initial database state
  const defaultDb: DatabaseSchema = {
    users: INITIAL_USERS.map(u => ({
      ...u,
      passwordHash: bcrypt.hashSync('password123', 10)
    })),
    swapRequests: INITIAL_SWAP_REQUESTS,
    conversations: INITIAL_CONVERSATIONS,
    messages: INITIAL_MESSAGES,
    notifications: INITIAL_NOTIFICATIONS,
    exchanges: INITIAL_EXCHANGES,
    aiHistory: []
  };

  saveDatabase(defaultDb);
  return defaultDb;
}

function saveDatabase(data: DatabaseSchema) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist database:', err);
  }
}

let db = loadDatabase();

// --- Gemini AI Setup ---
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// --- App and WebSocket Server ---
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(express.json({ limit: '10mb' }));

// Active WebSocket connections mapped by userId
const activeSockets = new Map<string, Set<WebSocket>>();

wss.on('connection', (ws: WebSocket, req) => {
  const url = new URL(req.url || '', 'http://localhost');
  const token = url.searchParams.get('token');
  let currentUserId: string | null = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      currentUserId = decoded.id;
      if (!activeSockets.has(currentUserId)) {
        activeSockets.set(currentUserId, new Set());
      }
      activeSockets.get(currentUserId)!.add(ws);
    } catch {
      // Allow unauthenticated connection or close gracefully
    }
  }

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type === 'auth' && msg.token) {
        try {
          const decoded = jwt.verify(msg.token, JWT_SECRET) as { id: string };
          currentUserId = decoded.id;
          if (!activeSockets.has(currentUserId)) {
            activeSockets.set(currentUserId, new Set());
          }
          activeSockets.get(currentUserId)!.add(ws);
          ws.send(JSON.stringify({ type: 'authenticated', userId: currentUserId }));
        } catch {
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid token' }));
        }
      } else if (msg.type === 'typing' && currentUserId && msg.conversationId && msg.partnerId) {
        // Broadcast typing indicator to partner
        const partnerSockets = activeSockets.get(msg.partnerId);
        if (partnerSockets) {
          const payload = JSON.stringify({
            type: 'partner_typing',
            conversationId: msg.conversationId,
            userId: currentUserId,
            isTyping: !!msg.isTyping
          });
          partnerSockets.forEach(s => s.readyState === WebSocket.OPEN && s.send(payload));
        }
      }
    } catch (e) {
      console.error('WS message error:', e);
    }
  });

  ws.on('close', () => {
    if (currentUserId && activeSockets.has(currentUserId)) {
      activeSockets.get(currentUserId)!.delete(ws);
      if (activeSockets.get(currentUserId)!.size === 0) {
        activeSockets.delete(currentUserId);
      }
    }
  });
});

function broadcastToUser(userId: string, event: object) {
  const sockets = activeSockets.get(userId);
  if (sockets) {
    const payload = JSON.stringify(event);
    sockets.forEach(s => {
      if (s.readyState === WebSocket.OPEN) s.send(payload);
    });
  }
}

// --- Auth Middleware ---
interface AuthenticatedRequest extends Request {
  user?: User;
}

function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({ error: 'Session expired or invalid token.' });
    }
    const user = db.users.find(u => u.id === (decodedUser as { id: string }).id);
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }
    req.user = user;
    next();
  });
}

function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
      if (!err && decodedUser) {
        const user = db.users.find(u => u.id === (decodedUser as { id: string }).id);
        if (user) req.user = user;
      }
      next();
    });
  } else {
    next();
  }
}

// Helper to sanitize public user data for guest exploration
function sanitizeUserForPublic(u: User, requestingUserId?: string) {
  const isOwner = requestingUserId && requestingUserId === u.id;
  return {
    id: u.id,
    name: u.name,
    email: isOwner ? u.email : undefined, // Guest/Public doesn't see private email
    location: u.location,
    profile: {
      id: u.profile.id,
      name: u.profile.name,
      avatar: u.profile.avatar,
      location: u.profile.location,
      title: u.profile.title,
      bio: u.profile.bio,
      skillsToTeach: u.profile.skillsToTeach,
      skillsToLearn: u.profile.skillsToLearn,
      experience: u.profile.experience,
      education: u.profile.education,
      interests: u.profile.interests,
      availability: u.profile.availability,
      learningGoals: u.profile.learningGoals,
      joinedDate: u.profile.joinedDate,
      rating: u.profile.rating || 5.0,
      exchangesCompleted: u.profile.exchangesCompleted || 0
    }
  };
}

// --- REST API Endpoints ---

// 1. Health check & skill categories
app.get('/api/skills/categories', (_req: Request, res: Response) => {
  const categoryStats = SKILL_CATEGORIES.map(cat => {
    const count = db.users.reduce((acc, u) => {
      const teaches = u.profile.skillsToTeach.some(s => s.category.toLowerCase() === cat.toLowerCase());
      return acc + (teaches ? 1 : 0);
    }, 0);
    return { name: cat, count };
  });
  res.json({ categories: categoryStats });
});

// 2. Authentication APIs
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, location } = req.body;

  if (!name || !email || !password || !location) {
    return res.status(400).json({ error: 'All fields (name, email, password, location) are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email address already exists.' });
  }

  const userId = `user_${Date.now()}`;
  const passwordHash = bcrypt.hashSync(password, 10);

  const newUser: User & { passwordHash: string } = {
    id: userId,
    name,
    email: email.toLowerCase(),
    location,
    createdAt: new Date().toISOString(),
    passwordHash,
    profile: {
      id: `prof_${userId}`,
      name,
      email: email.toLowerCase(),
      avatar: '/src/assets/images/avatar_mentor_female_1794059251546.jpg',
      location,
      title: 'Member & Skill Explorer',
      bio: `Hello! I recently joined SkillSwap AI to exchange practical skills and grow my technical capabilities.`,
      skillsToTeach: [
        {
          id: `sk_${Date.now()}`,
          name: 'Web Development Basics',
          category: 'Web Development',
          level: 'Beginner',
          experienceYears: 1,
          description: 'HTML5, CSS, and basic JavaScript'
        }
      ],
      skillsToLearn: ['UI/UX Designing', 'Python'],
      experience: 'Looking for hands-on peer collaboration',
      education: 'Self-directed learner',
      interests: ['Software Development', 'Lifelong Learning'],
      availability: 'Flexible weekday evenings',
      learningGoals: 'Master modern full-stack development and build real-world applications.',
      joinedDate: 'Just now',
      rating: 5.0,
      exchangesCompleted: 0
    }
  };

  db.users.push(newUser);
  saveDatabase(db);

  const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
  const { passwordHash: _, ...safeUser } = newUser;

  res.status(201).json({
    token,
    user: safeUser,
    message: 'Account created successfully! Welcome to SkillSwap AI.'
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const valid = bcrypt.compareSync(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  const { passwordHash: _, ...safeUser } = user;

  res.json({
    token,
    user: safeUser,
    message: 'Logged in successfully.'
  });
});

app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { passwordHash: _, ...safeUser } = req.user as User & { passwordHash?: string };
  res.json({ user: safeUser });
});

app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Please enter your registered email address.' });
  }
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: 'No account found with this email.' });
  }

  const resetToken = jwt.sign({ id: user.id, type: 'password_reset' }, JWT_SECRET, { expiresIn: '15m' });
  res.json({
    message: 'Password reset link generated.',
    devResetToken: resetToken,
    instructions: 'In development mode, token valid for 15 minutes. Use this token or set up SMTP env variables for production.'
  });
});

// 3. User & Profile APIs
app.get('/api/users', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const currentUserId = req.user?.id;
  const { search, category, level, location } = req.query;

  let results = db.users
    // Don't show current logged-in user in browse pool
    .filter(u => !currentUserId || u.id !== currentUserId)
    .map(u => sanitizeUserForPublic(u, currentUserId));

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    results = results.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.location.toLowerCase().includes(q) ||
      u.profile.title.toLowerCase().includes(q) ||
      u.profile.skillsToTeach.some(s => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)) ||
      u.profile.skillsToLearn.some(s => s.toLowerCase().includes(q))
    );
  }

  if (category && typeof category === 'string' && category !== 'All') {
    results = results.filter(u =>
      u.profile.skillsToTeach.some(s => s.category.toLowerCase() === category.toLowerCase())
    );
  }

  if (level && typeof level === 'string' && level !== 'All') {
    results = results.filter(u =>
      u.profile.skillsToTeach.some(s => s.level.toLowerCase() === level.toLowerCase())
    );
  }

  if (location && typeof location === 'string') {
    const loc = location.toLowerCase().trim();
    results = results.filter(u => u.location.toLowerCase().includes(loc));
  }

  res.json({ users: results, count: results.length });
});

app.get('/api/users/:id', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User profile not found.' });
  }
  res.json({ user: sanitizeUserForPublic(user, req.user?.id) });
});

// Update Profile (Syncs immediately with Browse Skills)
app.put('/api/profile', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const currentUserId = req.user!.id;
  const userIndex = db.users.findIndex(u => u.id === currentUserId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const {
    name,
    location,
    title,
    bio,
    avatar,
    skillsToTeach,
    skillsToLearn,
    experience,
    education,
    interests,
    availability,
    learningGoals
  } = req.body;

  if (name) db.users[userIndex].name = name;
  if (location) db.users[userIndex].location = location;

  const currentProf = db.users[userIndex].profile;
  db.users[userIndex].profile = {
    ...currentProf,
    name: name || currentProf.name,
    location: location || currentProf.location,
    title: title !== undefined ? title : currentProf.title,
    bio: bio !== undefined ? bio : currentProf.bio,
    avatar: avatar || currentProf.avatar,
    skillsToTeach: Array.isArray(skillsToTeach) ? skillsToTeach : currentProf.skillsToTeach,
    skillsToLearn: Array.isArray(skillsToLearn) ? skillsToLearn : currentProf.skillsToLearn,
    experience: experience !== undefined ? experience : currentProf.experience,
    education: education !== undefined ? education : currentProf.education,
    interests: Array.isArray(interests) ? interests : currentProf.interests,
    availability: availability !== undefined ? availability : currentProf.availability,
    learningGoals: learningGoals !== undefined ? learningGoals : currentProf.learningGoals
  };

  saveDatabase(db);

  const { passwordHash: _, ...safeUser } = db.users[userIndex];
  res.json({
    message: 'Profile updated successfully and synced with Browse Skills!',
    user: safeUser
  });
});

// 4. Swap Requests Management
app.get('/api/swaps/requests', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { tab } = req.query; // 'received' | 'sent' | 'accepted'

  let filtered = db.swapRequests.filter(r => r.senderId === userId || r.receiverId === userId);

  if (tab === 'received') {
    filtered = filtered.filter(r => r.receiverId === userId && r.status === 'Pending');
  } else if (tab === 'sent') {
    filtered = filtered.filter(r => r.senderId === userId);
  } else if (tab === 'accepted') {
    filtered = filtered.filter(r => r.status === 'Accepted' || r.status === 'Completed');
  }

  res.json({ requests: filtered });
});

app.post('/api/swaps/requests', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const sender = req.user!;
  const { receiverId, offeredSkill, requestedSkill, message } = req.body;

  if (!receiverId || !offeredSkill || !requestedSkill || !message) {
    return res.status(400).json({ error: 'All fields (receiverId, offeredSkill, requestedSkill, message) are required.' });
  }

  if (receiverId === sender.id) {
    return res.status(400).json({ error: 'You cannot send a skill swap request to yourself.' });
  }

  const receiver = db.users.find(u => u.id === receiverId);
  if (!receiver) {
    return res.status(404).json({ error: 'Recipient user does not exist.' });
  }

  // Prevent duplicate active pending requests
  const existingPending = db.swapRequests.find(
    r => r.senderId === sender.id && r.receiverId === receiverId && r.status === 'Pending'
  );
  if (existingPending) {
    return res.status(409).json({ error: 'You already have a pending swap request with this user.' });
  }

  const newRequest: SwapRequest = {
    id: `req_${Date.now()}`,
    senderId: sender.id,
    senderName: sender.name,
    senderAvatar: sender.profile.avatar,
    senderLocation: sender.location,
    receiverId: receiver.id,
    receiverName: receiver.name,
    receiverAvatar: receiver.profile.avatar,
    receiverLocation: receiver.location,
    offeredSkill,
    requestedSkill,
    message,
    status: 'Pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.swapRequests.unshift(newRequest);

  // Create notification for receiver
  const notif: NotificationItem = {
    id: `notif_${Date.now()}`,
    userId: receiver.id,
    title: 'New Skill Swap Request',
    message: `${sender.name} offered to teach "${offeredSkill}" for your "${requestedSkill}".`,
    type: 'swap_request',
    link: '/requests',
    read: false,
    createdAt: new Date().toISOString()
  };
  db.notifications.unshift(notif);

  saveDatabase(db);

  // Notify recipient in real time if online
  broadcastToUser(receiver.id, { type: 'new_request', request: newRequest });
  broadcastToUser(receiver.id, { type: 'new_notification', notification: notif });

  res.status(201).json({
    message: 'Skill swap request sent successfully!',
    request: newRequest
  });
});

app.post('/api/swaps/requests/:id/accept', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const requestId = req.params.id;

  const requestIndex = db.swapRequests.findIndex(r => r.id === requestId);
  if (requestIndex === -1) {
    return res.status(404).json({ error: 'Request not found.' });
  }

  const request = db.swapRequests[requestIndex];

  // Authorization check: Only the recipient can accept
  if (request.receiverId !== userId) {
    return res.status(403).json({ error: 'Only the recipient of this request can accept it.' });
  }

  if (request.status !== 'Pending') {
    return res.status(400).json({ error: `Cannot accept a request that is already ${request.status}.` });
  }

  request.status = 'Accepted';
  request.updatedAt = new Date().toISOString();

  // Create or activate conversation between both users
  let conversation = db.conversations.find(
    c => c.participants.includes(request.senderId) && c.participants.includes(request.receiverId)
  );

  const senderUser = db.users.find(u => u.id === request.senderId);
  const receiverUser = db.users.find(u => u.id === request.receiverId);

  if (!conversation) {
    conversation = {
      id: `conv_${request.senderId}_${request.receiverId}`,
      swapRequestId: request.id,
      participants: [request.senderId, request.receiverId],
      partner: {
        id: senderUser?.id || request.senderId,
        name: senderUser?.name || request.senderName,
        avatar: senderUser?.profile.avatar || request.senderAvatar,
        title: senderUser?.profile.title || 'SkillSwap Partner',
        location: senderUser?.location || request.senderLocation,
        skillsBeingExchanged: {
          partnerTeaches: request.offeredSkill,
          userTeaches: request.requestedSkill
        }
      },
      lastMessage: {
        content: `Swap request accepted! You can now arrange your learning sessions here.`,
        senderId: 'system',
        createdAt: new Date().toISOString()
      },
      unreadCount: 0,
      updatedAt: new Date().toISOString()
    };
    db.conversations.unshift(conversation);

    // Initial system message
    db.messages.push({
      id: `msg_sys_${Date.now()}`,
      conversationId: conversation.id,
      senderId: 'system',
      senderName: 'SkillSwap AI',
      senderAvatar: '/src/assets/images/hero_collaboration_1794059250844.jpg',
      content: `🎉 Congratulations! Your skill exchange partnership is now active between ${request.senderName} (${request.offeredSkill}) and ${request.receiverName} (${request.requestedSkill}). Use this chat to schedule your Google Meet or Zoom sessions!`,
      meeting: null,
      createdAt: new Date().toISOString(),
      read: true
    });
  }

  // Record exchange entry
  const exchangeEntry: ExchangeRecord = {
    id: `exch_${Date.now()}`,
    swapRequestId: request.id,
    partnerId: request.senderId,
    partnerName: request.senderName,
    partnerAvatar: request.senderAvatar,
    skillReceived: request.offeredSkill,
    skillTaught: request.requestedSkill,
    startDate: new Date().toISOString().split('T')[0],
    status: 'Active'
  };
  db.exchanges.unshift(exchangeEntry);

  // Notify sender that their request was accepted
  const notif: NotificationItem = {
    id: `notif_${Date.now()}`,
    userId: request.senderId,
    title: 'Swap Request Accepted! 🎉',
    message: `${request.receiverName} accepted your skill swap request. You can now chat and schedule your learning session.`,
    type: 'swap_accepted',
    link: '/messages',
    read: false,
    createdAt: new Date().toISOString()
  };
  db.notifications.unshift(notif);

  saveDatabase(db);

  // Real-time notification to sender
  broadcastToUser(request.senderId, { type: 'request_accepted', request, conversationId: conversation.id });
  broadcastToUser(request.senderId, { type: 'new_notification', notification: notif });

  res.json({
    message: 'Skill swap request accepted! You can now start communicating.',
    request,
    conversationId: conversation.id
  });
});

app.post('/api/swaps/requests/:id/reject', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const requestId = req.params.id;

  const request = db.swapRequests.find(r => r.id === requestId);
  if (!request) {
    return res.status(404).json({ error: 'Request not found.' });
  }

  if (request.receiverId !== userId) {
    return res.status(403).json({ error: 'Only the recipient of this request can reject it.' });
  }

  if (request.status !== 'Pending') {
    return res.status(400).json({ error: `Cannot reject request with status ${request.status}.` });
  }

  request.status = 'Rejected';
  request.updatedAt = new Date().toISOString();

  const notif: NotificationItem = {
    id: `notif_${Date.now()}`,
    userId: request.senderId,
    title: 'Swap Request Update',
    message: `${request.receiverName} was unable to accept your swap request at this time.`,
    type: 'swap_rejected',
    link: '/requests',
    read: false,
    createdAt: new Date().toISOString()
  };
  db.notifications.unshift(notif);

  saveDatabase(db);

  broadcastToUser(request.senderId, { type: 'request_rejected', request });
  broadcastToUser(request.senderId, { type: 'new_notification', notification: notif });

  res.json({ message: 'Request declined.', request });
});

app.post('/api/swaps/requests/:id/cancel', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const requestId = req.params.id;

  const request = db.swapRequests.find(r => r.id === requestId);
  if (!request) {
    return res.status(404).json({ error: 'Request not found.' });
  }

  if (request.senderId !== userId) {
    return res.status(403).json({ error: 'Only the sender can cancel this request.' });
  }

  if (request.status !== 'Pending') {
    return res.status(400).json({ error: 'Only pending requests can be cancelled.' });
  }

  request.status = 'Cancelled';
  request.updatedAt = new Date().toISOString();
  saveDatabase(db);

  res.json({ message: 'Request cancelled successfully.', request });
});

// 5. Conversations & Real-Time Chat
app.get('/api/conversations', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  const userConversations = db.conversations
    .filter(c => c.participants.includes(userId))
    .map(c => {
      // Find the other participant
      const partnerId = c.participants.find(p => p !== userId) || c.partner.id;
      const partnerUser = db.users.find(u => u.id === partnerId);
      return {
        ...c,
        partner: {
          id: partnerId,
          name: partnerUser?.name || c.partner.name,
          avatar: partnerUser?.profile.avatar || c.partner.avatar,
          title: partnerUser?.profile.title || c.partner.title,
          location: partnerUser?.location || c.partner.location,
          skillsBeingExchanged: c.partner.skillsBeingExchanged
        }
      };
    });

  res.json({ conversations: userConversations });
});

app.get('/api/conversations/:id/messages', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const conversation = db.conversations.find(c => c.id === req.params.id);

  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found.' });
  }

  // Security: Only partners can view messages
  if (!conversation.participants.includes(userId)) {
    return res.status(403).json({ error: 'Access denied. You are not a participant in this conversation.' });
  }

  const messages = db.messages.filter(m => m.conversationId === conversation.id);

  // Mark unread messages sent to this user as read
  messages.forEach(m => {
    if (m.senderId !== userId && !m.read) {
      m.read = true;
    }
  });
  conversation.unreadCount = 0;
  saveDatabase(db);

  res.json({ messages });
});

// Post a new chat message (supports automatic Google Meet / Zoom link detection)
app.post('/api/conversations/:id/messages', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const conversation = db.conversations.find(c => c.id === req.params.id);

  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found.' });
  }

  if (!conversation.participants.includes(user.id)) {
    return res.status(403).json({ error: 'Access denied. You are not a participant in this conversation.' });
  }

  const { content, meeting } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Message content cannot be empty.' });
  }

  // Detect Google Meet or Zoom or YouTube / GitHub URLs in content if meeting not explicitly passed
  let detectedMeeting = meeting || null;
  if (!detectedMeeting) {
    const meetMatch = content.match(/https?:\/\/meet\.google\.com\/[a-z0-9-]+/i);
    const zoomMatch = content.match(/https?:\/\/[\w-]+\.zoom\.us\/j\/[0-9?=&]+/i);

    if (meetMatch) {
      detectedMeeting = {
        provider: 'Google Meet',
        url: meetMatch[0],
        title: 'Google Meet Learning Session'
      };
    } else if (zoomMatch) {
      detectedMeeting = {
        provider: 'Zoom',
        url: zoomMatch[0],
        title: 'Zoom Learning Session'
      };
    }
  }

  const newMessage: Message = {
    id: `msg_${Date.now()}`,
    conversationId: conversation.id,
    senderId: user.id,
    senderName: user.name,
    senderAvatar: user.profile.avatar,
    content: content.trim(),
    meeting: detectedMeeting,
    createdAt: new Date().toISOString(),
    read: false
  };

  db.messages.push(newMessage);
  conversation.lastMessage = {
    content: newMessage.content,
    senderId: user.id,
    createdAt: newMessage.createdAt
  };
  conversation.updatedAt = newMessage.createdAt;

  const partnerId = conversation.participants.find(p => p !== user.id);
  if (partnerId) {
    conversation.unreadCount = (conversation.unreadCount || 0) + 1;
    // Broadcast message to partner
    broadcastToUser(partnerId, {
      type: 'new_message',
      conversationId: conversation.id,
      message: newMessage
    });
  }

  saveDatabase(db);

  res.status(201).json({ message: newMessage });
});

// 6. Gemini-Powered AI Skill Assistant APIs
app.post('/api/ai/chat', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { prompt, conversationHistory = [] } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  // Build personalized context from authenticated user profile
  const userContext = `
The user asking you questions is authenticated on SkillSwap AI:
- Name: ${user.name}
- Current Skills They Teach: ${user.profile.skillsToTeach.map(s => `${s.name} (${s.level}, ${s.category})`).join(', ') || 'None listed yet'}
- Skills They Want to Learn: ${user.profile.skillsToLearn.join(', ') || 'Open to recommendations'}
- Current Availability: ${user.profile.availability || 'Evenings'}
- Learning Goals: ${user.profile.learningGoals || 'General skill development'}
`;

  const systemInstruction = `
You are the "SkillSwap AI Assistant", an expert skill coach, learning architect, and peer-exchange matchmaker for the SkillSwap AI platform.
The core philosophy of SkillSwap AI is: "Share Your Skills. Learn Something New. Grow Together." (No payments, only mutual knowledge exchange).

Your capabilities include:
1. Skill Recommendations: Suggest high-impact complementary skills based on what the user already knows and wants to learn.
2. Learning Roadmaps: Generate clear, structured learning roadmaps with:
   - Phase 1: Beginner foundations (core concepts, syntax, mental models)
   - Phase 2: Intermediate application (real-world patterns, tools, libraries)
   - Phase 3: Advanced mastery (system design, edge cases, production polish)
   - Practical Practice Exercises
   - Portfolio Project Suggestions
3. Skill Exchange Guidance: Help users understand which of their own skills are most in-demand to offer, and what type of exchange partner they should look for.
4. Skill Matching Suggestions: Point users to specific skill categories on SkillSwap AI (${SKILL_CATEGORIES.join(', ')}) and recommend search keywords.
5. Educational Resources: Recommend reputable official documentation, free interactive tutorials, and open-source materials (do not hallucinate fake URLs).
6. Project Ideas: Concrete, hands-on project concepts they can build collaboratively with a swap partner.

Formatting Instructions:
- Use clean Markdown with headers (###), bullet points, and bold text.
- Be encouraging, practical, insightful, and structured.
- Always tie advice back to how they can collaborate with a peer exchange partner on SkillSwap AI.
`;

  try {
    if (aiClient) {
      // Build conversation contents
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      // Add system/profile context into the first turn
      contents.push({
        role: 'user',
        parts: [{ text: `[System Context for SkillSwap AI User]:\n${userContext}\n\nPlease keep this context in mind as our session begins.` }]
      });
      contents.push({
        role: 'model',
        parts: [{ text: `Understood! I'm your SkillSwap AI Assistant. I have your profile details in mind and I'm ready to help you plan roadmaps, discover skill exchange partners, and master new skills!` }]
      });

      // Include previous history
      conversationHistory.slice(-6).forEach((turn: { role: 'user' | 'assistant'; content: string }) => {
        contents.push({
          role: turn.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: turn.content }]
        });
      });

      // Append current user prompt
      contents.push({
        role: 'user',
        parts: [{ text: prompt }]
      });

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction
        }
      });

      const replyText = response.text || 'I apologize, but I could not generate a response at this time. Please try asking again.';

      // Save to AI chat history
      db.aiHistory.push({
        userId: user.id,
        role: 'user',
        content: prompt,
        timestamp: new Date().toISOString()
      });
      db.aiHistory.push({
        userId: user.id,
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toISOString()
      });
      saveDatabase(db);

      return res.json({ reply: replyText });
    } else {
      // Helpful fallback response when GEMINI_API_KEY is not configured
      const fallbackReply = `### SkillSwap AI Guidance for ${user.name}

Thank you for your question! Here is a personalized recommendation based on your profile:

**Your Profile Focus:**
- You offer: **${user.profile.skillsToTeach.map(s => s.name).join(', ') || 'Skills listed on your profile'}**
- You want to learn: **${user.profile.skillsToLearn.join(', ') || 'New technologies'}**

**Recommended Action Steps:**
1. **Find a Partner:** Head over to **Browse Skills** and filter by categories like *${SKILL_CATEGORIES[0]}* or *${SKILL_CATEGORIES[4]}*.
2. **Propose a Mutual Swap:** Send a personalized swap request detailing the 1-on-1 sessions you can host via Google Meet.
3. **Structured Learning Roadmap:**
   - **Week 1-2:** Foundational concepts and peer review.
   - **Week 3-4:** Pair-programming on a joint project.
   - **Week 5:** Milestone review and exchanging constructive feedback.

*(Tip: To enable live dynamic Gemini 3.8 Flash answers, configure the GEMINI_API_KEY in the environment or Secrets panel.)*`;

      return res.json({ reply: fallbackReply });
    }
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({
      error: 'Failed to communicate with AI Assistant service. Please try again in a moment.',
      details: error?.message || 'Unknown error'
    });
  }
});

// 7. Notifications APIs
app.get('/api/notifications', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const userNotifs = db.notifications.filter(n => n.userId === userId);
  res.json({ notifications: userNotifs });
});

app.put('/api/notifications/read-all', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  db.notifications.forEach(n => {
    if (n.userId === userId) n.read = true;
  });
  saveDatabase(db);
  res.json({ message: 'All notifications marked as read.' });
});

// 8. Exchange History APIs
app.get('/api/exchanges', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const userExchanges = db.exchanges.filter(e => {
    const swapReq = db.swapRequests.find(r => r.id === e.swapRequestId);
    return swapReq && (swapReq.senderId === userId || swapReq.receiverId === userId);
  });
  res.json({ exchanges: userExchanges });
});

app.put('/api/exchanges/:id/complete', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const exchange = db.exchanges.find(e => e.id === req.params.id);

  if (!exchange) {
    return res.status(404).json({ error: 'Exchange record not found.' });
  }

  const { rating, review } = req.body;
  exchange.status = 'Completed';
  exchange.completionDate = new Date().toISOString().split('T')[0];
  if (rating) exchange.rating = rating;
  if (review) exchange.review = review;

  // Increment completed exchange counter for the current user
  const user = db.users.find(u => u.id === userId);
  if (user && user.profile) {
    user.profile.exchangesCompleted = (user.profile.exchangesCompleted || 0) + 1;
  }

  saveDatabase(db);
  res.json({ message: 'Skill exchange marked as completed! Feedback recorded.', exchange });
});

// 9. Dashboard Statistics API
app.get('/api/stats', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const user = req.user!;

  const sentRequests = db.swapRequests.filter(r => r.senderId === userId);
  const receivedRequests = db.swapRequests.filter(r => r.receiverId === userId);
  const acceptedExchanges = db.swapRequests.filter(r => (r.senderId === userId || r.receiverId === userId) && r.status === 'Accepted');
  const userConversations = db.conversations.filter(c => c.participants.includes(userId));
  const unreadMessages = userConversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  // Smart Skill Matching Suggestions:
  // Match other users who can teach what the current user wants to learn,
  // OR who want to learn what the current user can teach!
  const teachSkills = user.profile.skillsToTeach.map(s => s.name.toLowerCase());
  const learnSkills = user.profile.skillsToLearn.map(s => s.toLowerCase());

  const smartMatches = db.users
    .filter(u => u.id !== userId)
    .map(u => {
      let matchScore = 0;
      const matchingOffers: string[] = [];
      const matchingWants: string[] = [];

      u.profile.skillsToTeach.forEach(s => {
        if (learnSkills.some(ls => ls.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(ls))) {
          matchScore += 2;
          matchingOffers.push(s.name);
        }
      });

      u.profile.skillsToLearn.forEach(wanted => {
        if (teachSkills.some(ts => ts.includes(wanted.toLowerCase()) || wanted.toLowerCase().includes(ts))) {
          matchScore += 2;
          matchingWants.push(wanted);
        }
      });

      return {
        user: sanitizeUserForPublic(u, userId),
        matchScore,
        matchingOffers,
        matchingWants,
        reason: matchingOffers.length > 0 && matchingWants.length > 0
          ? `Mutual Match: They teach ${matchingOffers[0]} and want to learn ${matchingWants[0]}`
          : matchingOffers.length > 0
          ? `They offer ${matchingOffers[0]} which you want to learn`
          : `Potential peer exchange in ${u.location}`
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 4);

  res.json({
    stats: {
      skillsOffered: user.profile.skillsToTeach.length,
      skillsWanted: user.profile.skillsToLearn.length,
      sentRequestsCount: sentRequests.length,
      receivedRequestsCount: receivedRequests.length,
      acceptedExchangesCount: acceptedExchanges.length,
      unreadMessagesCount: unreadMessages,
      exchangesCompletedCount: user.profile.exchangesCompleted || 0
    },
    recentRequests: db.swapRequests
      .filter(r => r.senderId === userId || r.receiverId === userId)
      .slice(0, 4),
    smartMatches
  });
});

// 10. Settings & Password Change
app.put('/api/settings/password', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required.' });
  }

  const userRecord = db.users.find(u => u.id === user.id);
  if (!userRecord || !userRecord.passwordHash) {
    return res.status(400).json({ error: 'User record issue.' });
  }

  const valid = bcrypt.compareSync(currentPassword, userRecord.passwordHash);
  if (!valid) {
    return res.status(400).json({ error: 'Incorrect current password.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
  }

  userRecord.passwordHash = bcrypt.hashSync(newPassword, 10);
  saveDatabase(db);

  res.json({ message: 'Password updated successfully.' });
});

// --- Frontend Dev Server / Production Serving ---
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Vite Dev Server middleware mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`SkillSwap AI Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});

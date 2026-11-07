export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export type SwapStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Cancelled' | 'Completed';

export interface UserSkill {
  id: string;
  name: string;
  category: string;
  level: SkillLevel;
  experienceYears?: number;
  description?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  location: string;
  bio: string;
  title: string;
  skillsToTeach: UserSkill[];
  skillsToLearn: string[];
  experience: string;
  education: string;
  interests: string[];
  availability: string;
  learningGoals: string;
  joinedDate: string;
  rating?: number;
  exchangesCompleted?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  location: string;
  profile: UserProfile;
  role?: string;
  createdAt: string;
}

export interface SwapRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderLocation: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar: string;
  receiverLocation: string;
  offeredSkill: string;
  requestedSkill: string;
  message: string;
  status: SwapStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingInfo {
  provider: 'Google Meet' | 'Zoom' | 'Custom';
  url: string;
  title?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  meeting?: MeetingInfo | null;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  swapRequestId?: string;
  participants: string[]; // user ids
  partner: {
    id: string;
    name: string;
    avatar: string;
    title: string;
    location: string;
    skillsBeingExchanged: {
      partnerTeaches: string;
      userTeaches: string;
    };
  };
  lastMessage?: {
    content: string;
    senderId: string;
    createdAt: string;
  };
  unreadCount: number;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'swap_request' | 'swap_accepted' | 'swap_rejected' | 'message' | 'system';
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface ExchangeRecord {
  id: string;
  swapRequestId: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  skillReceived: string;
  skillTaught: string;
  startDate: string;
  completionDate?: string;
  status: 'Active' | 'Completed';
  rating?: number;
  review?: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

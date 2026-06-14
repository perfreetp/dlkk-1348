export interface Character {
  id: string;
  name: string;
  avatar: string;
  personality: string;
  tone: 'friendly' | 'formal' | 'humorous' | 'cold' | 'cute';
  memoryEnabled: boolean;
  description: string;
  tags: string[];
  createdAt: string;
  chatCount: number;
  followerCount: number;
}

export interface Message {
  id: string;
  roomId?: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  isAI: boolean;
  isCollected?: boolean;
  isHighlighted?: boolean;
  type: 'text' | 'topic' | 'system' | 'vote';
}

export interface ChatSession {
  id: string;
  targetId: string;
  targetName: string;
  targetAvatar: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  isAI: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
}

export interface Room {
  id: string;
  name: string;
  cover: string;
  description: string;
  participants: Character[];
  participantCount: number;
  spectatorCount: number;
  autoFrequency: 'low' | 'medium' | 'high';
  topics: string[];
  currentTopic?: string;
  status: 'active' | 'paused';
  createdAt: string;
  isHot?: boolean;
  isOwner?: boolean;
  phase?: 'discussing' | 'voting';
  topicDuration?: number;
  topicStartTime?: number;
  voteOptions?: string[];
  voteResults?: Record<string, number>;
  readPosition?: number;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  category: string;
  heat: number;
  icon: string;
}

export interface RelationNode {
  id: string;
  name: string;
  avatar: string;
  relation: string;
}

export interface ForbiddenWord {
  id: string;
  word: string;
  createdAt: string;
}

export interface ReportItem {
  id: string;
  targetId: string;
  targetName: string;
  targetAvatar: string;
  reason: string;
  messageContent?: string;
  createdAt: string;
}

export interface ToneOption {
  value: Character['tone'];
  label: string;
  description: string;
}

export const TONE_OPTIONS: ToneOption[] = [
  { value: 'friendly', label: '友好亲切', description: '温暖友善，像朋友一样聊天' },
  { value: 'formal', label: '正式严谨', description: '专业正式，用词考究' },
  { value: 'humorous', label: '幽默风趣', description: '诙谐有趣，自带笑点' },
  { value: 'cold', label: '高冷傲娇', description: '话少冷淡，有距离感' },
  { value: 'cute', label: '软萌可爱', description: '嗲气卖萌，超级治愈' }
];

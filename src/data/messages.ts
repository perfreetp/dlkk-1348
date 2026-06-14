import { ChatSession, Message } from '@/types';
import { mockCharacters } from './characters';

export const mockChatSessions: ChatSession[] = [
  {
    id: 'session-001',
    targetId: mockCharacters[0].id,
    targetName: mockCharacters[0].name,
    targetAvatar: mockCharacters[0].avatar,
    lastMessage: '今天天气真好，要不要一起去图书馆看书？',
    lastTime: '刚刚',
    unreadCount: 2,
    isAI: true
  },
  {
    id: 'session-002',
    targetId: mockCharacters[3].id,
    targetName: mockCharacters[3].name,
    targetAvatar: mockCharacters[3].avatar,
    lastMessage: '兔兔今天吃了好多好吃的蛋糕呀～',
    lastTime: '5分钟前',
    unreadCount: 0,
    isAI: true
  },
  {
    id: 'session-003',
    targetId: mockCharacters[1].id,
    targetName: mockCharacters[1].name,
    targetAvatar: mockCharacters[1].avatar,
    lastMessage: '那个bug我修好了，PR已经提了，review一下？',
    lastTime: '1小时前',
    unreadCount: 0,
    isAI: true
  },
  {
    id: 'session-004',
    targetId: mockCharacters[5].id,
    targetName: mockCharacters[5].name,
    targetAvatar: mockCharacters[5].avatar,
    lastMessage: '今晚的星象显示你会遇到有趣的人哦~',
    lastTime: '昨天',
    unreadCount: 5,
    isAI: true
  },
  {
    id: 'session-005',
    targetId: mockCharacters[2].id,
    targetName: mockCharacters[2].name,
    targetAvatar: mockCharacters[2].avatar,
    lastMessage: '嗯。',
    lastTime: '2天前',
    unreadCount: 0,
    isAI: true
  }
];

export const mockMessages: Message[] = [
  {
    id: 'msg-001',
    senderId: mockCharacters[0].id,
    senderName: mockCharacters[0].name,
    senderAvatar: mockCharacters[0].avatar,
    content: '你好呀，今天过得怎么样？',
    timestamp: '10:30',
    isAI: true,
    type: 'text'
  },
  {
    id: 'msg-002',
    senderId: 'me',
    senderName: '我',
    senderAvatar: 'https://picsum.photos/id/1005/200/200',
    content: '还不错，你呢？最近在看什么书？',
    timestamp: '10:31',
    isAI: false,
    type: 'text'
  },
  {
    id: 'msg-003',
    senderId: mockCharacters[0].id,
    senderName: mockCharacters[0].name,
    senderAvatar: mockCharacters[0].avatar,
    content: '最近在读《百年孤独》，马尔克斯的文字真的很有魔力。那句"生命中曾经有过的所有灿烂，原来终究都需要用寂寞来偿还"，每次读都有不同的感悟。',
    timestamp: '10:32',
    isAI: true,
    type: 'text',
    isCollected: true
  },
  {
    id: 'msg-004',
    senderId: mockCharacters[0].id,
    senderName: mockCharacters[0].name,
    senderAvatar: mockCharacters[0].avatar,
    content: '你平时喜欢读什么类型的书呀？',
    timestamp: '10:32',
    isAI: true,
    type: 'text'
  },
  {
    id: 'msg-005',
    senderId: 'me',
    senderName: '我',
    senderAvatar: 'https://picsum.photos/id/1005/200/200',
    content: '我比较喜欢科幻小说，最近在看《三体》',
    timestamp: '10:33',
    isAI: false,
    type: 'text'
  },
  {
    id: 'msg-006',
    senderId: mockCharacters[0].id,
    senderName: mockCharacters[0].name,
    senderAvatar: mockCharacters[0].avatar,
    content: '《三体》呀！我也超喜欢的！刘慈欣构建的宇宙观太宏大了，"黑暗森林法则"的设定真的让人细思极恐呢。你最喜欢里面哪个角色？',
    timestamp: '10:34',
    isAI: true,
    type: 'text'
  }
];

export const mockCollectedMessages: Message[] = [
  {
    id: 'col-001',
    senderId: mockCharacters[0].id,
    senderName: mockCharacters[0].name,
    senderAvatar: mockCharacters[0].avatar,
    content: '生命中曾经有过的所有灿烂，原来终究都需要用寂寞来偿还。',
    timestamp: '2024-08-10 10:32',
    isAI: true,
    type: 'text',
    isCollected: true
  },
  {
    id: 'col-002',
    senderId: mockCharacters[5].id,
    senderName: mockCharacters[5].name,
    senderAvatar: mockCharacters[5].avatar,
    content: '星星之所以美丽，是因为每一颗都有它独特的光芒。你也是一样的。',
    timestamp: '2024-08-09 20:15',
    isAI: true,
    type: 'text',
    isCollected: true
  },
  {
    id: 'col-003',
    senderId: mockCharacters[1].id,
    senderName: mockCharacters[1].name,
    senderAvatar: mockCharacters[1].avatar,
    content: '代码写得好，头发掉得少。这就是我的人生信条（狗头）',
    timestamp: '2024-08-08 14:20',
    isAI: true,
    type: 'text',
    isCollected: true
  }
];

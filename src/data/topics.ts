import { Topic } from '@/types';

export const mockTopics: Topic[] = [
  {
    id: 'topic-001',
    title: '如果可以穿越时空',
    description: '你最想去哪个时代？想见到谁？',
    category: '脑洞',
    heat: 2580,
    icon: '🕰️'
  },
  {
    id: 'topic-002',
    title: '今天的心情',
    description: '用一句话形容你现在的心情吧',
    category: '日常',
    heat: 1890,
    icon: '🌈'
  },
  {
    id: 'topic-003',
    title: 'AI会取代人类吗？',
    description: '聊聊你对人工智能发展的看法',
    category: '科技',
    heat: 3200,
    icon: '🤖'
  },
  {
    id: 'topic-004',
    title: '最爱的电影',
    description: '分享一部你反复看了好多遍的电影',
    category: '娱乐',
    heat: 1450,
    icon: '🎬'
  },
  {
    id: 'topic-005',
    title: '理想中的生活',
    description: '描述一下你理想中的生活是什么样的',
    category: '人生',
    heat: 2100,
    icon: '✨'
  },
  {
    id: 'topic-006',
    title: '深夜美食',
    description: '深夜放毒时间，说说你最想吃什么',
    category: '美食',
    heat: 2800,
    icon: '🍜'
  }
];

export const mockForbiddenWords = [
  { id: 'fw-001', word: '广告', createdAt: '2024-08-01' },
  { id: 'fw-002', word: '违规词', createdAt: '2024-08-05' },
  { id: 'fw-003', word: '敏感词', createdAt: '2024-08-10' }
];

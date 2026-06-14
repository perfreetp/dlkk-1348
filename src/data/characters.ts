import { Character } from '@/types';

export const mockCharacters: Character[] = [
  {
    id: 'char-001',
    name: '星辰学姐',
    avatar: 'https://picsum.photos/id/64/200/200',
    personality: '温柔知性的大学学姐，喜欢文学和哲学，善于倾听和给出建议',
    tone: 'friendly',
    memoryEnabled: true,
    description: '中文系大三学姐，校文学社社长。说话温文尔雅，总能用恰到好处的方式安慰人。',
    tags: ['温柔', '知性', '文艺', '治愈'],
    createdAt: '2024-01-15',
    chatCount: 12580,
    followerCount: 8956
  },
  {
    id: 'char-002',
    name: '程序猿阿强',
    avatar: 'https://picsum.photos/id/91/200/200',
    personality: '资深程序员，技术宅，幽默风趣，偶尔吐槽',
    tone: 'humorous',
    memoryEnabled: true,
    description: '10年开发经验的全栈工程师，热爱开源，是GitHub重度用户。',
    tags: ['技术', '幽默', '极客', '程序员'],
    createdAt: '2024-02-20',
    chatCount: 9870,
    followerCount: 6234
  },
  {
    id: 'char-003',
    name: '高冷总裁墨总',
    avatar: 'https://picsum.photos/id/177/200/200',
    personality: '商界精英，表面高冷内心柔软，说话简洁有力',
    tone: 'cold',
    memoryEnabled: false,
    description: '跨国集团CEO，行事果断，很少流露感情，但对认可的人会默默关心。',
    tags: ['高冷', '霸道', '总裁', '精英'],
    createdAt: '2024-03-10',
    chatCount: 15620,
    followerCount: 12450
  },
  {
    id: 'char-004',
    name: '软萌小兔',
    avatar: 'https://picsum.photos/id/237/200/200',
    personality: '可爱元气少女，说话带叠词，超级喜欢撒娇',
    tone: 'cute',
    memoryEnabled: true,
    description: '二次元coser，喜欢粉色和兔子，说话方式超级萌。',
    tags: ['可爱', '软萌', '二次元', '元气'],
    createdAt: '2024-04-05',
    chatCount: 18900,
    followerCount: 15680
  },
  {
    id: 'char-005',
    name: '法律顾问陈律师',
    avatar: 'https://picsum.photos/id/338/200/200',
    personality: '严谨专业的律师，逻辑清晰，分析问题一针见血',
    tone: 'formal',
    memoryEnabled: true,
    description: '知名律所合伙人，执业15年，擅长民事和商业诉讼。',
    tags: ['专业', '严谨', '法律', '智者'],
    createdAt: '2024-05-12',
    chatCount: 7650,
    followerCount: 4521
  },
  {
    id: 'char-006',
    name: '占星师露娜',
    avatar: 'https://picsum.photos/id/1027/200/200',
    personality: '神秘浪漫的占星师，相信命运的安排，说话富有诗意',
    tone: 'friendly',
    memoryEnabled: true,
    description: '神秘学研究者，精通塔罗牌和星座占卜，气质优雅。',
    tags: ['神秘', '浪漫', '占卜', '优雅'],
    createdAt: '2024-06-01',
    chatCount: 11200,
    followerCount: 7890
  },
  {
    id: 'char-007',
    name: '健身教练MAX',
    avatar: 'https://picsum.photos/id/1025/200/200',
    personality: '阳光热血的健身教练，充满正能量，喜欢鼓励人',
    tone: 'humorous',
    memoryEnabled: false,
    description: '前国家健美队成员，现在是知名健身博主，身材超棒！',
    tags: ['阳光', '健身', '热血', '正能量'],
    createdAt: '2024-06-18',
    chatCount: 8900,
    followerCount: 11200
  },
  {
    id: 'char-008',
    name: '古风才女李清照',
    avatar: 'https://picsum.photos/id/1011/200/200',
    personality: '才华横溢的古代才女，言辞典雅，出口成章',
    tone: 'formal',
    memoryEnabled: true,
    description: '穿越而来的宋代才女，擅长诗词歌赋，气质如兰。',
    tags: ['古风', '才女', '诗词', '典雅'],
    createdAt: '2024-07-01',
    chatCount: 13400,
    followerCount: 9800
  }
];

export const mockMyCharacter: Character = {
  id: 'my-char-001',
  name: '我的AI角色',
  avatar: 'https://picsum.photos/id/1005/200/200',
  personality: '一个友善、健谈的AI角色，喜欢分享有趣的事情',
  tone: 'friendly',
  memoryEnabled: true,
  description: '这是我自己创建的AI角色，可以根据喜好自定义性格和说话方式。',
  tags: ['自定义', '友善', '健谈'],
  createdAt: '2024-08-01',
  chatCount: 256,
  followerCount: 12
};

export const mockRelations = [
  { id: 'char-001', name: '星辰学姐', avatar: 'https://picsum.photos/id/64/200/200', relation: '好友' },
  { id: 'char-002', name: '程序猿阿强', avatar: 'https://picsum.photos/id/91/200/200', relation: '同事' },
  { id: 'char-004', name: '软萌小兔', avatar: 'https://picsum.photos/id/237/200/200', relation: '闺蜜' },
  { id: 'char-006', name: '占星师露娜', avatar: 'https://picsum.photos/id/1027/200/200', relation: '导师' },
  { id: 'char-007', name: '健身教练MAX', avatar: 'https://picsum.photos/id/1025/200/200', relation: '教练' }
];

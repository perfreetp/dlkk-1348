import { create } from 'zustand';
import { Character, Message, ChatSession, Room, ReportItem } from '@/types';
import { mockMyCharacter } from '@/data/characters';
import { mockRooms } from '@/data/rooms';
import { mockChatSessions, mockMessages, mockCollectedMessages } from '@/data/messages';
import Taro from '@tarojs/taro';

const STORAGE_KEY = 'ai_chat_app_state_v3';

interface PersistedState {
  myCharacter: Character;
  collectedMessages: Message[];
  blockedUsers: string[];
  forbiddenWords: string[];
  rooms: Room[];
  chatSessions: ChatSession[];
  messagesMap: Record<string, Message[]>;
  roomMessagesMap: Record<string, Message[]>;
  roomReadPositions: Record<string, number>;
  reports: ReportItem[];
}

const loadPersisted = (): Partial<PersistedState> => {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as Partial<PersistedState>;
    }
  } catch (e) {
    console.warn('load state failed', e);
  }
  return {};
};

const persisted = loadPersisted();

const buildInitialMessagesMap = (): Record<string, Message[]> => {
  const map: Record<string, Message[]> = {};
  mockChatSessions.forEach((s) => {
    map[s.targetId] = mockMessages.map((m) => ({
      ...m,
      id: `${m.id}-${s.targetId}`,
      senderId: m.isAI ? s.targetId : 'me',
      senderName: m.isAI ? s.targetName : '我',
      senderAvatar: m.isAI ? s.targetAvatar : mockMyCharacter.avatar,
      isCollected: m.isCollected
    }));
  });
  return map;
};

interface AppState extends PersistedState {
  currentChatSession: ChatSession | null;
  currentRoom: Room | null;

  setMyCharacter: (char: Character) => void;

  toggleCollectMessage: (msg: Message) => void;
  batchUncollect: (msgIds: string[]) => void;

  addForbiddenWord: (word: string) => void;
  removeForbiddenWord: (word: string) => void;

  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;

  addReport: (report: Omit<ReportItem, 'id' | 'createdAt'>) => void;

  setCurrentChatSession: (session: ChatSession | null) => void;
  setCurrentRoom: (room: Room | null) => void;

  addRoom: (room: Room) => void;
  updateRoomFrequency: (roomId: string, freq: Room['autoFrequency']) => void;
  toggleRoomStatus: (roomId: string) => void;
  setRoomCurrentTopic: (roomId: string, topic: string) => void;
  setTopicDuration: (roomId: string, minutes: number) => void;
  startVote: (roomId: string, options: string[]) => void;
  castVote: (roomId: string, option: string) => void;
  endVote: (roomId: string) => { winner: string; maxVotes: number };
  setRoomPhase: (roomId: string, phase: Room['phase']) => void;
  getRoomMessages: (roomId: string) => Message[];
  appendRoomMessage: (roomId: string, msg: Message) => void;
  setRoomReadPosition: (roomId: string, index: number) => void;
  getRoomReadPosition: (roomId: string) => number;

  addChatSession: (session: ChatSession) => void;
  appendMessage: (targetId: string, msg: Message) => void;
  getMessagesForTarget: (targetId: string) => Message[];

  pinSession: (targetId: string) => void;
  unpinSession: (targetId: string) => void;
  deleteSession: (targetId: string) => void;
  markSessionUnread: (targetId: string) => void;
  clearUnread: (targetId: string) => void;
  archiveSessions: (targetIds: string[]) => void;
  unarchiveSessions: (targetIds: string[]) => void;
  getSortedSessions: () => ChatSession[];
  getArchivedSessions: () => ChatSession[];

  persist: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  myCharacter: persisted.myCharacter || mockMyCharacter,
  collectedMessages: persisted.collectedMessages || mockCollectedMessages,
  blockedUsers: persisted.blockedUsers || [],
  forbiddenWords: persisted.forbiddenWords || ['广告', '违规词'],
  rooms: persisted.rooms || mockRooms,
  chatSessions: persisted.chatSessions || mockChatSessions,
  messagesMap: persisted.messagesMap || buildInitialMessagesMap(),
  roomMessagesMap: persisted.roomMessagesMap || {},
  roomReadPositions: persisted.roomReadPositions || {},
  reports: persisted.reports || [],
  currentChatSession: null,
  currentRoom: null,

  persist: () => {
    try {
      const {
        myCharacter,
        collectedMessages,
        blockedUsers,
        forbiddenWords,
        rooms,
        chatSessions,
        messagesMap,
        roomMessagesMap,
        roomReadPositions,
        reports
      } = get();
      Taro.setStorageSync(
        STORAGE_KEY,
        JSON.stringify({
          myCharacter,
          collectedMessages,
          blockedUsers,
          forbiddenWords,
          rooms,
          chatSessions,
          messagesMap,
          roomMessagesMap,
          roomReadPositions,
          reports
        })
      );
    } catch (e) {
      console.warn('persist failed', e);
    }
  },

  setMyCharacter: (char) => {
    set({ myCharacter: char });
    get().persist();
  },

  toggleCollectMessage: (msg) => {
    set((state) => {
      const exists = state.collectedMessages.find((m) => m.id === msg.id);
      let newCollected: Message[];
      if (exists) {
        newCollected = state.collectedMessages.filter((m) => m.id !== msg.id);
      } else {
        newCollected = [...state.collectedMessages, { ...msg, isCollected: true }];
      }
      const newMessagesMap = { ...state.messagesMap };
      Object.keys(newMessagesMap).forEach((targetId) => {
        newMessagesMap[targetId] = newMessagesMap[targetId].map((m) =>
          m.id === msg.id ? { ...m, isCollected: !exists } : m
        );
      });
      const newRoomMessagesMap = { ...state.roomMessagesMap };
      Object.keys(newRoomMessagesMap).forEach((roomId) => {
        newRoomMessagesMap[roomId] = newRoomMessagesMap[roomId].map((m) =>
          m.id === msg.id ? { ...m, isCollected: !exists } : m
        );
      });
      return {
        collectedMessages: newCollected,
        messagesMap: newMessagesMap,
        roomMessagesMap: newRoomMessagesMap
      };
    });
    get().persist();
  },

  batchUncollect: (msgIds) => {
    set((state) => {
      const idSet = new Set(msgIds);
      const newCollected = state.collectedMessages.filter((m) => !idSet.has(m.id));
      const newMessagesMap = { ...state.messagesMap };
      Object.keys(newMessagesMap).forEach((targetId) => {
        newMessagesMap[targetId] = newMessagesMap[targetId].map((m) =>
          idSet.has(m.id) ? { ...m, isCollected: false } : m
        );
      });
      const newRoomMessagesMap = { ...state.roomMessagesMap };
      Object.keys(newRoomMessagesMap).forEach((roomId) => {
        newRoomMessagesMap[roomId] = newRoomMessagesMap[roomId].map((m) =>
          idSet.has(m.id) ? { ...m, isCollected: false } : m
        );
      });
      return {
        collectedMessages: newCollected,
        messagesMap: newMessagesMap,
        roomMessagesMap: newRoomMessagesMap
      };
    });
    get().persist();
  },

  addForbiddenWord: (word) => {
    set((state) => ({ forbiddenWords: [...state.forbiddenWords, word] }));
    get().persist();
  },

  removeForbiddenWord: (word) => {
    set((state) => ({ forbiddenWords: state.forbiddenWords.filter((w) => w !== word) }));
    get().persist();
  },

  blockUser: (userId) => {
    set((state) => {
      if (state.blockedUsers.includes(userId)) return state;
      return { blockedUsers: [...state.blockedUsers, userId] };
    });
    get().persist();
  },

  unblockUser: (userId) => {
    set((state) => ({ blockedUsers: state.blockedUsers.filter((id) => id !== userId) }));
    get().persist();
  },

  addReport: (report) => {
    set((state) => ({
      reports: [
        {
          ...report,
          id: `report-${Date.now()}`,
          createdAt: new Date().toLocaleString()
        },
        ...state.reports
      ]
    }));
    get().persist();
  },

  setCurrentChatSession: (session) => set({ currentChatSession: session }),
  setCurrentRoom: (room) => set({ currentRoom: room }),

  addRoom: (room) => {
    set((state) => ({ rooms: [room, ...state.rooms] }));
    get().persist();
  },

  updateRoomFrequency: (roomId, freq) => {
    set((state) => ({
      rooms: state.rooms.map((r) => (r.id === roomId ? { ...r, autoFrequency: freq } : r))
    }));
    get().persist();
  },

  toggleRoomStatus: (roomId) => {
    set((state) => ({
      rooms: state.rooms.map((r) =>
        r.id === roomId ? { ...r, status: r.status === 'active' ? 'paused' : 'active' } : r
      )
    }));
    get().persist();
  },

  setRoomCurrentTopic: (roomId, topic) => {
    set((state) => ({
      rooms: state.rooms.map((r) =>
        r.id === roomId ? { ...r, currentTopic: topic, topicStartTime: Date.now() } : r
      )
    }));
    get().persist();
  },

  setTopicDuration: (roomId, minutes) => {
    set((state) => ({
      rooms: state.rooms.map((r) => (r.id === roomId ? { ...r, topicDuration: minutes } : r))
    }));
    get().persist();
  },

  startVote: (roomId, options) => {
    const initialResults: Record<string, number> = {};
    options.forEach((opt) => (initialResults[opt] = 0));
    set((state) => ({
      rooms: state.rooms.map((r) =>
        r.id === roomId
          ? { ...r, phase: 'voting', voteOptions: options, voteResults: initialResults }
          : r
      )
    }));
    get().persist();
  },

  castVote: (roomId, option) => {
    set((state) => ({
      rooms: state.rooms.map((r) => {
        if (r.id !== roomId || !r.voteResults) return r;
        return {
          ...r,
          voteResults: {
            ...r.voteResults,
            [option]: (r.voteResults[option] || 0) + 1
          }
        };
      })
    }));
  },

  endVote: (roomId) => {
    let winner = '';
    let maxVotes = 0;
    set((state) => {
      const room = state.rooms.find((r) => r.id === roomId);
      const results = room?.voteResults || {};
      const entries = Object.entries(results).sort((a, b) => b[1] - a[1]);
      winner = entries[0]?.[0] || '';
      maxVotes = entries[0]?.[1] || 0;
      const systemMsg: Message = {
        id: `vote-end-${Date.now()}`,
        roomId,
        senderId: 'system',
        senderName: '系统',
        senderAvatar: '',
        content: `投票结束，下一话题：${winner}`,
        timestamp: new Date().toLocaleTimeString().slice(0, 5),
        isAI: false,
        type: 'system'
      };
      const newRoomMsgs = [...(state.roomMessagesMap[roomId] || []), systemMsg];
      return {
        rooms: state.rooms.map((r) =>
          r.id === roomId
            ? {
                ...r,
                phase: 'discussing',
                currentTopic: winner,
                topicStartTime: Date.now(),
                voteOptions: undefined,
                voteResults: undefined
              }
            : r
        ),
        roomMessagesMap: { ...state.roomMessagesMap, [roomId]: newRoomMsgs }
      };
    });
    get().persist();
    return { winner, maxVotes };
  },

  setRoomPhase: (roomId, phase) => {
    set((state) => ({
      rooms: state.rooms.map((r) => (r.id === roomId ? { ...r, phase } : r))
    }));
    get().persist();
  },

  getRoomMessages: (roomId) => {
    return get().roomMessagesMap[roomId] || [];
  },

  appendRoomMessage: (roomId, msg) => {
    set((state) => {
      const existing = state.roomMessagesMap[roomId] || [];
      return {
        roomMessagesMap: { ...state.roomMessagesMap, [roomId]: [...existing.slice(-100), msg] }
      };
    });
  },

  setRoomReadPosition: (roomId, index) => {
    set((state) => ({
      roomReadPositions: { ...state.roomReadPositions, [roomId]: index }
    }));
    get().persist();
  },

  getRoomReadPosition: (roomId) => {
    return get().roomReadPositions[roomId] || 0;
  },

  addChatSession: (session) => {
    set((state) => {
      const exists = state.chatSessions.find((s) => s.targetId === session.targetId);
      if (exists) return state;
      const hello: Message = {
        id: `hello-${session.targetId}-${Date.now()}`,
        senderId: session.targetId,
        senderName: session.targetName,
        senderAvatar: session.targetAvatar,
        content: `你好呀~ 我是${session.targetName}，很高兴认识你！`,
        timestamp: new Date().toLocaleTimeString().slice(0, 5),
        isAI: true,
        type: 'text'
      };
      return {
        chatSessions: [session, ...state.chatSessions],
        messagesMap: { ...state.messagesMap, [session.targetId]: [hello] }
      };
    });
    get().persist();
  },

  appendMessage: (targetId, msg) => {
    set((state) => {
      const existing = state.messagesMap[targetId] || [];
      const updatedSessions = state.chatSessions.map((s) =>
        s.targetId === targetId
          ? { ...s, lastMessage: msg.content, lastTime: '刚刚' }
          : s
      );
      return {
        messagesMap: { ...state.messagesMap, [targetId]: [...existing, msg] },
        chatSessions: updatedSessions
      };
    });
    get().persist();
  },

  getMessagesForTarget: (targetId) => {
    return get().messagesMap[targetId] || [];
  },

  pinSession: (targetId) => {
    set((state) => ({
      chatSessions: state.chatSessions.map((s) =>
        s.targetId === targetId ? { ...s, isPinned: true } : s
      )
    }));
    get().persist();
  },

  unpinSession: (targetId) => {
    set((state) => ({
      chatSessions: state.chatSessions.map((s) =>
        s.targetId === targetId ? { ...s, isPinned: false } : s
      )
    }));
    get().persist();
  },

  deleteSession: (targetId) => {
    set((state) => {
      const newMap = { ...state.messagesMap };
      delete newMap[targetId];
      const newCollected = state.collectedMessages.filter(
        (m) => state.messagesMap[targetId]?.every((smsg) => smsg.id !== m.id) ?? true
      );
      return {
        chatSessions: state.chatSessions.filter((s) => s.targetId !== targetId),
        messagesMap: newMap,
        collectedMessages: newCollected
      };
    });
    get().persist();
  },

  markSessionUnread: (targetId) => {
    set((state) => ({
      chatSessions: state.chatSessions.map((s) =>
        s.targetId === targetId ? { ...s, unreadCount: s.unreadCount + 1 } : s
      )
    }));
    get().persist();
  },

  clearUnread: (targetId) => {
    set((state) => ({
      chatSessions: state.chatSessions.map((s) =>
        s.targetId === targetId ? { ...s, unreadCount: 0 } : s
      )
    }));
    get().persist();
  },

  archiveSessions: (targetIds) => {
    const idSet = new Set(targetIds);
    set((state) => ({
      chatSessions: state.chatSessions.map((s) =>
        idSet.has(s.targetId) ? { ...s, isArchived: true, isPinned: false } : s
      )
    }));
    get().persist();
  },

  unarchiveSessions: (targetIds) => {
    const idSet = new Set(targetIds);
    set((state) => ({
      chatSessions: state.chatSessions.map((s) =>
        idSet.has(s.targetId) ? { ...s, isArchived: false } : s
      )
    }));
    get().persist();
  },

  getSortedSessions: () => {
    const { chatSessions, blockedUsers } = get();
    const visible = chatSessions.filter(
      (s) => !blockedUsers.includes(s.targetId) && !s.isArchived
    );
    const pinned = visible.filter((s) => s.isPinned);
    const others = visible.filter((s) => !s.isPinned);
    return [...pinned, ...others];
  },

  getArchivedSessions: () => {
    const { chatSessions, blockedUsers } = get();
    return chatSessions.filter(
      (s) => !blockedUsers.includes(s.targetId) && s.isArchived
    );
  }
}));

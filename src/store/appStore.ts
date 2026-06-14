import { create } from 'zustand';
import { Character, Message, ChatSession, Room } from '@/types';
import { mockMyCharacter } from '@/data/characters';

interface AppState {
  myCharacter: Character;
  collectedMessages: Message[];
  blockedUsers: string[];
  forbiddenWords: string[];
  currentChatSession: ChatSession | null;
  currentRoom: Room | null;
  setMyCharacter: (char: Character) => void;
  toggleCollectMessage: (msg: Message) => void;
  addForbiddenWord: (word: string) => void;
  removeForbiddenWord: (word: string) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  setCurrentChatSession: (session: ChatSession | null) => void;
  setCurrentRoom: (room: Room | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  myCharacter: mockMyCharacter,
  collectedMessages: [],
  blockedUsers: [],
  forbiddenWords: ['广告', '违规词'],
  currentChatSession: null,
  currentRoom: null,
  setMyCharacter: (char) => set({ myCharacter: char }),
  toggleCollectMessage: (msg) => set((state) => {
    const exists = state.collectedMessages.find(m => m.id === msg.id);
    if (exists) {
      return { collectedMessages: state.collectedMessages.filter(m => m.id !== msg.id) };
    }
    return { collectedMessages: [...state.collectedMessages, { ...msg, isCollected: true }] };
  }),
  addForbiddenWord: (word) => set((state) => ({
    forbiddenWords: [...state.forbiddenWords, word]
  })),
  removeForbiddenWord: (word) => set((state) => ({
    forbiddenWords: state.forbiddenWords.filter(w => w !== word)
  })),
  blockUser: (userId) => set((state) => ({
    blockedUsers: [...state.blockedUsers, userId]
  })),
  unblockUser: (userId) => set((state) => ({
    blockedUsers: state.blockedUsers.filter(id => id !== userId)
  })),
  setCurrentChatSession: (session) => set({ currentChatSession: session }),
  setCurrentRoom: (room) => set({ currentRoom: room })
}));

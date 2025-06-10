
import { create } from 'zustand';
import type { User } from '@/types'; // Assuming Message type will be defined in types

// Define Message type based on ChatWindow component
interface Message {
  id: string;
  sender: string; // 'me' or user ID/name
  avatar?: string;
  text: string;
  timestamp: Date;
}

interface ChatState {
  isChatWindowOpen: boolean;
  activeChatId: string | null; // For potential future multi-chat support
  messagesByChatId: Record<string, Message[]>;
  toggleChatWindow: () => void;
  openChatWindow: (chatId: string) => void;
  closeChatWindow: () => void;
  addMessage: (chatId: string, message: Message) => void;
  loadInitialMessages: (chatId: string, initialMessages: Message[]) => void;
}

// For the prototype, direct state in components or Jotai atoms might be used initially.
// The prompt mentions Zustand for chat, so this file is a placeholder for that eventual implementation.

export const useAppStore = create<ChatState>((set, get) => ({
  isChatWindowOpen: false,
  activeChatId: null,
  messagesByChatId: {},
  
  toggleChatWindow: () => set((state) => {
    const newIsChatWindowOpen = !state.isChatWindowOpen;
    if (!newIsChatWindowOpen && state.activeChatId) {
      // If closing and there was an active chat, clear its messages
      const newMessagesByChatId = { ...state.messagesByChatId };
      delete newMessagesByChatId[state.activeChatId];
      return { 
        isChatWindowOpen: false, 
        activeChatId: null,
        messagesByChatId: newMessagesByChatId
      };
    }
    return { 
      isChatWindowOpen: newIsChatWindowOpen, 
      activeChatId: newIsChatWindowOpen ? 'geral' : null 
    };
  }),
  
  openChatWindow: (chatId: string) => set({ isChatWindowOpen: true, activeChatId: chatId }),
  
  closeChatWindow: () => set((state) => {
    const currentActiveChatId = get().activeChatId;
    const newMessagesByChatId = { ...state.messagesByChatId };
    if (currentActiveChatId) {
      delete newMessagesByChatId[currentActiveChatId];
    }
    return { 
      isChatWindowOpen: false, 
      activeChatId: null,
      messagesByChatId: newMessagesByChatId
    };
  }),
  
  addMessage: (chatId: string, message: Message) => {
    const currentMessages = get().messagesByChatId[chatId] || [];
    set((state) => ({
      messagesByChatId: {
        ...state.messagesByChatId,
        [chatId]: [...currentMessages, message],
      },
    }));
  },

  loadInitialMessages: (chatId: string, initialMessages: Message[]) => {
     set((state) => ({
      messagesByChatId: {
        ...state.messagesByChatId,
        [chatId]: initialMessages,
      },
    }));
  }
}));

// Auth state (example, might be in a separate store or context in a larger app)
// This part can be removed if auth is handled purely by useAuth hook with localStorage
interface AuthState {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
}

// export const useAuthStore = create<AuthState>((set) => ({
//   currentUser: null,
//   setCurrentUser: (user) => set({ currentUser: user }),
// }));


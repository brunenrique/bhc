
import { create } from 'zustand';
import type { User, ChatMessage, Chat } from '@/types';

// Mock users for chat selection (in a real app, this would come from a user service)
const mockUsersForChatList: Pick<User, 'id' | 'name' | 'avatarUrl'>[] = [
  { id: 'userDraAline', name: 'Dra. Aline S.', avatarUrl: 'https://placehold.co/40x40.png?text=AS' },
  { id: 'userSecretaria', name: 'Secretaria Clínica', avatarUrl: 'https://placehold.co/40x40.png?text=SC' },
  { id: 'userDrBruno', name: 'Dr. Bruno M.', avatarUrl: 'https://placehold.co/40x40.png?text=BM' },
];

interface ChatState {
  isChatSelectorOpen: boolean;
  activeChat: Chat | null;
  messagesByChatId: Record<string, ChatMessage[]>;
  mockUsersForChat: Pick<User, 'id' | 'name' | 'avatarUrl'>[];
  toggleChatSelector: () => void;
  openChat: (chat: Chat) => void;
  closeActiveChat: () => void;
  addMessage: (chatId: string, message: ChatMessage) => void;
  loadInitialMessages: (chatId: string, initialMessages: ChatMessage[]) => void;
}


export const useAppStore = create<ChatState>((set, get) => ({
  isChatSelectorOpen: false,
  activeChat: null,
  messagesByChatId: {},
  mockUsersForChat: mockUsersForChatList,
  
  toggleChatSelector: () => {
    if (get().activeChat) {
      get().closeActiveChat(); // Close active chat window if opening selector
      set({ isChatSelectorOpen: false }); // Ensure selector is closed if a chat was open
    } else {
      set((state) => ({ isChatSelectorOpen: !state.isChatSelectorOpen }));
    }
  },
  
  openChat: (chat: Chat) => {
    set({ activeChat: chat, isChatSelectorOpen: false });
    const existingMessages = get().messagesByChatId[chat.id];
    if (!existingMessages || existingMessages.length === 0) {
      let initialMockMessages: ChatMessage[] = [];
      if (chat.type === 'general') {
        initialMockMessages = [
          { id: 'gm1', sender: 'Sistema', text: `Bem-vindo ao ${chat.name}!`, timestamp: new Date(Date.now() - 1000 * 60 * 10) },
          { id: 'gm2', sender: 'Dra. Aline S.', text: 'Alguém tem atualizações sobre o caso Y?', timestamp: new Date(Date.now() - 1000 * 60 * 5), avatarUrl: 'https://placehold.co/40x40.png?text=AS' },
        ];
      } else {
         initialMockMessages = [
          { id: `pm1-${chat.id}`, sender: 'Sistema', text: `Iniciando chat com ${chat.name}.`, timestamp: new Date(Date.now() - 1000 * 60 * 2) },
        ];
      }
      get().loadInitialMessages(chat.id, initialMockMessages);
    }
  },
  
  closeActiveChat: () => {
    const currentActiveChat = get().activeChat;
    if (currentActiveChat) {
      set((state) => {
        const newMessagesByChatId = { ...state.messagesByChatId };
        delete newMessagesByChatId[currentActiveChat.id]; // Make chat ephemeral
        return {
          activeChat: null,
          isChatSelectorOpen: false, // Also close selector if chat is closed directly
          messagesByChatId: newMessagesByChatId
        };
      });
    }
  },
  
  addMessage: (chatId: string, message: ChatMessage) => {
    set((state) => ({
      messagesByChatId: {
        ...state.messagesByChatId,
        [chatId]: [...(state.messagesByChatId[chatId] || []), message],
      },
    }));
  },

  loadInitialMessages: (chatId: string, initialMessages: ChatMessage[]) => {
     set((state) => ({
      messagesByChatId: {
        ...state.messagesByChatId,
        [chatId]: initialMessages,
      },
    }));
  }
}));

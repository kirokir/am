import { create } from 'zustand';
import { supabase } from './supabase';
import { Socket } from 'socket.io-client';

export interface Message {
  id: number;
  created_at: string;
  chat_id: string;
  user_id: string;
  content: string;
  is_nudge: boolean;
}

export interface Chat {
  id: string;
  chat_type: 'COUPLE' | 'PRIVATE_AI';
  partner?: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
}

interface ChatState {
  socket: Socket | null;
  coupleChat: Chat | null;
  aiChat: Chat | null;
  messages: { [chatId: string]: Message[] };
  setSocket: (socket: Socket) => void;
  initializeChats: (userId: string) => Promise<void>;
  fetchMessages: (chatId: string) => Promise<void>;
  addMessage: (message: Message) => void;
  clearStore: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  socket: null,
  coupleChat: null,
  aiChat: null,
  messages: {},
  setSocket: (socket) => set({ socket }),
  initializeChats: async (userId) => {
    const { data: userChats, error } = await supabase
        .from('chat_participants')
        .select('chats!inner(id, chat_type)')
        .eq('user_id', userId);
    
    if (error) throw error;
    
    const coupleChatData = userChats.find(c => c.chats.chat_type === 'COUPLE')?.chats;
    const aiChatData = userChats.find(c => c.chats.chat_type === 'PRIVATE_AI')?.chats;
    
    if(coupleChatData) {
        // Find partner info
        const { data: partnerData } = await supabase
            .from('chat_participants')
            .select('users!inner(id, full_name, avatar_url)')
            .eq('chat_id', coupleChatData.id)
            .neq('user_id', userId)
            .single();

        set({ coupleChat: { ...coupleChatData, partner: partnerData?.users } });
    }

    if(aiChatData) {
        set({ aiChat: aiChatData });
    }
  },
  fetchMessages: async (chatId) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    set(state => ({
      messages: { ...state.messages, [chatId]: data || [] },
    }));
  },
  addMessage: (message) => {
    set(state => {
      const chatMessages = state.messages[message.chat_id] || [];
      // Avoid duplicates from optimistic update + socket event
      if (chatMessages.some(m => m.id === message.id)) {
        return state;
      }
      return {
        messages: {
          ...state.messages,
          [message.chat_id]: [...chatMessages, message],
        },
      };
    });
  },
  clearStore: () => set({ coupleChat: null, aiChat: null, messages: {} }),
}));
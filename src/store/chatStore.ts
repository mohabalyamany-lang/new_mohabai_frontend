import { create } from "zustand";
import { Message, Conversation } from "@/types/chat";
import { generateId } from "@/lib/utils";

interface ChatState {
  conversations: Conversation[];
  activeConversationId: number | null;
  messages: Record<number, Message[]>;
  isStreaming: boolean;
  streamingContent: string;

  setConversations: (convos: Conversation[]) => void;
  addConversation: (convo: Conversation) => void;
  updateConversation: (id: number, patch: Partial<Conversation>) => void;
  deleteConversation: (id: number) => void;
  setActiveConversation: (id: number | null) => void;

  setMessages: (conversationId: number, messages: Message[]) => void;
  addUserMessage: (conversationId: number, content: string) => string;
  startAssistantMessage: (conversationId: number) => string;
  appendStreamChunk: (conversationId: number, msgId: string, chunk: string) => void;
  finalizeMessage: (conversationId: number, msgId: string) => void;
  setImageMessage: (conversationId: number, msgId: string, imageUrl: string) => void;
  setMessageError: (conversationId: number, msgId: string) => void;

  setIsStreaming: (val: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  isStreaming: false,
  streamingContent: "",

  setConversations: (convos) => set({ conversations: convos }),

  addConversation: (convo) =>
    set((s) => ({ conversations: [convo, ...s.conversations] })),

  updateConversation: (id, patch) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === id ? { ...c, ...patch } : c
      ),
    })),

  deleteConversation: (id) =>
    set((s) => ({
      conversations: s.conversations.filter((c) => c.id !== id),
      messages: Object.fromEntries(
        Object.entries(s.messages).filter(([k]) => Number(k) !== id)
      ),
    })),

  setActiveConversation: (id) => set({ activeConversationId: id }),

  setMessages: (conversationId, messages) =>
    set((s) => ({ messages: { ...s.messages, [conversationId]: messages } })),

  addUserMessage: (conversationId, content) => {
    const id = generateId();
    const msg: Message = {
      id,
      role: "user",
      content,
      created_at: new Date().toISOString(),
    };
    set((s) => ({
      messages: {
        ...s.messages,
        [conversationId]: [...(s.messages[conversationId] ?? []), msg],
      },
    }));
    return id;
  },

  startAssistantMessage: (conversationId) => {
    const id = generateId();
    const msg: Message = {
      id,
      role: "assistant",
      content: "",
      created_at: new Date().toISOString(),
      isStreaming: true,
    };
    set((s) => ({
      messages: {
        ...s.messages,
        [conversationId]: [...(s.messages[conversationId] ?? []), msg],
      },
    }));
    return id;
  },

  appendStreamChunk: (conversationId, msgId, chunk) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [conversationId]: (s.messages[conversationId] ?? []).map((m) =>
          m.id === msgId ? { ...m, content: m.content + chunk } : m
        ),
      },
    })),

  finalizeMessage: (conversationId, msgId) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [conversationId]: (s.messages[conversationId] ?? []).map((m) =>
          m.id === msgId ? { ...m, isStreaming: false } : m
        ),
      },
    })),

  setImageMessage: (conversationId, msgId, imageUrl) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [conversationId]: (s.messages[conversationId] ?? []).map((m) =>
          m.id === msgId ? { ...m, imageUrl, isStreaming: false } : m
        ),
      },
    })),

  setMessageError: (conversationId, msgId) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [conversationId]: (s.messages[conversationId] ?? []).map((m) =>
          m.id === msgId
            ? { ...m, content: "Something went wrong.", isStreaming: false, error: true }
            : m
        ),
      },
    })),

  setIsStreaming: (val) => set({ isStreaming: val }),
}));

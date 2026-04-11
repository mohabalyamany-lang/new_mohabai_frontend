import { create } from "zustand";
import { Message, Conversation } from "@/types/chat";
import { generateId } from "@/lib/utils";

interface ChatState {
  conversations: Conversation[];
  activeConversationId: number | null;

  messages: Record<number, Message[]>;
  loadingConversations: Record<number, boolean>;

  streaming: Record<number, string | null>; // msgId per conversation

  setConversations: (convos: Conversation[]) => void;
  addConversation: (convo: Conversation) => void;
  updateConversation: (id: number, patch: Partial<Conversation>) => void;
  deleteConversation: (id: number) => void;
  setActiveConversation: (id: number | null) => void;

  setMessages: (conversationId: number, messages: Message[]) => void;
  appendMessages: (conversationId: number, messages: Message[]) => void;

  addUserMessage: (conversationId: number, content: string) => string;
  startAssistantMessage: (conversationId: number) => string;

  appendStreamChunk: (conversationId: number, msgId: string, chunk: string) => void;
  finalizeMessage: (conversationId: number, msgId: string) => void;

  setImageMessage: (conversationId: number, msgId: string, imageUrl: string) => void;
  setMessageError: (conversationId: number, msgId: string, error?: string) => void;

  setLoading: (conversationId: number, val: boolean) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,

  messages: {},
  loadingConversations: {},

  streaming: {},

  // -------------------------
  // Conversation
  // -------------------------
  setConversations: (convos) => set({ conversations: convos }),

  addConversation: (convo) =>
    set((s) => ({
      conversations: [convo, ...s.conversations],
    })),

  updateConversation: (id, patch) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === id ? { ...c, ...patch } : c
      ),
    })),

  deleteConversation: (id) =>
    set((s) => {
      const { [id]: _, ...restMessages } = s.messages;
      const { [id]: __, ...restStreaming } = s.streaming;

      return {
        conversations: s.conversations.filter((c) => c.id !== id),
        messages: restMessages,
        streaming: restStreaming,
      };
    }),

  setActiveConversation: (id) => set({ activeConversationId: id }),

  // -------------------------
  // Messages
  // -------------------------
  setMessages: (conversationId, messages) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [conversationId]: dedupeAndSort(messages),
      },
    })),

  appendMessages: (conversationId, newMessages) =>
    set((s) => {
      const existing = s.messages[conversationId] ?? [];
      return {
        messages: {
          ...s.messages,
          [conversationId]: dedupeAndSort([...existing, ...newMessages]),
        },
      };
    }),

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
      streaming: {
        ...s.streaming,
        [conversationId]: id,
      },
    }));

    return id;
  },

  appendStreamChunk: (conversationId, msgId, chunk) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [conversationId]: (s.messages[conversationId] ?? []).map((m) =>
          m.id === msgId
            ? { ...m, content: m.content + chunk }
            : m
        ),
      },
    })),

  finalizeMessage: (conversationId, msgId) =>
    set((s) => {
      const updated = (s.messages[conversationId] ?? []).map((m) =>
        m.id === msgId ? { ...m, isStreaming: false } : m
      );

      const { [conversationId]: _, ...restStreaming } = s.streaming;

      return {
        messages: {
          ...s.messages,
          [conversationId]: updated,
        },
        streaming: restStreaming,
      };
    }),

  setImageMessage: (conversationId, msgId, imageUrl) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [conversationId]: (s.messages[conversationId] ?? []).map((m) =>
          m.id === msgId
            ? { ...m, imageUrl, isStreaming: false }
            : m
        ),
      },
    })),

  setMessageError: (conversationId, msgId, error) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [conversationId]: (s.messages[conversationId] ?? []).map((m) =>
          m.id === msgId
            ? {
                ...m,
                content: m.content || "Failed to generate response.",
                isStreaming: false,
                error: true,
              }
            : m
        ),
      },
    })),

  setLoading: (conversationId, val) =>
    set((s) => ({
      loadingConversations: {
        ...s.loadingConversations,
        [conversationId]: val,
      },
    })),
}));

// -------------------------
// Helpers
// -------------------------
function dedupeAndSort(messages: Message[]): Message[] {
  const map = new Map<string, Message>();

  for (const msg of messages) {
    map.set(msg.id, msg);
  }

  return Array.from(map.values()).sort(
    (a, b) =>
      new Date(a.created_at).getTime() -
      new Date(b.created_at).getTime()
  );
}

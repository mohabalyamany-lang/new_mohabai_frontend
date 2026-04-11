import { create } from "zustand";
import { Message, Conversation } from "@/types/chat";
import { generateId } from "@/lib/utils";

interface ChatState {
  conversations: Conversation[];
  activeConversationId: number | null;

  messagesById: Record<string, Message>;
  conversationMessages: Record<number, string[]>;

  isStreaming: boolean;
  streamingMessageId: string | null;

  setConversations: (convos: Conversation[]) => void;
  addConversation: (convo: Conversation) => void;
  updateConversation: (id: number, patch: Partial<Conversation>) => void;
  deleteConversation: (id: number) => void;
  setActiveConversation: (id: number | null) => void;

  setMessages: (conversationId: number, messages: Message[]) => void;

  addUserMessage: (conversationId: number, content: string) => string;
  startAssistantMessage: (conversationId: number) => string;

  appendStreamChunk: (msgId: string, chunk: string) => void;
  finalizeMessage: (msgId: string) => void;
  setImageMessage: (msgId: string, url: string) => void;
  setMessageError: (msgId: string) => void;

  setIsStreaming: (val: boolean, msgId?: string | null) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,

  messagesById: {},
  conversationMessages: {},

  isStreaming: false,
  streamingMessageId: null,

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
    set((s) => {
      const newConvMsgs = { ...s.conversationMessages };
      delete newConvMsgs[id];
      return {
        conversations: s.conversations.filter((c) => c.id !== id),
        conversationMessages: newConvMsgs,
      };
    }),

  setActiveConversation: (id) => set({ activeConversationId: id }),

  setMessages: (conversationId, messages) =>
    set((s) => {
      const byId = { ...s.messagesById };
      const ids: string[] = [];

      for (const m of messages) {
        byId[m.id] = m;
        ids.push(m.id);
      }

      return {
        messagesById: byId,
        conversationMessages: {
          ...s.conversationMessages,
          [conversationId]: ids,
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
      messagesById: { ...s.messagesById, [id]: msg },
      conversationMessages: {
        ...s.conversationMessages,
        [conversationId]: [
          ...(s.conversationMessages[conversationId] ?? []),
          id,
        ],
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
      messagesById: { ...s.messagesById, [id]: msg },
      conversationMessages: {
        ...s.conversationMessages,
        [conversationId]: [
          ...(s.conversationMessages[conversationId] ?? []),
          id,
        ],
      },
      streamingMessageId: id,
    }));

    return id;
  },

  appendStreamChunk: (msgId, chunk) =>
    set((s) => ({
      messagesById: {
        ...s.messagesById,
        [msgId]: {
          ...s.messagesById[msgId],
          content: s.messagesById[msgId].content + chunk,
        },
      },
    })),

  finalizeMessage: (msgId) =>
    set((s) => ({
      messagesById: {
        ...s.messagesById,
        [msgId]: {
          ...s.messagesById[msgId],
          isStreaming: false,
        },
      },
      streamingMessageId: null,
    })),

  setImageMessage: (msgId, url) =>
    set((s) => ({
      messagesById: {
        ...s.messagesById,
        [msgId]: {
          ...s.messagesById[msgId],
          imageUrl: url,
          isStreaming: false,
        },
      },
    })),

  setMessageError: (msgId) =>
    set((s) => ({
      messagesById: {
        ...s.messagesById,
        [msgId]: {
          ...s.messagesById[msgId],
          content: "Something went wrong.",
          isStreaming: false,
          error: true,
        },
      },
    })),

  setIsStreaming: (val, msgId = null) =>
    set({ isStreaming: val, streamingMessageId: msgId }),
}));

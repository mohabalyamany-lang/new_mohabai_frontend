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

  // Deduplication tracking
  currentTurnId: string | null;
  processedChunkKeys: Set<string>;

  setConversations: (convos: Conversation[]) => void;
  addConversation: (convo: Conversation) => void;
  updateConversation: (id: number, patch: Partial<Conversation>) => void;
  deleteConversation: (id: number) => void;
  setActiveConversation: (id: number | null) => void;

  setMessages: (conversationId: number, messages: Message[]) => void;

  addUserMessage: (conversationId: number, content: string) => string;
  startAssistantMessage: (conversationId: number) => string;

  // Turn-aware streaming
  setCurrentTurnId: (turnId: string | null) => void;
  appendStreamChunk: (msgId: string, chunk: string, chunkIndex?: number) => void;
  finalizeMessage: (msgId: string) => void;
  setImageMessage: (msgId: string, url: string) => void;
  setMessageError: (msgId: string) => void;

  setIsStreaming: (val: boolean, msgId?: string | null) => void;

  // Reset dedup state on new conversation
  resetTurnState: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,

  messagesById: {},
  conversationMessages: {},

  isStreaming: false,
  streamingMessageId: null,

  // Deduplication
  currentTurnId: null,
  processedChunkKeys: new Set(),

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

  setActiveConversation: (id) => {
    set({
      activeConversationId: id,
      currentTurnId: null,
      processedChunkKeys: new Set(),
    });
  },

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

  setCurrentTurnId: (turnId) =>
    set({
      currentTurnId: turnId,
      processedChunkKeys: new Set(),
    }),

  appendStreamChunk: (msgId, chunk, chunkIndex) =>
    set((s) => {
      // Deduplication: skip if we've seen this exact chunk for this message
      const dedupKey = `${msgId}:${chunkIndex ?? chunk}`;
      if (s.processedChunkKeys.has(dedupKey)) {
        return s;
      }

      const newProcessedKeys = new Set(s.processedChunkKeys);
      newProcessedKeys.add(dedupKey);

      return {
        messagesById: {
          ...s.messagesById,
          [msgId]: {
            ...s.messagesById[msgId],
            content: s.messagesById[msgId].content + chunk,
          },
        },
        processedChunkKeys: newProcessedKeys,
      };
    }),

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
          content: "Something went wrong. Please try again.",
          isStreaming: false,
          error: true,
        },
      },
    })),

  setIsStreaming: (val, msgId = null) =>
    set({ isStreaming: val, streamingMessageId: msgId }),

  resetTurnState: () =>
    set({
      currentTurnId: null,
      processedChunkKeys: new Set(),
    }),
}));

"use client";

import { useCallback } from "react";
import { streamChat } from "@/lib/stream";
import { useChatStore } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";
import { tokenStorage } from "@/lib/auth";

export function useStream() {
  const {
    addUserMessage, startAssistantMessage,
    appendStreamChunk, finalizeMessage,
    setImageMessage, setMessageError, setIsStreaming,
  } = useChatStore();

  const send = useCallback(
    async (conversationId: number, message: string) => {
      const token = tokenStorage.get();
      if (!token) return;

      addUserMessage(conversationId, message);
      const assistantMsgId = startAssistantMessage(conversationId);
      setIsStreaming(true);

      await streamChat(
        conversationId,
        message,
        token,
        (event) => {
          if (event.type === "content" && event.content) {
            appendStreamChunk(conversationId, assistantMsgId, event.content);
          }
          if (event.type === "image" && event.url) {
            setImageMessage(conversationId, assistantMsgId, event.url);
          }
        },
        () => {
          finalizeMessage(conversationId, assistantMsgId);
          setIsStreaming(false);
        },
        () => {
          setMessageError(conversationId, assistantMsgId);
          setIsStreaming(false);
        }
      );
    },
    [addUserMessage, startAssistantMessage, appendStreamChunk,
     finalizeMessage, setImageMessage, setMessageError, setIsStreaming]
  );

  return { send };
}

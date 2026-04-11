"use client";

import { useCallback } from "react";
import { streamChat } from "@/lib/stream";
import { useChatStore } from "@/store/chatStore";
import { tokenStorage } from "@/lib/auth";
import toast from "react-hot-toast";

export function useStream() {
  const {
    addUserMessage,
    startAssistantMessage,
    appendStreamChunk,
    finalizeMessage,
    setImageMessage,
    setMessageError,
    setIsStreaming,
  } = useChatStore();

  const send = useCallback(
    async (conversationId: number, message: string) => {
      const token = tokenStorage.get();
      if (!token) {
        toast.error("Not authenticated");
        return;
      }

      addUserMessage(conversationId, message);
      const assistantMsgId = startAssistantMessage(conversationId);
      setIsStreaming(true);

      await streamChat(
        conversationId,
        message,
        token,
        (event) => {
          if (event.type === "content" && event.content) {
            // Fix 3: Dropped conversationId, using assistantMsgId only
            appendStreamChunk(assistantMsgId, event.content);
          }
          if (event.type === "image" && event.url) {
            // Fix 3: Dropped conversationId
            setImageMessage(assistantMsgId, event.url);
          }
          if (event.type === "tool_result") {
            // tool results absorbed into content by backend — ignore here
          }
        },
        () => {
          // Fix 3: Dropped conversationId
          finalizeMessage(assistantMsgId);
          setIsStreaming(false);
        },
        (err) => {
          // Fix 3: Dropped conversationId
          setMessageError(assistantMsgId);
          setIsStreaming(false);
          toast.error(err ?? "Something went wrong");
        }
      );
    },
    [
      addUserMessage,
      startAssistantMessage,
      appendStreamChunk,
      finalizeMessage,
      setImageMessage,
      setMessageError,
      setIsStreaming,
    ]
  );

  return { send };
}

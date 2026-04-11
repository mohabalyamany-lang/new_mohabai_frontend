"use client";

import { useCallback, useRef } from "react";
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
    setCurrentTurnId,
    resetTurnState,
  } = useChatStore();

  // Track current turn to prevent stale writes
  const activeTurnRef = useRef<string | null>(null);

  const send = useCallback(
    async (conversationId: number, message: string) => {
      const token = tokenStorage.get();
      if (!token) {
        toast.error("Not authenticated");
        return;
      }

      // Reset dedup state for new request
      resetTurnState();
      activeTurnRef.current = null;

      addUserMessage(conversationId, message);
      const assistantMsgId = startAssistantMessage(conversationId);
      setIsStreaming(true);

      let chunkCounter = 0;

      await streamChat(
        conversationId,
        message,
        token,
        (event) => {
          // ━━━ Meta event: capture turn_id for deduplication ━━━
          if (event.type === "meta" && event.turn_id) {
            activeTurnRef.current = event.turn_id;
            setCurrentTurnId(event.turn_id);
            return;
          }

          // ━━━ Ignore events from a different turn (stale stream) ━━━
          if (event.turn_id && activeTurnRef.current && event.turn_id !== activeTurnRef.current) {
            return;
          }

          // ━━━ Content chunks with deduplication ━━━
          if (event.type === "content" && event.content) {
            appendStreamChunk(assistantMsgId, event.content, chunkCounter);
            chunkCounter++;
            return;
          }

          // ━━━ Image events ━━━
          if (event.type === "image" && event.url) {
            setImageMessage(assistantMsgId, event.url);
            return;
          }

          // ━━━ Tool results: absorbed into content by backend ━━━
          if (event.type === "tool_result") {
            return;
          }

          // ━━━ Error events ━━━
          if (event.type === "error") {
            setMessageError(assistantMsgId);
            setIsStreaming(false);
            activeTurnRef.current = null;
            const errorMsg = event.error || "Something went wrong";
            toast.error(errorMsg);
            return;
          }
        },
        () => {
          // Done: only finalize if this is our turn
          finalizeMessage(assistantMsgId);
          setIsStreaming(false);
          activeTurnRef.current = null;
        },
        (err) => {
          // Network/parse error
          setMessageError(assistantMsgId);
          setIsStreaming(false);
          activeTurnRef.current = null;
          toast.error(err ?? "Connection failed. Please try again.");
        },
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
      setCurrentTurnId,
      resetTurnState,
    ]
  );

  return { send };
}

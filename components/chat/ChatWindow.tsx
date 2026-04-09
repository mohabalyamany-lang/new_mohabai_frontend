"use client";

import { useEffect } from "react";
import { useChatStore } from "@/store/chatStore";
import { useStream } from "@/hooks/useStream";
import { useConversations } from "@/hooks/useConversations";
import { MessageList } from "./MessageList";
import { InputBar } from "./InputBar";
import { api } from "@/lib/api";

interface Props {
  conversationId: number;
}

export function ChatWindow({ conversationId }: Props) {
  const { messages, setMessages, isStreaming } = useChatStore();
  const { send } = useStream();
  const { updateConversation } = useConversations();

  const currentMessages = messages[conversationId] ?? [];

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(
          `/conversations/${conversationId}/messages`
        );
        setMessages(conversationId, data);
      } catch {
        // silently fail
      }
    };
    load();
  }, [conversationId]);

  const handleSend = async (message: string) => {
    // Auto-title conversation from first message
    if (currentMessages.length === 0) {
      updateConversation(conversationId, { title: message.slice(0, 60) });
    }
    await send(conversationId, message);
  };

  return (
    <div className="flex flex-col h-full">
      <MessageList messages={currentMessages} />
      <InputBar onSend={handleSend} disabled={isStreaming} />
    </div>
  );
}

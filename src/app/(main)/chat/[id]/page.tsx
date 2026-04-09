"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useChatStore } from "@/store/chatStore";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Spinner } from "@/components/ui/Spinner";
import { api } from "@/lib/api";

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const { conversations, setActiveConversation, activeConversationId } = useChatStore();

  useEffect(() => {
    const match = conversations.find((c) => c.public_id === id);
    if (match) {
      setActiveConversation(match.id);
    } else {
      // fetch if not in store
      api.get(`/conversations/${id}`).then(({ data }) => {
        setActiveConversation(data.id);
      });
    }
  }, [id, conversations]);

  if (!activeConversationId) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return <ChatWindow conversationId={activeConversationId} />;
}

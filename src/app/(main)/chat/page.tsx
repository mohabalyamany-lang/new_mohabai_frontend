"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConversations } from "@/hooks/useConversations";
import { useChatStore } from "@/store/chatStore";
import { Spinner } from "@/components/ui/Spinner";

export default function ChatPage() {
  const router = useRouter();
  const { createConversation } = useConversations();
  const { setActiveConversation } = useChatStore();

  useEffect(() => {
    const init = async () => {
      const convo = await createConversation();
      setActiveConversation(convo.id);
      router.replace(`/chat/${convo.public_id}`);
    };
    init();
  }, []);

  return (
    <div className="flex h-full items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

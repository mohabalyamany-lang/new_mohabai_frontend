"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { Message } from "@/types/chat";

interface Props {
  messages: Message[];
}

export function MessageList({ messages }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-4">
        <div className="w-12 h-12 rounded-2xl bg-[var(--accent-subtle)] flex items-center justify-center">
          <span className="text-2xl">✦</span>
        </div>
        <p className="text-[var(--text-secondary)] text-sm">
          Start a conversation with Mohab AI
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-4">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

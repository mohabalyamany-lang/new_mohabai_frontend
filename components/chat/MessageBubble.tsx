"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { cn } from "@/lib/utils";
import { Message } from "@/types/chat";
import { ImageMessage } from "./ImageMessage";
import { TypingIndicator } from "./TypingIndicator";
import "highlight.js/styles/github-dark.css";

interface Props {
  message: Message;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  if (message.isStreaming && !message.content && !message.imageUrl) {
    return (
      <div className="flex justify-start px-4">
        <TypingIndicator />
      </div>
    );
  }

  if (message.imageUrl) {
    return <ImageMessage url={message.imageUrl} />;
  }

  return (
    <div className={cn("flex w-full px-4", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm",
          isUser
            ? "bg-[var(--accent)] text-white rounded-br-sm"
            : "bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-bl-sm border border-[var(--border)]",
          message.error && "border-[var(--error)] text-[var(--error)]"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            className="prose prose-invert prose-sm max-w-none"
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { ConversationItem } from "./ConversationItem";
import { Conversation } from "@/types/chat";
import { formatDate } from "@/lib/utils";

interface Props {
  conversations: Conversation[];
  activeId: number | null;
  search: string;
  onRename: (id: number, title: string) => void;
  onDelete: (id: number) => void;
}

export function ConversationList({
  conversations, activeId, search, onRename, onDelete,
}: Props) {
  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter((c) =>
      (c.title ?? "").toLowerCase().includes(q)
    );
  }, [conversations, search]);

  // Group by date
  const groups = useMemo(() => {
    const map = new Map<string, Conversation[]>();
    filtered.forEach((c) => {
      const label = formatDate(c.updated_at);
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(c);
    });
    return map;
  }, [filtered]);

  if (filtered.length === 0) {
    return (
      <p className="text-center text-xs text-[var(--text-muted)] py-8">
        {search ? "No results found" : "No conversations yet"}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1 overflow-y-auto flex-1">
      {Array.from(groups.entries()).map(([label, items]) => (
        <div key={label}>
          <p className="px-5 py-1.5 text-xs text-[var(--text-muted)] font-medium">
            {label}
          </p>
          {items.map((c) => (
            <ConversationItem
              key={c.id}
              conversation={c}
              isActive={c.id === activeId}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

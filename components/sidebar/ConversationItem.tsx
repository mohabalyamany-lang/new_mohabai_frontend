"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2, Pin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Conversation } from "@/types/chat";

interface Props {
  conversation: Conversation;
  isActive: boolean;
  onRename: (id: number, title: string) => void;
  onDelete: (id: number) => void;
}

export function ConversationItem({ conversation, isActive, onRename, onDelete }: Props) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(conversation.title ?? "New conversation");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleRename = () => {
    onRename(conversation.id, editValue);
    setEditing(false);
    setMenuOpen(false);
  };

  return (
    <div
      className={cn(
        "group relative flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer mx-2 transition-colors",
        isActive
          ? "bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
          : "hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
      )}
      onClick={() => !editing && router.push(`/chat/${conversation.public_id}`)}
    >
      {editing ? (
        <input
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRename();
            if (e.key === "Escape") setEditing(false);
          }}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 bg-transparent outline-none text-sm border-b border-[var(--accent)]"
        />
      ) : (
        <span className="flex-1 truncate text-sm">
          {conversation.title ?? "New conversation"}
        </span>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen((v) => !v);
        }}
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[var(--bg-hover)] transition-opacity shrink-0"
      >
        <MoreHorizontal size={14} />
      </button>

      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute right-2 top-full mt-1 z-20 w-40 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] shadow-xl py-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => { setEditing(true); setMenuOpen(false); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-[var(--bg-hover)] transition-colors"
          >
            <Pencil size={12} /> Rename
          </button>
          <button
            onClick={() => { onDelete(conversation.id); setMenuOpen(false); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[var(--error)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

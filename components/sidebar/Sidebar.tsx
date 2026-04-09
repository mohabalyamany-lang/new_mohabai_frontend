"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Settings, LogOut, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { useConversations } from "@/hooks/useConversations";
import { ConversationList } from "./ConversationList";
import { SearchBar } from "./SearchBar";
import { api } from "@/lib/api";

export function Sidebar() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { logout, user } = useAuthStore();
  const { activeConversationId, setActiveConversation } = useChatStore();
  const { conversations, createConversation, renameConversation, removeConversation } =
    useConversations();

  const handleNew = async () => {
    const convo = await createConversation();
    setActiveConversation(convo.id);
    router.push(`/chat/${convo.public_id}`);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={cn(
          "fixed md:relative z-30 h-full flex flex-col",
          "bg-[var(--bg-secondary)] border-r border-[var(--border)]",
          "transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-64" : "w-0 overflow-hidden"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 shrink-0">
          <span className="font-semibold text-sm text-[var(--text-primary)]">
            Mohab AI
          </span>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* New chat */}
        <div className="px-3 pb-2 shrink-0">
          <button
            onClick={handleNew}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors border border-[var(--border)]"
          >
            <Plus size={15} />
            New conversation
          </button>
        </div>

        {/* Search */}
        <SearchBar value={search} onChange={setSearch} />

        {/* Conversation list */}
        <ConversationList
          conversations={conversations}
          activeId={activeConversationId}
          search={search}
          onRename={renameConversation}
          onDelete={removeConversation}
        />

        {/* Footer */}
        <div className="shrink-0 border-t border-[var(--border)] p-3 flex flex-col gap-1">
          <button
            onClick={() => router.push("/settings")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <Settings size={14} />
            Settings
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <LogOut size={14} />
            Sign out {user?.username && `(${user.username})`}
          </button>
        </div>
      </aside>
    </>
  );
}

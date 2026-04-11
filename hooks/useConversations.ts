"use client";

import { useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { useChatStore } from "@/store/chatStore";
import { useAuthStore } from "@/lib/authStore";
import { Conversation } from "@/types/chat";
import toast from "react-hot-toast";

export function useConversations() {
  const {
    conversations,
    setConversations,
    addConversation,
    updateConversation,
    deleteConversation,
  } = useChatStore();

  const { user } = useAuthStore();

  const loadConversations = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get("/conversations");
      setConversations(data.items ?? data ?? []);
    } catch {
      // silently fail on initial load
    }
  }, [user, setConversations]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const createConversation = async (
    firstMessage?: string
  ): Promise<Conversation> => {
    if (!user) throw new Error("Not authenticated");
    const { data } = await api.post("/conversations", {
      user_id: user.id,
      title: firstMessage?.slice(0, 60) ?? null,
    });
    const conversation: Conversation = {
      id: data.conversation_id,
      public_id: data.public_id ?? String(data.conversation_id),
      title: data.title,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    addConversation(conversation);
    return conversation;
  };

  const renameConversation = async (id: number, title: string) => {
    try {
      await api.patch(`/conversations/${id}`, { title });
      updateConversation(id, { title });
    } catch {
      toast.error("Failed to rename conversation");
    }
  };

  const removeConversation = async (id: number) => {
    try {
      await api.delete(`/conversations/${id}`);
      deleteConversation(id);
    } catch {
      toast.error("Failed to delete conversation");
    }
  };

  return {
    conversations,
    createConversation,
    renameConversation,
    removeConversation,
    reload: loadConversations,
  };
}

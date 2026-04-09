"use client";

import { useEffect } from "react";
import { api } from "@/lib/api";
import { useChatStore } from "@/store/chatStore";
import { Conversation } from "@/types/chat";
import toast from "react-hot-toast";

export function useConversations() {
  const { conversations, setConversations, addConversation,
          updateConversation, deleteConversation } = useChatStore();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const { data } = await api.get("/conversations");
      setConversations(data.items ?? data);
    } catch {
      // silently fail on load
    }
  };

  const createConversation = async (firstMessage?: string): Promise<Conversation> => {
    const { data } = await api.post("/conversations", {
      title: firstMessage?.slice(0, 60) ?? "New conversation",
    });
    addConversation(data);
    return data;
  };

  const renameConversation = async (id: number, title: string) => {
    try {
      await api.patch(`/conversations/${id}`, { title });
      updateConversation(id, { title });
    } catch {
      toast.error("Failed to rename");
    }
  };

  const removeConversation = async (id: number) => {
    try {
      await api.delete(`/conversations/${id}`);
      deleteConversation(id);
    } catch {
      toast.error("Failed to delete");
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

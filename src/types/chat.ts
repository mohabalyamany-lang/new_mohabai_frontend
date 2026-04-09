export interface Conversation {
  id: number;
  public_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  pinned?: boolean;
}

export interface Message {
  id: string; // local uuid for optimistic rendering
  role: "user" | "assistant";
  content: string;
  created_at: string;
  isStreaming?: boolean;
  imageUrl?: string;
  error?: boolean;
}

export interface StreamEvent {
  type: "meta" | "content" | "image" | "tool_result" | "error" | "done";
  content?: string;
  url?: string;
  prompt?: string;
  error?: string;
  conversation_id?: number;
  turn_id?: number;
  planner_action?: Record<string, unknown>;
}

export interface ChatRequest {
  message: string;
  conversation_id: number;
}

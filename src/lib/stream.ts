import { StreamEvent } from "@/types/chat";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function streamChat(
  conversationId: number,
  message: string,
  accessToken: string,
  onEvent: (event: StreamEvent) => void,
  onDone: () => void,
  onError: (err: string) => void
): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/api/v1/stream-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        message,
      }),
    });
  } catch (err) {
    onError("Network error — could not reach server.");
    return;
  }

  if (!response.ok) {
    onError(`Request failed: ${response.status}`);
    return;
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    onError("No response body");
    return;
  }

  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const raw = line.slice(6).trim();
        if (!raw) continue;

        try {
          const event: StreamEvent = JSON.parse(raw);

          if (event.type === "done") {
            onDone();
            return;
          }

          if (event.type === "error") {
            onError(event.error ?? "Unknown error from server");
            return;
          }

          onEvent(event);
        } catch {
          // malformed SSE line — skip
        }
      }
    }
  } catch (err) {
    onError("Stream interrupted");
    return;
  } finally {
    reader.releaseLock();
  }

  onDone();
}

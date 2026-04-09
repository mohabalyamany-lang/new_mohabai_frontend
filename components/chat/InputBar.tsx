"use client";

import { useState, useRef, useCallback } from "react";
import { Send, Paperclip, Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function InputBar({ onSend, disabled }: Props) {
  const [value, setValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  };

  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SR = (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setValue((prev) => prev + (prev ? " " : "") + transcript);
    };

    recognition.onend = () => setIsRecording(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  return (
    <div className="px-4 pb-4 pt-2">
      <div
        className={cn(
          "flex items-end gap-2 rounded-2xl border px-4 py-3",
          "bg-[var(--bg-secondary)] border-[var(--border)]",
          "focus-within:border-[var(--accent)] transition-colors"
        )}
      >
        <button
          className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors p-1 shrink-0"
          title="Attach file"
        >
          <Paperclip size={18} />
        </button>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Message Mohab AI..."
          rows={1}
          disabled={disabled}
          className={cn(
            "flex-1 resize-none bg-transparent outline-none text-sm",
            "text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
            "min-h-[24px] max-h-[200px] py-0.5 leading-relaxed"
          )}
        />

        <button
          onClick={toggleVoice}
          className={cn(
            "transition-colors p-1 shrink-0",
            isRecording
              ? "text-[var(--error)] animate-pulse"
              : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          )}
          title={isRecording ? "Stop recording" : "Voice input"}
        >
          {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        <button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className={cn(
            "p-1.5 rounded-lg transition-all shrink-0",
            value.trim() && !disabled
              ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
              : "text-[var(--text-muted)] cursor-not-allowed"
          )}
        >
          <Send size={16} />
        </button>
      </div>
      <p className="text-center text-xs text-[var(--text-muted)] mt-2">
        Mohab AI can make mistakes. Verify important information.
      </p>
    </div>
  );
}

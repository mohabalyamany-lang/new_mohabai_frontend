"use client";

import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm text-[var(--text-secondary)]">{label}</label>
      )}
      <input
        className={cn(
          "w-full rounded-lg px-4 py-2.5 text-sm",
          "bg-[var(--bg-tertiary)] border border-[var(--border)]",
          "text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
          "outline-none focus:border-[var(--accent)] transition-colors",
          error && "border-[var(--error)]",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-[var(--error)]">{error}</p>}
    </div>
  );
}

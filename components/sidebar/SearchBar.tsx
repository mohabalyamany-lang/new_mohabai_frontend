"use client";

import { Search } from "lucide-react";

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export function SearchBar({ value, onChange }: Props) {
  return (
    <div className="relative px-3 py-2">
      <Search
        size={14}
        className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
      />
      <input
        type="text"
        placeholder="Search conversations..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-8 pr-3 py-2 rounded-lg text-xs bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors"
      />
    </div>
  );
}

"use client";

import { useUIStore } from "@/store/uiStore";
import { Button } from "@/components/ui/Button";
import { Sun, Moon } from "lucide-react";

export default function SettingsPage() {
  const { theme, toggleTheme } = useUIStore();

  return (
    <div className="max-w-lg mx-auto px-6 py-10">
      <h1 className="text-xl font-semibold mb-6">Settings</h1>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
          <div>
            <p className="text-sm font-medium">Theme</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {theme === "dark" ? "Dark mode" : "Light mode"}
            </p>
          </div>
          <Button variant="ghost" onClick={toggleTheme} size="sm">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            {theme === "dark" ? "Light" : "Dark"}
          </Button>
        </div>
      </div>
    </div>
  );
}

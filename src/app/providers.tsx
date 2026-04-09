"use client";

import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useUIStore } from "@/store/uiStore";

export function Providers({ children }: { children: React.ReactNode }) {
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.className = theme === "light" ? "light" : "";
  }, [theme]);

  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--bg-tertiary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          },
        }}
      />
    </>
  );
}

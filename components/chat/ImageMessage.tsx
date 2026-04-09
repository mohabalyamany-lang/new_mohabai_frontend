"use client";

import { useState } from "react";
import { Download } from "lucide-react";

export function ImageMessage({ url }: { url: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="flex justify-start px-4">
      <div className="relative max-w-sm rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg-secondary)] group">
        {!loaded && (
          <div className="w-64 h-64 animate-pulse bg-[var(--bg-tertiary)]" />
        )}
        <img
          src={url}
          alt="Generated image"
          className="max-w-full rounded-xl"
          onLoad={() => setLoaded(true)}
          style={{ display: loaded ? "block" : "none" }}
        />
        
          href={url}
          download
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Download size={14} className="text-white" />
        </a>
      </div>
    </div>
  );
}

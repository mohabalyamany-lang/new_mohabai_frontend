import { cn } from "@/lib/utils";

export function Spinner({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin",
        {
          "w-3 h-3": size === "sm",
          "w-5 h-5": size === "md",
          "w-8 h-8": size === "lg",
        },
        className
      )}
    />
  );
}

import { cn } from "@/lib/utils";

export function GlassCard({ className, children, strong, ...props }) {
  return (
    <div className={cn(strong ? "glass-strong" : "glass", "p-4 shadow-xl", className)} {...props}>
      {children}
    </div>
  );
}

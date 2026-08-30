import { cn } from "@/lib/utils";

/**
 * A glass panel with an animated conic-gradient border stroke.
 * Pairs with the `.cyber-border` utility (respects reduced motion).
 */
export function CyberPanel({
  className,
  children,
  animated = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { animated?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg backdrop-blur-md",
        animated ? "cyber-border" : "cyber-border-static",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
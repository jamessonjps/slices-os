import { cn } from "@/lib/utils"

function Skeleton({
  className,
  shimmer = true,
  ...props
}) {
  return (
    <div
      className={cn(
        shimmer 
          ? "skeleton-shimmer" 
          : "skeleton",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton }

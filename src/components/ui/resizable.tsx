import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Resizable wrapper for panel elements.
 * Provides resizing handles while preserving original structure.
 */
const Resizable = React.forwardRef<
  React.ElementRef<typeof React>,
  React.ComponentPropsWithoutRef<"div"> // Generic div props
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("div", className)}
    {...props}
  />
))

const ResizableHandle = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-4 w-full items-center justify-center rounded-sm bg-border hover:bg-accent transition-colors",
      className
    )}
    {...props}
  />
))

export { Resizable, ResizableHandle }
"use client"

import * as React from "react"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import { cn } from "@/lib/utils"

const ResizablePanelGroup = React.forwardRef<
  React.ElementRef<typeof PanelGroup>,
  React.ComponentPropsWithoutRef<typeof PanelGroup>
>(({ className, ...props }, ref) => (
  <PanelGroup
    ref={ref}
    className={cn("flex h-full w-full data-[panel-direction=vertical]:flex-col", className)}
    {...props}
  />
))
ResizablePanelGroup.displayName = PanelGroup.displayName

const ResizablePanel = React.forwardRef<
  React.ElementRef<typeof Panel>,
  React.ComponentPropsWithoutRef<typeof Panel>
>(({ className, ...props }, ref) => (
  <Panel
    ref={ref}
    className={cn(
      "flex h-full w-full data-[panel-direction=vertical]:flex-col",
      className
    )}
    {...props}
  />
))
ResizablePanel.displayName = Panel.displayName

const ResizableHandle = React.forwardRef<
  React.ElementRef<typeof PanelResizeHandle>,
  React.ComponentPropsWithoutRef<typeof PanelResizeHandle> & {
    withHandle?: boolean
  }
>(({ className, withHandle = false, ...props }, ref) => (
  <PanelResizeHandle
    ref={ref}
    className={cn(
      "w-px bg-border hover:bg-border/80 transition-colors",
      withHandle && "w-2 hover:w-3",
      className
    )}
    {...props}
  />
))
ResizableHandle.displayName = PanelResizeHandle.displayName

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
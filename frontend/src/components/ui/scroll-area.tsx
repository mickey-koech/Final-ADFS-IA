import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn(
      "relative overflow-hidden",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollAreaPrimitive.Scrollbar className="flex select-none transition-colors w-3 border border-slate-200 rounded-lg bg-transparent p-0.5" orientation="vertical">
      <ScrollAreaPrimitive.Thumb className="flex-1 bg-slate-300 rounded-[4px] relative before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-2 before:h-2 before:bg-current before:rounded-[1px] before:content-[''] transition-colors hover:bg-slate-400" />
    </ScrollAreaPrimitive.Scrollbar>
    <ScrollAreaPrimitive.Scrollbar className="flex select-none transition-colors border border-slate-200 h-3 rounded-lg bg-transparent p-0.5" orientation="horizontal">
      <ScrollAreaPrimitive.Thumb className="flex-1 bg-slate-300 rounded-[4px] relative before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-2 before:h-2 before:bg-current before:rounded-[1px] before:content-[''] transition-colors hover:bg-slate-400" />
    </ScrollAreaPrimitive.Scrollbar>
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

export { ScrollArea }


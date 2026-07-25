import * as React from "react"
import { cn } from "@/lib/utils"

export function Tooltip({ children, content }: { children: React.ReactNode, content: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <div className="absolute z-50 px-2 py-1 text-xs text-popover-foreground bg-popover border rounded shadow-md -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap animate-slideUp">
          {content}
        </div>
      )}
    </div>
  )
}

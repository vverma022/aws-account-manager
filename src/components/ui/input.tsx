import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Input — DepthUI recessed element.
 * Uses bg-dark + inset shadow to appear sunken into the card surface,
 * reinforcing the layered depth hierarchy.
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-[8px] bg-bg-dark px-3 py-2 text-base text-text-primary shadow-recessed",
          "placeholder:text-text-muted",
          "ring-offset-bg-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-text-primary",
          "md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

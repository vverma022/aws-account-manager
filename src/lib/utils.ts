import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge to resolve conflicts
 * Example: cn('p-4', 'p-2') returns 'p-2' (latter wins)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

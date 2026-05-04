import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class name inputs and resolves conflicting Tailwind utility classes.
 *
 * Use for:
 * - Building conditional `className` values in React components
 * - Merging base styles with overrides without duplicating Tailwind utilities
 *
 * @param inputs - Class values such as strings, arrays, and conditional objects to merge
 * @returns A single class name string with Tailwind conflicts resolved
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

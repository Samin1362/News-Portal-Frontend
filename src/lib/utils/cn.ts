import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Compose Tailwind class strings safely. clsx handles conditional / array
 * inputs; twMerge resolves conflicts (e.g. `p-2` overrides earlier `p-4`).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

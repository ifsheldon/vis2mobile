// import { type ClassValue, clsx } from "clsx";
// import { twMerge } from "tailwind-merge";

export function cn(...inputs: unknown[]) {
  // return twMerge(clsx(inputs));
  return inputs.filter(Boolean).join(" ");
}

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


// Function to remove all cookies
export async function logout() {
  await fetch("/api/logout", { method: "POST" });
  window.location.href = "/login";  // Redirect to login page after logout
}

import { cn } from "@/utils/cn";

export const controlClasses = cn(
  "w-full min-w-0 rounded-md border border-ink-200 bg-white px-3 text-[14px] text-ink-900 transition-colors",
  "placeholder:text-ink-300",
  "focus:border-navy-600 focus:outline-none focus:ring-1 focus:ring-navy-600",
  "aria-[invalid=true]:border-critical-500 aria-[invalid=true]:focus:ring-critical-500",
  "disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-500",
);

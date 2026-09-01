import { cn } from "@/utils/cn";

const TONE_CLASSES = {
  error: "border-critical-500/25 bg-critical-50 text-critical-700",
  success: "border-positive-500/25 bg-positive-50 text-positive-700",
  info: "border-accent-300/50 bg-accent-50 text-accent-700",
  neutral: "border-ink-200 bg-ink-50 text-ink-700",
} as const;

type FormAlertProps = {
  tone?: keyof typeof TONE_CLASSES;
  children: React.ReactNode;
  className?: string;
};

export function FormAlert({ tone = "error", children, className }: FormAlertProps) {
  if (!children) return null;

  return (
    <p className={cn("rounded-md border px-3 py-2 text-[13px]", TONE_CLASSES[tone], className)}>
      {children}
    </p>
  );
}

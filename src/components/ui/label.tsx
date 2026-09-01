import { cn } from "@/utils/cn";

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn(
        "inline-block w-fit cursor-pointer text-[13px] font-medium text-ink-700",
        className,
      )}
      {...props}
    />
  );
}

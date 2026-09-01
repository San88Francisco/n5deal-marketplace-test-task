import { CircleAlert } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/cn";

const helperTextVariants = cva("inline-flex items-start gap-1.5 text-[12.5px] leading-snug", {
  variants: {
    variant: {
      default: "text-ink-500",
      error: "text-critical-500",
      warning: "text-caution-700",
      success: "text-positive-700",
    },
  },
  defaultVariants: { variant: "default" },
});

type HelperTextProps = React.ComponentProps<"p"> & VariantProps<typeof helperTextVariants>;

export function HelperText({ className, variant = "default", children, ...props }: HelperTextProps) {
  const showsIcon = variant === "error" || variant === "warning";

  return (
    <p
      className={cn(helperTextVariants({ variant }), className)}
      data-error-msg={variant === "error"}
      {...props}
    >
      {showsIcon && <CircleAlert aria-hidden className="mt-[1px] h-3.5 w-3.5 shrink-0" />}
      <span>{children}</span>
    </p>
  );
}

export { helperTextVariants };

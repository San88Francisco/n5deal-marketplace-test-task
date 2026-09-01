import * as React from "react";

import { controlClasses } from "@/components/ui/control-classes";
import { cn } from "@/utils/cn";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      data-slot="input"
      className={cn(controlClasses, "h-10", className)}
      {...props}
    />
  ),
);

Input.displayName = "Input";

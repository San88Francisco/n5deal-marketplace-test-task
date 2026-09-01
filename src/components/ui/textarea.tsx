import * as React from "react";

import { controlClasses } from "@/components/ui/control-classes";
import { cn } from "@/utils/cn";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, rows = 4, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      data-slot="textarea"
      className={cn(controlClasses, "resize-y py-2 leading-relaxed", className)}
      {...props}
    />
  ),
);

Textarea.displayName = "Textarea";

import * as React from "react";

import { controlClasses } from "@/components/ui/control-classes";
import { cn } from "@/utils/cn";
import type { SelectOption } from "@/types";

type SelectProps = React.ComponentProps<"select"> & {
  options: SelectOption[];
  placeholder?: string;
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, ...props }, ref) => (
    <select
      ref={ref}
      data-slot="select"
      className={cn(controlClasses, "h-10", className)}
      {...props}
    >
      {placeholder ? (
        <option value="" disabled>
          {placeholder}
        </option>
      ) : null}

      {options.map((option) => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  ),
);

Select.displayName = "Select";

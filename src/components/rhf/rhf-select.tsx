"use client";

import * as React from "react";
import type { ReactNode } from "react";
import {
  Controller,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
  useFormContext,
} from "react-hook-form";

import { getFieldHelperState } from "@/utils/rhf/get-field-helper-state";
import { HelperText } from "@/components/ui/helper-text";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { type SelectOption } from "@/types";
import { cn } from "@/utils/cn";

type RHFSelectProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label?: ReactNode;
  options: SelectOption[];
  placeholder?: string;
  helperText?: ReactNode;
  warningText?: ReactNode;
  rules?: RegisterOptions<T, FieldPath<T>>;
  containerClassName?: string;
  triggerClassName?: string;
  disabled?: boolean;
  endAdornment?: ReactNode;
};

function RHFSelect<T extends FieldValues>({
  name,
  label,
  options,
  placeholder,
  helperText,
  warningText,
  rules,
  containerClassName,
  triggerClassName,
  disabled,
  endAdornment,
}: RHFSelectProps<T>) {
  const { control } = useFormContext<T>();
  const selectId = React.useId();

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => {
        const { hasError, message, helperVariant } = getFieldHelperState(
          fieldState,
          helperText,
          warningText,
        );

        // A stored value that is no longer in the option list (a jurisdiction
        // that was retired, say) must not silently select the first option.
        const valueInOptions = options.some((option) => option.value === field.value);
        const selectValue = valueInOptions ? field.value : "";

        return (
          <div className={cn("flex flex-col gap-1.5", containerClassName)}>
            {label != null && <Label htmlFor={selectId}>{label}</Label>}
            <div className="flex items-center gap-2">
              <Select
                id={selectId}
                options={options}
                placeholder={placeholder}
                disabled={disabled}
                value={selectValue}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
                ref={field.ref}
                name={field.name}
                className={cn("min-w-0 flex-1", triggerClassName)}
                aria-invalid={hasError || undefined}
              />
              {endAdornment}
            </div>
            {message != null && <HelperText variant={helperVariant}>{message}</HelperText>}
          </div>
        );
      }}
    />
  );
}

export { RHFSelect };

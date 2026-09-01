"use client";

import * as React from "react";
import type { ComponentProps, ReactNode } from "react";
import {
  Controller,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
  useFormContext,
} from "react-hook-form";

import { getFieldHelperState } from "@/utils/rhf/get-field-helper-state";
import { Checkbox } from "@/components/ui/checkbox";
import { HelperText } from "@/components/ui/helper-text";
import { cn } from "@/utils/cn";

type RHFCheckboxProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label?: ReactNode;
  description?: ReactNode;
  helperText?: ReactNode;
  warningText?: ReactNode;
  rules?: RegisterOptions<T, FieldPath<T>>;
  containerClassName?: string;
  disabled?: boolean;
} & Omit<
  ComponentProps<typeof Checkbox>,
  "checked" | "defaultChecked" | "onChange" | "name" | "disabled"
>;

function RHFCheckbox<T extends FieldValues>({
  name,
  label,
  description,
  helperText,
  warningText,
  rules,
  containerClassName,
  disabled,
  className,
  id,
  ...checkboxProps
}: RHFCheckboxProps<T>) {
  const { control } = useFormContext<T>();
  const generatedId = React.useId();
  const checkboxId = id ?? generatedId;

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

        return (
          <div className={cn("flex flex-col gap-1.5", containerClassName)}>
            <div className="flex items-start gap-2.5">
              <Checkbox
                {...checkboxProps}
                id={checkboxId}
                className={cn("mt-0.5", className)}
                disabled={disabled}
                checked={Boolean(field.value)}
                onChange={(event) => field.onChange(event.target.checked)}
                onBlur={field.onBlur}
                ref={field.ref}
                aria-invalid={hasError || undefined}
              />
              {label != null && (
                <span>
                  <label
                    htmlFor={checkboxId}
                    className={cn(
                      "block text-[13.5px] text-ink-900",
                      disabled ? "cursor-default opacity-50" : "cursor-pointer",
                    )}
                  >
                    {label}
                  </label>
                  {description != null && (
                    <span className="mt-0.5 block text-[12.5px] leading-snug text-ink-500">
                      {description}
                    </span>
                  )}
                </span>
              )}
            </div>
            {message != null && <HelperText variant={helperVariant}>{message}</HelperText>}
          </div>
        );
      }}
    />
  );
}

export { RHFCheckbox };

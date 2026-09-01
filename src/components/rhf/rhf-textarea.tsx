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
import { HelperText, Label, Textarea } from "@/components/ui/form-primitives";
import { cn } from "@/lib/utils";

type RHFTextareaProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label?: ReactNode;
  helperText?: ReactNode;
  warningText?: ReactNode;
  rules?: RegisterOptions<T, FieldPath<T>>;
  containerClassName?: string;
  /** Shows a live character count against the schema's maximum. */
  maxLength?: number;
} & Omit<
  ComponentProps<typeof Textarea>,
  "name" | "value" | "defaultValue" | "onChange" | "onBlur" | "ref"
>;

function RHFTextarea<T extends FieldValues>({
  name,
  label,
  helperText,
  warningText,
  rules,
  containerClassName,
  className,
  maxLength,
  id,
  ...textareaProps
}: RHFTextareaProps<T>) {
  const { control } = useFormContext<T>();
  const fallbackId = React.useId();
  const textareaId = id ?? fallbackId;

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
        const length = String(field.value ?? "").length;

        return (
          <div className={cn("flex flex-col gap-1.5", containerClassName)}>
            {label != null && <Label htmlFor={textareaId}>{label}</Label>}
            <Textarea
              {...field}
              value={field.value ?? ""}
              {...textareaProps}
              maxLength={maxLength}
              id={textareaId}
              className={className}
              aria-invalid={hasError || undefined}
            />
            <div className="flex items-start justify-between gap-3">
              {message != null ? (
                <HelperText variant={helperVariant}>{message}</HelperText>
              ) : (
                <span />
              )}
              {maxLength ? (
                <span
                  className={cn(
                    "tabular shrink-0 text-[12px]",
                    length > maxLength * 0.9 ? "text-caution-700" : "text-ink-300",
                  )}
                >
                  {length}/{maxLength}
                </span>
              ) : null}
            </div>
          </div>
        );
      }}
    />
  );
}

export { RHFTextarea };

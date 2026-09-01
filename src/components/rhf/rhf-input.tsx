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
import { HelperText } from "@/components/ui/helper-text";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils/cn";

type RHFInputProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label?: ReactNode;
  helperText?: ReactNode;
  warningText?: ReactNode;
  rules?: RegisterOptions<T, FieldPath<T>>;
  containerClassName?: string;
  endAdornment?: ReactNode;
} & Omit<
  ComponentProps<typeof Input>,
  "name" | "value" | "defaultValue" | "onChange" | "onBlur" | "ref"
>;

function RHFInput<T extends FieldValues>({
  name,
  label,
  helperText,
  warningText,
  rules,
  containerClassName,
  endAdornment,
  className,
  id,
  ...inputProps
}: RHFInputProps<T>) {
  const { control } = useFormContext<T>();
  const fallbackId = React.useId();
  const inputId = id ?? fallbackId;

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
            {label != null && <Label htmlFor={inputId}>{label}</Label>}
            <div className="flex items-center gap-2">
              <Input
                {...field}

                value={field.value ?? ""}

                onChange={
                  inputProps.type === "number"
                    ? (event) => {
                        const raw = event.target.value;
                        field.onChange(raw === "" ? null : event.target.valueAsNumber);
                      }
                    : field.onChange
                }
                {...inputProps}
                id={inputId}
                className={cn("min-w-0 flex-1", className)}
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

export { RHFInput };

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
import { HelperText, Input, Label } from "@/components/ui/form-primitives";
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
                // A number input bound to `null` would warn about switching
                // between controlled and uncontrolled; empty string is the
                // correct "no value yet" for the DOM.
                value={field.value ?? ""}
                // The DOM always hands back a string. The schemas expect real
                // numbers (and `null` for "not disclosed"), so the conversion
                // belongs here rather than in every schema as a coercion —
                // coercion would make the form's input type diverge from the
                // action's output type.
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

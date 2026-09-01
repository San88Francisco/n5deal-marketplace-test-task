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
import { MultiSelect } from "@/components/ui/multi-select";
import { type SelectOption } from "@/types";
import { cn } from "@/utils/cn";

type RHFMultiSelectProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label?: ReactNode;
  options: SelectOption[];
  helperText?: ReactNode;
  warningText?: ReactNode;
  rules?: RegisterOptions<T, FieldPath<T>>;
  containerClassName?: string;
  columns?: 1 | 2;
  searchable?: boolean;
  emptyLabel?: string;
};

/**
 * Backs the mandate fields — jurisdictions, licence categories, business types,
 * asset features. The value is always a string array, which is exactly what the
 * Zod schema and the join tables expect.
 */
function RHFMultiSelect<T extends FieldValues>({
  name,
  label,
  options,
  helperText,
  warningText,
  rules,
  containerClassName,
  columns = 2,
  searchable = false,
  emptyLabel,
}: RHFMultiSelectProps<T>) {
  const { control } = useFormContext<T>();
  const fieldId = React.useId();

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
            {label != null && <Label htmlFor={fieldId}>{label}</Label>}
            <MultiSelect
              options={options}
              value={Array.isArray(field.value) ? field.value : []}
              onChange={field.onChange}
              columns={columns}
              searchable={searchable}
              emptyLabel={emptyLabel}
              invalid={hasError}
            />
            {message != null && <HelperText variant={helperVariant}>{message}</HelperText>}
          </div>
        );
      }}
    />
  );
}

export { RHFMultiSelect };

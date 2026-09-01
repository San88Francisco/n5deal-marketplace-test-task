"use client";

import type { FormHTMLAttributes, ReactNode } from "react";
import {
  type FieldValues,
  FormProvider,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";

type RHFFormProps<T extends FieldValues> = Omit<
  FormHTMLAttributes<HTMLFormElement>,
  "onSubmit"
> & {
  form: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
  children: ReactNode;
};

/**
 * Puts the form instance on context so every field below can find it by name,
 * instead of threading `control` through every component. `noValidate` hands
 * validation to Zod — the browser's own messages would contradict ours.
 */
function RHFForm<T extends FieldValues>({
  form,
  onSubmit,
  children,
  className = "space-y-4",
  ...props
}: RHFFormProps<T>) {
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={className} noValidate {...props}>
        {children}
      </form>
    </FormProvider>
  );
}

export { RHFForm };

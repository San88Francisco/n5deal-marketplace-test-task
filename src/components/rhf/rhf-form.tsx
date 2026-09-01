"use client";

import type { FormHTMLAttributes, ReactNode } from "react";
import {
  type FieldValues,
  FormProvider,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";

type RHFFormProps<T extends FieldValues> = Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit"> & {
  form: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
  children: ReactNode;
};

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

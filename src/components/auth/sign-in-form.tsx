"use client";

import Link from "next/link";
import { useActionState } from "react";

import { FieldError } from "@/components/ui/field-error";
import { FormAlert } from "@/components/ui/form-alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { ROUTES } from "@/routes";
import { signInAction } from "@/server/auth/actions";
import type { ActionState } from "@/types";
import { SIGN_IN_FIELDS } from "@/constants";

export function SignInForm() {
  const [state, action] = useActionState<ActionState, FormData>(signInAction, {});

  return (
    <form action={action} className="space-y-4">
      <FormAlert>{state.error}</FormAlert>

      {SIGN_IN_FIELDS.map((field) => (
        <div key={field.name}>
          <label className="label" htmlFor={field.name}>
            {field.label}
          </label>
          <input
            id={field.name}
            name={field.name}
            type={field.type}
            autoComplete={field.autoComplete}
            className="field"
            required
          />
          <FieldError errors={state.fieldErrors?.[field.name]} />
        </div>
      ))}

      <SubmitButton size="lg" className="w-full">
        Sign in
      </SubmitButton>

      <p className="text-center text-[13px] text-ink-500">
        No account yet?{" "}
        <Link href={ROUTES.auth.signUp()} className="font-medium text-navy-700 hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useActionState } from "react";

import { FieldError } from "@/components/ui/field-error";
import { FormAlert } from "@/components/ui/form-alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { SIGN_UP_ROLE_OPTIONS, SIGN_UP_FIELDS } from "@/constants";
import { ROUTES } from "@/routes";
import { signUpAction } from "@/server/auth/actions";
import type { ActionState, ContactableRole } from "@/types";

export function SignUpForm({ defaultRole }: { defaultRole?: ContactableRole }) {
  const [state, action] = useActionState<ActionState, FormData>(signUpAction, {});

  return (
    <form action={action} className="space-y-4">
      <FormAlert>{state.error}</FormAlert>

      <fieldset>
        <legend className="label">I am joining as</legend>

        <div className="grid grid-cols-2 gap-3">
          {SIGN_UP_ROLE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="cursor-pointer rounded-card border border-ink-200 bg-white p-3 transition-colors hover:border-navy-600 has-[:checked]:border-navy-900 has-[:checked]:bg-navy-900/[0.04] has-[:checked]:ring-1 has-[:checked]:ring-navy-900"
            >
              <input
                type="radio"
                name="role"
                value={option.value}
                defaultChecked={(defaultRole ?? SIGN_UP_ROLE_OPTIONS[0].value) === option.value}
                className="sr-only"
              />
              <span className="block text-[14px] font-medium text-ink-900">{option.title}</span>
              <span className="mt-0.5 block text-[12px] leading-snug text-ink-500">
                {option.hint}
              </span>
            </label>
          ))}
        </div>

        <FieldError errors={state.fieldErrors?.role} />
      </fieldset>

      {SIGN_UP_FIELDS.map((field) => (
        <div key={field.name}>
          <label className="label" htmlFor={`signup-${field.name}`}>
            {field.label}
          </label>
          <input
            id={`signup-${field.name}`}
            name={field.name}
            type={field.type}
            autoComplete={field.autoComplete}
            className="field"
            required
          />
          {field.hint && <p className="mt-1 text-[12px] text-ink-500">{field.hint}</p>}
          <FieldError errors={state.fieldErrors?.[field.name]} />
        </div>
      ))}

      <SubmitButton size="lg" className="w-full">
        Create account
      </SubmitButton>

      <p className="text-center text-[13px] text-ink-500">
        Already registered?{" "}
        <Link href={ROUTES.auth.signIn} className="font-medium text-navy-700 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

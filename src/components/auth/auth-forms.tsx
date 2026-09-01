"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { signInAction, signUpAction, type ActionState } from "@/server/auth/actions";
import { ROUTES } from "@/routes";
import { USER_ROLE } from "@/constants";
import type { ContactableRole } from "@/types";

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Working…" : children}
    </Button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="field-error">{errors[0]}</p>;
}

export function SignInForm() {
  const [state, action] = useActionState<ActionState, FormData>(signInAction, {});

  return (
    <form action={action} className="space-y-4">
      {state.error ? (
        <p className="rounded-md border border-critical-500/25 bg-critical-50 px-3 py-2 text-[13px] text-critical-700">
          {state.error}
        </p>
      ) : null}

      <div>
        <label className="label" htmlFor="email">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" className="field" required />
        <FieldError errors={state.fieldErrors?.email} />
      </div>

      <div>
        <label className="label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="field"
          required
        />
        <FieldError errors={state.fieldErrors?.password} />
      </div>

      <SubmitButton>Sign in</SubmitButton>

      <p className="text-center text-[13px] text-ink-500">
        No account yet?{" "}
        <Link href={ROUTES.auth.signUp()} className="font-medium text-navy-700 hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}

export function SignUpForm({ defaultRole }: { defaultRole?: ContactableRole }) {
  const [state, action] = useActionState<ActionState, FormData>(signUpAction, {});

  return (
    <form action={action} className="space-y-4">
      {state.error ? (
        <p className="rounded-md border border-critical-500/25 bg-critical-50 px-3 py-2 text-[13px] text-critical-700">
          {state.error}
        </p>
      ) : null}

      <fieldset>
        <legend className="label">I am joining as</legend>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { value: "BUYER", title: "Buyer", hint: "Looking to acquire a licensed company" },
              { value: "SELLER", title: "Seller", hint: "Listing a company or licence for sale" },
            ] as const
          ).map((option) => (
            <label
              key={option.value}
              className="group cursor-pointer rounded-card border border-ink-200 bg-white p-3 transition-colors hover:border-navy-600 has-[:checked]:border-navy-900 has-[:checked]:bg-navy-900/[0.04] has-[:checked]:ring-1 has-[:checked]:ring-navy-900"
            >
              <input
                type="radio"
                name="role"
                value={option.value}
                defaultChecked={(defaultRole ?? USER_ROLE.BUYER) === option.value}
                className="sr-only"
              />
              <span className="block text-[14px] font-medium text-ink-900">{option.title}</span>
              <span className="mt-0.5 block text-[12px] leading-snug text-ink-500">{option.hint}</span>
            </label>
          ))}
        </div>
        <FieldError errors={state.fieldErrors?.role} />
      </fieldset>

      <div>
        <label className="label" htmlFor="fullName">
          Full name
        </label>
        <input id="fullName" name="fullName" className="field" autoComplete="name" required />
        <FieldError errors={state.fieldErrors?.fullName} />
      </div>

      <div>
        <label className="label" htmlFor="signup-email">
          Work email
        </label>
        <input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          className="field"
          required
        />
        <FieldError errors={state.fieldErrors?.email} />
      </div>

      <div>
        <label className="label" htmlFor="signup-password">
          Password
        </label>
        <input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          className="field"
          required
        />
        <p className="mt-1 text-[12px] text-ink-500">At least 10 characters.</p>
        <FieldError errors={state.fieldErrors?.password} />
      </div>

      <SubmitButton>Create account</SubmitButton>

      <p className="text-center text-[13px] text-ink-500">
        Already registered?{" "}
        <Link href={ROUTES.auth.signIn} className="font-medium text-navy-700 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

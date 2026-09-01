"use client";

import { useState } from "react";

const ACCOUNTS = [
  {
    role: "Buyer",
    email: "buyer@n5deal.demo",
    who: "Nordway Capital — strategic buyer with an EMI mandate, an open thread and a watchlist",
  },
  {
    role: "Seller",
    email: "seller@n5deal.demo",
    who: "Baltic Licence Partners — verified seller with three listings, one of them a draft",
  },
  {
    role: "Platform manager",
    email: "manager@n5deal.demo",
    who: "Moderation console, with one suspended seller already in the audit trail",
  },
];

const PASSWORD = "n5deal-demo-2026";

/**
 * A reviewer should not have to read the README to get in. Clicking a row fills
 * the sign-in form, which is faster than copying two fields by hand.
 */
export function DemoAccounts() {
  const [copied, setCopied] = useState<string | null>(null);

  function fill(email: string) {
    const emailField = document.querySelector<HTMLInputElement>("#email");
    const passwordField = document.querySelector<HTMLInputElement>("#password");
    if (!emailField || !passwordField) return;

    // Native setters so React registers the change.
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )?.set;
    setter?.call(emailField, email);
    emailField.dispatchEvent(new Event("input", { bubbles: true }));
    setter?.call(passwordField, PASSWORD);
    passwordField.dispatchEvent(new Event("input", { bubbles: true }));

    setCopied(email);
  }

  return (
    <aside className="lg:pt-16">
      <div className="rounded-card border border-navy-800 bg-navy-950 p-6 text-white">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-300">
          Demo accounts
        </p>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-200">
          This is a prototype with seeded data. Pick a role to explore — every account uses the
          password{" "}
          <code className="rounded bg-navy-800 px-1.5 py-0.5 text-[13px] text-white">{PASSWORD}</code>
          .
        </p>

        <ul className="mt-5 space-y-2.5">
          {ACCOUNTS.map((account) => (
            <li key={account.email}>
              <button
                type="button"
                onClick={() => fill(account.email)}
                className="w-full rounded-md border border-navy-800 bg-navy-900 p-3.5 text-left transition-colors hover:border-accent-500/50 hover:bg-navy-800"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="text-[13.5px] font-medium text-white">{account.role}</span>
                  <span className="text-[11.5px] text-accent-300">
                    {copied === account.email ? "Filled in ↓" : "Use this"}
                  </span>
                </span>
                <span className="mt-1 block font-mono text-[12px] text-ink-300">
                  {account.email}
                </span>
                <span className="mt-1.5 block text-[12.5px] leading-snug text-ink-300">
                  {account.who}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

import * as React from "react";
import { CircleAlert, Check } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * The unstyled-ish building blocks the RHF wrappers compose.
 *
 * They are plain native controls rather than a headless-UI dependency: this app
 * needs correct labels, keyboard behaviour and validation states, all of which
 * the platform already gives us, and every kilobyte of client JS here would be
 * spent on a form a user fills in once.
 */

// ---------------------------------------------------------------------------

const helperTextVariants = cva("inline-flex items-start gap-1.5 text-[12.5px] leading-snug", {
  variants: {
    variant: {
      default: "text-ink-500",
      error: "text-critical-500",
      warning: "text-caution-700",
      success: "text-positive-700",
    },
  },
  defaultVariants: { variant: "default" },
});

export function HelperText({
  className,
  variant = "default",
  children,
  ...props
}: React.ComponentProps<"p"> & VariantProps<typeof helperTextVariants>) {
  return (
    <p
      className={cn(helperTextVariants({ variant }), className)}
      data-error-msg={variant === "error"}
      {...props}
    >
      {variant === "error" || variant === "warning" ? (
        <CircleAlert aria-hidden className="mt-[1px] h-3.5 w-3.5 shrink-0" />
      ) : null}
      <span>{children}</span>
    </p>
  );
}

// ---------------------------------------------------------------------------

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn(
        "inline-block w-fit cursor-pointer text-[13px] font-medium text-ink-700",
        className,
      )}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------

const controlClasses = cn(
  "w-full min-w-0 rounded-md border border-ink-200 bg-white px-3 text-[14px] text-ink-900 transition-colors",
  "placeholder:text-ink-300",
  "focus:border-navy-600 focus:outline-none focus:ring-1 focus:ring-navy-600",
  "aria-[invalid=true]:border-critical-500 aria-[invalid=true]:focus:ring-critical-500",
  "disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-500",
);

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => (
    <input ref={ref} data-slot="input" className={cn(controlClasses, "h-10", className)} {...props} />
  ),
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, rows = 4, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      data-slot="textarea"
      className={cn(controlClasses, "resize-y py-2 leading-relaxed", className)}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export type SelectOption = { value: string; label: string; disabled?: boolean };

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.ComponentProps<"select"> & { options: SelectOption[]; placeholder?: string }
>(({ className, options, placeholder, ...props }, ref) => (
  <select ref={ref} data-slot="select" className={cn(controlClasses, "h-10", className)} {...props}>
    {placeholder ? (
      <option value="" disabled>
        {placeholder}
      </option>
    ) : null}
    {options.map((option) => (
      <option key={option.value} value={option.value} disabled={option.disabled}>
        {option.label}
      </option>
    ))}
  </select>
));
Select.displayName = "Select";

// ---------------------------------------------------------------------------

export const Checkbox = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<"input">, "type">
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    type="checkbox"
    data-slot="checkbox"
    className={cn(
      "h-4 w-4 shrink-0 cursor-pointer rounded border-ink-300 accent-navy-900",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Checkbox.displayName = "Checkbox";

/** A checkbox styled as a switch — same semantics, different affordance. */
export const Switch = React.forwardRef<
  HTMLButtonElement,
  {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
    id?: string;
    className?: string;
    "aria-invalid"?: boolean;
    onBlur?: () => void;
  }
>(({ checked, onCheckedChange, disabled, id, className, onBlur, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    role="switch"
    id={id}
    aria-checked={checked}
    disabled={disabled}
    onBlur={onBlur}
    onClick={() => onCheckedChange(!checked)}
    className={cn(
      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors",
      checked ? "bg-navy-900" : "bg-ink-200",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <span
      className={cn(
        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
        checked ? "translate-x-[18px]" : "translate-x-[2px]",
      )}
    />
  </button>
));
Switch.displayName = "Switch";

// ---------------------------------------------------------------------------

/**
 * Multi-select as a scrollable list of checkboxes rather than a combobox.
 * Buyers pick jurisdictions and licence types in batches of five or six, and a
 * visible list makes the current selection reviewable at a glance — the thing a
 * token-based combobox tends to hide.
 */
export function MultiSelect({
  options,
  value,
  onChange,
  columns = 2,
  searchable = false,
  emptyLabel = "Nothing to choose from",
  invalid,
}: {
  options: SelectOption[];
  value: string[];
  onChange: (next: string[]) => void;
  columns?: 1 | 2;
  searchable?: boolean;
  emptyLabel?: string;
  invalid?: boolean;
}) {
  const [query, setQuery] = React.useState("");

  const visible = query
    ? options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  function toggle(candidate: string) {
    onChange(
      value.includes(candidate)
        ? value.filter((item) => item !== candidate)
        : [...value, candidate],
    );
  }

  return (
    <div
      className={cn(
        "rounded-md border bg-white",
        invalid ? "border-critical-500" : "border-ink-200",
      )}
    >
      {searchable ? (
        <div className="border-b border-ink-100 p-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter…"
            className="w-full rounded border border-ink-200 px-2 py-1 text-[13px] placeholder:text-ink-300 focus:border-navy-600 focus:outline-none"
          />
        </div>
      ) : null}

      {visible.length ? (
        <ul
          className={cn(
            "max-h-52 overflow-y-auto p-2",
            columns === 2 ? "grid grid-cols-1 gap-x-3 sm:grid-cols-2" : "space-y-0.5",
          )}
        >
          {visible.map((option) => {
            const active = value.includes(option.value);
            return (
              <li key={option.value}>
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-[13px] hover:bg-ink-50",
                    active ? "text-ink-900" : "text-ink-700",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-4 w-4 shrink-0 place-items-center rounded border transition-colors",
                      active ? "border-navy-900 bg-navy-900 text-white" : "border-ink-300 bg-white",
                    )}
                  >
                    {active ? <Check className="h-3 w-3" aria-hidden /> : null}
                  </span>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={active}
                    onChange={() => toggle(option.value)}
                  />
                  {option.label}
                </label>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="p-3 text-[13px] text-ink-300">{emptyLabel}</p>
      )}

      {value.length ? (
        <p className="border-t border-ink-100 px-3 py-1.5 text-[12px] text-ink-500">
          {value.length} selected
        </p>
      ) : null}
    </div>
  );
}

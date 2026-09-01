import type { ComponentProps, ReactNode } from "react";
import type { ControllerFieldState } from "react-hook-form";

import type { HelperText } from "@/components/ui/form-primitives";

/**
 * One rule for what a field shows underneath itself: an error wins over a
 * warning, a warning wins over the neutral hint, and nothing renders when there
 * is nothing to say. Keeping it here means every RHF field behaves identically.
 */
export const getFieldHelperState = (
  fieldState: ControllerFieldState,
  helperText?: ReactNode,
  warningText?: ReactNode,
) => {
  const hasError = Boolean(fieldState.error);
  const errorMessage = fieldState.error?.message;

  type Variant = NonNullable<ComponentProps<typeof HelperText>["variant"]>;

  const helperState =
    hasError && errorMessage
      ? "error"
      : warningText != null && !hasError
        ? "warning"
        : helperText != null && !hasError
          ? "default"
          : "none";

  const states: Record<string, { message?: ReactNode; helperVariant: Variant }> = {
    error: { message: errorMessage, helperVariant: "error" },
    warning: { message: warningText, helperVariant: "warning" },
    default: { message: helperText, helperVariant: "default" },
    none: { message: undefined, helperVariant: "default" },
  };

  return { hasError, ...states[helperState] };
};

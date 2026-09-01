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

  let message: ReactNode | undefined;
  let helperVariant: NonNullable<ComponentProps<typeof HelperText>["variant"]> = "default";

  const helperState =
    hasError && errorMessage
      ? "error"
      : warningText != null && !hasError
        ? "warning"
        : helperText != null && !hasError
          ? "default"
          : "none";

  switch (helperState) {
    case "error":
      message = errorMessage;
      helperVariant = "error";
      break;
    case "warning":
      message = warningText;
      helperVariant = "warning";
      break;
    case "default":
      message = helperText;
      helperVariant = "default";
      break;
    case "none":
      break;
  }

  return { hasError, message, helperVariant };
};

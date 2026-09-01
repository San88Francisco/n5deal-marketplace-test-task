/** Where each role belongs after signing in. */
export function landingFor(role: string): string {
  switch (role) {
    case "SELLER":
      return "/sell/listings";
    case "PLATFORM_MANAGER":
      return "/manage";
    default:
      return "/assets";
  }
}

/**
 * `JSON.parse` that yields `undefined` instead of throwing.
 *
 * Both callers feed the result straight into a Zod schema, which rejects
 * `undefined` anyway — so a malformed payload and an invalid one take the same
 * path, and neither needs a try/catch at the call site.
 */
export function safeJsonParse(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch {
    return undefined;
  }
}

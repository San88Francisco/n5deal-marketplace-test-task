/** URLSearchParams → a plain object, for the ROUTES query helpers. */
export const paramsToObject = (params: URLSearchParams): Record<string, string> =>
  Object.fromEntries(params.entries());

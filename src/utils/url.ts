export const paramsToObject = (params: URLSearchParams): Record<string, string> =>
  Object.fromEntries(params.entries());

export const toQueryRecord = (
  params: Record<string, string | string[] | undefined>,
): Record<string, string | undefined> =>
  Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      Array.isArray(value) ? value.join(",") : value,
    ]),
  );

export const ASSET_FORM_STEPS = [
  {
    title: "The asset",
    fields: ["title", "summary", "jurisdictionCode", "categoryCode", "businessType"],
  },
  {
    title: "Licence & financials",
    fields: [
      "licenceStatus",
      "regulator",
      "licenceIssuedYear",
      "yearEstablished",
      "askingPriceEur",
      "revenueEur",
      "ebitdaEur",
    ],
  },
  {
    title: "Detail",
    fields: ["description", "employees", "activeClients", "features", "reasonForSale"],
  },
] as const;

export const ASSET_YEAR_FIELDS = [
  { name: "licenceIssuedYear", label: "Licence issued (year)" },
  { name: "yearEstablished", label: "Company founded (year)" },
] as const;

export const ASSET_MONEY_FIELDS = [
  {
    name: "askingPriceEur",
    label: "Asking price (EUR)",
    helperText: "Leave empty to show the listing as price on request.",
  },
  { name: "revenueEur", label: "Revenue, last FY (EUR)", helperText: undefined },
  { name: "ebitdaEur", label: "EBITDA, last FY (EUR)", helperText: undefined },
] as const;

export const ASSET_COUNT_FIELDS = [
  { name: "employees", label: "Employees" },
  { name: "activeClients", label: "Active clients" },
] as const;

export const SIGN_IN_FIELDS = [
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "password", label: "Password", type: "password", autoComplete: "current-password" },
] as const;

export const SIGN_UP_FIELDS = [
  { name: "fullName", label: "Full name", type: "text", autoComplete: "name", hint: undefined },
  { name: "email", label: "Work email", type: "email", autoComplete: "email", hint: undefined },
  {
    name: "password",
    label: "Password",
    type: "password",
    autoComplete: "new-password",
    hint: "At least 10 characters.",
  },
] as const;

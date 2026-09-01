import type { BusinessType } from "@prisma/client";

export type BuyerSeed = {
  email: string;
  fullName: string;
  companyName: string;
  headline: string;
  about: string;
  country: string;
  investorType:
    | "STRATEGIC"
    | "PRIVATE_EQUITY"
    | "VENTURE_CAPITAL"
    | "FAMILY_OFFICE"
    | "ANGEL"
    | "CORPORATE"
    | "OTHER";
  ticketMinEur: number;
  ticketMaxEur: number;
  timeline: "IMMEDIATE" | "SHORT" | "MEDIUM" | "EXPLORING";
  wantsOperatingOnly: boolean;
  proofOfFundsReady: boolean;
  investmentThesis: string;
  isPublished?: boolean;
  targetJurisdictions: string[];
  targetCategories: string[];
  targetBusinessTypes: BusinessType[];
};

export const BUYERS: BuyerSeed[] = [
  {
    email: "buyer@n5deal.demo",
    fullName: "Jonas Petrauskas",
    companyName: "Nordway Capital",
    headline: "Acquiring an operating EU e-money institution to launch a SEPA product",
    about:
      "We are a payments operator with a live merchant book in the Nordics, currently riding on a third-party BIN sponsor. We want our own EMI to take the economics in-house.",
    country: "SE",
    investorType: "STRATEGIC",
    ticketMinEur: 800_000,
    ticketMaxEur: 3_500_000,
    timeline: "SHORT",
    wantsOperatingOnly: true,
    proofOfFundsReady: true,
    investmentThesis:
      "Must be a trading institution with existing safeguarding arrangements and at least one bank relationship. We will keep the compliance team. Lithuania or Malta preferred for passporting; we are not interested in shelf companies or licences still in application.",
    targetJurisdictions: ["LT", "MT", "IE", "EE"],
    targetCategories: ["EMI", "SEMI", "PI"],
    targetBusinessTypes: ["PAYMENT", "FINTECH"],
  },
  {
    email: "pe.buyer@n5deal.demo",
    fullName: "Charlotte Meyer",
    companyName: "Rhine Growth Partners",
    headline: "Buy-and-build across European payment institutions",
    about:
      "Lower mid-market fund executing a payments roll-up. Fourth acquisition in this thesis; we bring the platform, the target brings the licence and the book.",
    country: "DE",
    investorType: "PRIVATE_EQUITY",
    ticketMinEur: 2_000_000,
    ticketMaxEur: 15_000_000,
    timeline: "MEDIUM",
    wantsOperatingOnly: true,
    proofOfFundsReady: true,
    investmentThesis:
      "EBITDA-positive targets only, minimum EUR 1m revenue, ideally with a niche vertical. We avoid crypto exposure entirely for LP reasons.",
    targetJurisdictions: ["DE", "NL", "LU", "IE", "ES", "PL"],
    targetCategories: ["EMI", "PI", "INV"],
    targetBusinessTypes: ["PAYMENT", "FINTECH", "BANKING"],
  },
  {
    email: "crypto.buyer@n5deal.demo",
    fullName: "Aleksandr Kovalenko",
    companyName: "Meridian Digital Assets",
    headline: "MiCA-ready CASP licence in the EU, ready to move immediately",
    about:
      "Exchange operator with existing volume outside the EU, entering the bloc under MiCA. Speed matters more than price.",
    country: "AE",
    investorType: "CORPORATE",
    ticketMinEur: 300_000,
    ticketMaxEur: 2_500_000,
    timeline: "IMMEDIATE",
    wantsOperatingOnly: false,
    proofOfFundsReady: true,
    investmentThesis:
      "A clean CASP or VASP registration in any EU member state. We can work with a dormant entity provided the authorisation is current and there are no open regulatory findings.",
    targetJurisdictions: ["MT", "CY", "LT", "EE", "BG", "CZ"],
    targetCategories: ["CASP", "VASP"],
    targetBusinessTypes: ["CRYPTO"],
  },
  {
    email: "family.office@n5deal.demo",
    fullName: "Hiroshi Tanaka",
    companyName: "Kobayashi Family Office",
    headline: "APAC payment and remittance assets, patient capital",
    about:
      "Single-family office diversifying into regulated financial infrastructure across Asia-Pacific. No fixed exit horizon.",
    country: "JP",
    investorType: "FAMILY_OFFICE",
    ticketMinEur: 500_000,
    ticketMaxEur: 6_000_000,
    timeline: "EXPLORING",
    wantsOperatingOnly: false,
    proofOfFundsReady: false,
    investmentThesis:
      "Remittance corridors between Japan, Hong Kong and Southeast Asia. We value an existing customer base and banking relationships far above the licence itself.",
    targetJurisdictions: ["HK", "SG", "JP", "AU"],
    targetCategories: ["MSO", "PI", "MTL"],
    targetBusinessTypes: ["PAYMENT", "FINTECH"],
  },
  {
    email: "uk.buyer@n5deal.demo",
    fullName: "Olivia Grant",
    companyName: "Grant & Fell Holdings",
    headline: "UK small EMI or API for an embedded finance play",
    about:
      "Founder-led group building embedded payments for the UK construction sector. We need our own permissions before our first enterprise contract goes live.",
    country: "GB",
    investorType: "STRATEGIC",
    ticketMinEur: 150_000,
    ticketMaxEur: 900_000,
    timeline: "IMMEDIATE",
    wantsOperatingOnly: false,
    proofOfFundsReady: true,
    investmentThesis:
      "Small EMI or authorised payment institution in the UK or Gibraltar. A clean regulatory record matters more than revenue; we bring our own volume.",
    targetJurisdictions: ["GB", "GI", "IE"],
    targetCategories: ["SEMI", "PI", "SPI", "EMI"],
    targetBusinessTypes: ["FINTECH", "PAYMENT"],
  },
  {
    email: "vc.buyer@n5deal.demo",
    fullName: "Marco Rossi",
    companyName: "Aperture Ventures",
    headline: "Opportunistic fintech infrastructure, broad mandate",
    about:
      "Early-stage fund that occasionally acquires regulatory infrastructure for portfolio companies.",
    country: "IT",
    investorType: "VENTURE_CAPITAL",
    ticketMinEur: 200_000,
    ticketMaxEur: 1_200_000,
    timeline: "EXPLORING",
    wantsOperatingOnly: false,
    proofOfFundsReady: false,
    investmentThesis:
      "No fixed mandate. We look at anything with a credible path to authorisation.",
    targetJurisdictions: ["ES", "PL", "CZ", "BG", "LT"],
    targetCategories: ["PI", "SPI", "SEMI"],
    targetBusinessTypes: [],
  },
  {
    email: "private.buyer@n5deal.demo",
    fullName: "Nadia Haddad",
    companyName: "Levant Capital Partners",
    headline: "Gulf-to-Europe payment corridor, profile kept private",
    about:
      "Investment vehicle acquiring payment infrastructure connecting the Gulf to the EU. Profile intentionally unlisted while a live process is running.",
    country: "AE",
    investorType: "PRIVATE_EQUITY",
    ticketMinEur: 1_000_000,
    ticketMaxEur: 8_000_000,
    timeline: "SHORT",
    wantsOperatingOnly: true,
    proofOfFundsReady: true,
    investmentThesis: "EU payment institution with existing MENA corridor volume.",
    isPublished: false,
    targetJurisdictions: ["LU", "NL", "MT", "CY"],
    targetCategories: ["EMI", "PI"],
    targetBusinessTypes: ["PAYMENT"],
  },
];

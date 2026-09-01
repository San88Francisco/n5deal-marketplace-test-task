/**
 * Demo data for the N5Deal prototype.
 *
 * The goal is not volume, it is coverage: every role, every listing state,
 * every moderation outcome and a few deliberately awkward records (a price on
 * request, a dormant shell, a suspended seller) so the flows can be judged
 * without hand-crafting data first.
 *
 * Run with: npm run db:seed
 */

import { PrismaClient, type BusinessType, type AssetFeatureCode } from "@prisma/client";
import bcrypt from "bcryptjs";

import { BCRYPT_ROUNDS, DEMO_PASSWORD } from "../src/constants";

const prisma = new PrismaClient();


const JURISDICTIONS = [
  { code: "LT", name: "Lithuania", region: "EU" },
  { code: "MT", name: "Malta", region: "EU" },
  { code: "CY", name: "Cyprus", region: "EU" },
  { code: "IE", name: "Ireland", region: "EU" },
  { code: "NL", name: "Netherlands", region: "EU" },
  { code: "LU", name: "Luxembourg", region: "EU" },
  { code: "EE", name: "Estonia", region: "EU" },
  { code: "LV", name: "Latvia", region: "EU" },
  { code: "PL", name: "Poland", region: "EU" },
  { code: "CZ", name: "Czechia", region: "EU" },
  { code: "BG", name: "Bulgaria", region: "EU" },
  { code: "ES", name: "Spain", region: "EU" },
  { code: "DE", name: "Germany", region: "EU" },
  { code: "FR", name: "France", region: "EU" },
  { code: "SE", name: "Sweden", region: "EU" },
  { code: "DK", name: "Denmark", region: "EU" },
  { code: "NO", name: "Norway", region: "EEA" },
  { code: "IS", name: "Iceland", region: "EEA" },
  { code: "LI", name: "Liechtenstein", region: "EEA" },
  { code: "CH", name: "Switzerland", region: "EEA" },
  { code: "GB", name: "United Kingdom", region: "UK" },
  { code: "GI", name: "Gibraltar", region: "UK" },
  { code: "JE", name: "Jersey", region: "OFFSHORE" },
  { code: "IM", name: "Isle of Man", region: "OFFSHORE" },
  { code: "KY", name: "Cayman Islands", region: "OFFSHORE" },
  { code: "BVI", name: "British Virgin Islands", region: "OFFSHORE" },
  { code: "HK", name: "Hong Kong", region: "APAC" },
  { code: "SG", name: "Singapore", region: "APAC" },
  { code: "AU", name: "Australia", region: "APAC" },
  { code: "NZ", name: "New Zealand", region: "APAC" },
  { code: "JP", name: "Japan", region: "APAC" },
  { code: "AE", name: "United Arab Emirates", region: "MENA" },
  { code: "BH", name: "Bahrain", region: "MENA" },
  { code: "US", name: "United States", region: "NORTH_AMERICA" },
  { code: "CA", name: "Canada", region: "NORTH_AMERICA" },
  { code: "MX", name: "Mexico", region: "LATAM" },
  { code: "BR", name: "Brazil", region: "LATAM" },
  { code: "PA", name: "Panama", region: "LATAM" },
];

const CATEGORIES = [
  { code: "EMI", name: "Electronic Money Institution", description: "Full e-money issuance and payment accounts." },
  { code: "SEMI", name: "Small EMI", description: "Volume-capped e-money licence." },
  { code: "PI", name: "Payment Institution", description: "Payment services without e-money issuance." },
  { code: "SPI", name: "Small Payment Institution", description: "Volume-capped payment institution." },
  { code: "BANK", name: "Banking Licence", description: "Full credit institution." },
  { code: "CASP", name: "Crypto-Asset Service Provider", description: "MiCA-scope crypto services." },
  { code: "VASP", name: "Virtual Asset Service Provider", description: "Pre-MiCA / non-EU crypto registration." },
  { code: "MSO", name: "Money Service Operator", description: "Hong Kong remittance and currency exchange." },
  { code: "MTL", name: "Money Transmitter Licence", description: "US state-level money transmission." },
  { code: "INV", name: "Investment Firm", description: "MiFID II investment services." },
  { code: "FX", name: "FX / CFD Brokerage", description: "Retail and institutional FX brokerage." },
  { code: "INSUR", name: "Insurance Intermediary", description: "Insurance distribution licence." },
];

type SellerSeed = {
  email: string;
  fullName: string;
  companyName: string;
  headline: string;
  about: string;
  country: string;
  sellerType: "OWNER" | "BROKER" | "ADVISORY_FIRM";
  isVerified: boolean;
  operatesIn: string[];
  status?: "ACTIVE" | "SUSPENDED";
  statusReason?: string;
};

const SELLERS: SellerSeed[] = [
  {
    email: "seller@n5deal.demo",
    fullName: "Marta Kazlauskienė",
    companyName: "Baltic Licence Partners",
    headline: "Owner-side advisory for Baltic EMI and PI disposals",
    about:
      "We hold and operate three payment entities in Lithuania and Estonia and periodically bring them to market. Every entity we list has been through an internal audit and a regulator-facing readiness review.",
    country: "LT",
    sellerType: "OWNER",
    isVerified: true,
    operatesIn: ["LT", "EE", "LV"],
  },
  {
    email: "broker.hk@n5deal.demo",
    fullName: "Daniel Cheung",
    companyName: "Harbour Ridge Advisory",
    headline: "Hong Kong MSO and APAC payment licence brokerage",
    about:
      "Boutique brokerage focused on Hong Kong MSO transfers and Singapore MPI introductions. We handle regulator notification and the change-of-control filing end to end.",
    country: "HK",
    sellerType: "BROKER",
    isVerified: true,
    operatesIn: ["HK", "SG", "AU"],
  },
  {
    email: "advisory.uk@n5deal.demo",
    fullName: "Priya Raman",
    companyName: "Thames Regulatory Advisory",
    headline: "UK and Gibraltar authorisations, disposals and wind-downs",
    about:
      "We advise founders through FCA change-in-control and represent sellers of small EMIs and API firms. Twelve completed transfers since 2021.",
    country: "GB",
    sellerType: "ADVISORY_FIRM",
    isVerified: true,
    operatesIn: ["GB", "GI", "IE"],
  },
  {
    email: "malta.owner@n5deal.demo",
    fullName: "Andrea Bugeja",
    companyName: "Valletta Fintech Holdings",
    headline: "Malta-based crypto and payment entities",
    about:
      "Holding company divesting two MFSA-supervised entities following a group restructuring. Both entities retain their compliance teams.",
    country: "MT",
    sellerType: "OWNER",
    isVerified: false,
    operatesIn: ["MT", "CY"],
  },
  {
    email: "flagged.seller@n5deal.demo",
    fullName: "Victor Salazar",
    companyName: "Offshore Quick Licences",
    headline: "Fast licence transfers, no due diligence needed",
    about:
      "Guaranteed approval in 48 hours, no source of funds questions asked. Cash only.",
    country: "PA",
    sellerType: "BROKER",
    isVerified: false,
    operatesIn: ["PA", "BVI"],
    status: "SUSPENDED",
    statusReason:
      "Listing copy promises regulatory approval and explicitly waives source-of-funds checks. Suspended pending compliance review.",
  },
];

type BuyerSeed = {
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

const BUYERS: BuyerSeed[] = [
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
    investmentThesis: "No fixed mandate. We look at anything with a credible path to authorisation.",
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

type AssetSeed = {
  sellerEmail: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  jurisdictionCode: string;
  categoryCode: string;
  businessType: BusinessType;
  askingPriceEur: number | null;
  revenueEur: number | null;
  ebitdaEur: number | null;
  licenceStatus: "ACTIVE" | "IN_APPLICATION" | "DORMANT";
  regulator: string | null;
  licenceIssuedYear: number | null;
  yearEstablished: number | null;
  employees: number | null;
  activeClients: number | null;
  hasPassporting: boolean;
  reasonForSale: string | null;
  status: "DRAFT" | "PUBLISHED" | "UNDER_OFFER" | "SOLD" | "SUSPENDED" | "ARCHIVED";
  isValidated: boolean;
  viewCount: number;
  features: AssetFeatureCode[];
};

const ASSETS: AssetSeed[] = [
  {
    sellerEmail: "seller@n5deal.demo",
    slug: "lithuanian-emi-full-passporting-since-2019",
    title: "Lithuanian EMI with full EEA passporting, trading since 2019",
    summary:
      "Bank of Lithuania authorised e-money institution with safeguarding in place, 4,200 active business clients and two IBAN providers.",
    description:
      "An operating electronic money institution authorised by the Bank of Lithuania in 2019. The company issues e-money, provides payment accounts with dedicated IBANs and operates SEPA Instant through a partner bank.\n\nThe entity passports into 14 EEA member states. Safeguarding accounts are held with two credit institutions. The compliance function is fully staffed with an MLRO approved by the regulator, and the team of eleven is expected to transfer with the business.\n\nThe last supervisory review closed without findings. Audited accounts for the past three financial years are available in the data room once an NDA is signed.",
    jurisdictionCode: "LT",
    categoryCode: "EMI",
    businessType: "PAYMENT",
    askingPriceEur: 2_400_000,
    revenueEur: 1_850_000,
    ebitdaEur: 410_000,
    licenceStatus: "ACTIVE",
    regulator: "Bank of Lithuania",
    licenceIssuedYear: 2019,
    yearEstablished: 2018,
    employees: 11,
    activeClients: 4_200,
    hasPassporting: true,
    reasonForSale:
      "The shareholder group is consolidating around its Nordic entity and is divesting the Baltic operation.",
    status: "PUBLISHED",
    isValidated: true,
    viewCount: 341,
    features: ["STAFF", "OFFICE", "BANK_ACCOUNTS", "MULTI_CURRENCY", "SOFTWARE_PLATFORM", "CLIENT_BASE"],
  },
  {
    sellerEmail: "seller@n5deal.demo",
    slug: "estonian-payment-institution-clean-shell",
    title: "Estonian payment institution, authorised and clean, no trading history",
    summary:
      "Authorised PI with no legacy clients and no operating history. Ready for a buyer who brings their own volume.",
    description:
      "A payment institution authorised by Finantsinspektsioon. The company has never onboarded clients, has no outstanding liabilities and has been maintained in good standing since authorisation.\n\nThis is a licence-only transaction. There is no team, no platform and no customer base — the value is the authorisation and the clean regulatory record. Suitable for a buyer with an existing product who needs permissions quickly.",
    jurisdictionCode: "EE",
    categoryCode: "PI",
    businessType: "PAYMENT",
    askingPriceEur: 620_000,
    revenueEur: 0,
    ebitdaEur: -45_000,
    licenceStatus: "DORMANT",
    regulator: "Finantsinspektsioon",
    licenceIssuedYear: 2022,
    yearEstablished: 2021,
    employees: 0,
    activeClients: 0,
    hasPassporting: true,
    reasonForSale: "Authorised for a product line the group ultimately did not launch.",
    status: "PUBLISHED",
    isValidated: true,
    viewCount: 188,
    features: ["BANK_ACCOUNTS"],
  },
  {
    sellerEmail: "broker.hk@n5deal.demo",
    slug: "hong-kong-mso-remittance-operating-since-2018",
    title: "Operating Hong Kong MSO with remittance and currency exchange since 2018",
    summary:
      "Customs & Excise licensed money service operator, profitable, with corridors into mainland China and Southeast Asia.",
    description:
      "A money service operator licensed by the Hong Kong Customs & Excise Department, trading continuously since 2018. The business runs both remittance and currency exchange, with established corridors into mainland China, the Philippines and Vietnam.\n\nThe company holds accounts with two Hong Kong banks — the single hardest thing to replicate for a new entrant. Office premises in Kwun Tong and six staff, including a licensed compliance officer, transfer with the business.",
    jurisdictionCode: "HK",
    categoryCode: "MSO",
    businessType: "PAYMENT",
    askingPriceEur: 1_150_000,
    revenueEur: 940_000,
    ebitdaEur: 265_000,
    licenceStatus: "ACTIVE",
    regulator: "Customs & Excise Department",
    licenceIssuedYear: 2018,
    yearEstablished: 2017,
    employees: 6,
    activeClients: 1_150,
    hasPassporting: false,
    reasonForSale: "The founder is retiring and has no succession within the family.",
    status: "PUBLISHED",
    isValidated: true,
    viewCount: 512,
    features: ["STAFF", "OFFICE", "BANK_ACCOUNTS", "MULTI_CURRENCY", "CLIENT_BASE"],
  },
  {
    sellerEmail: "broker.hk@n5deal.demo",
    slug: "singapore-major-payment-institution-in-application",
    title: "Singapore Major Payment Institution application at advanced stage",
    summary:
      "MAS application filed, first round of queries answered. Buyer steps into a live process rather than starting from zero.",
    description:
      "A Major Payment Institution application with the Monetary Authority of Singapore, filed and progressed through the first round of regulatory queries. The corporate vehicle, capital and appointed officers are in place.\n\nThe buyer assumes an application roughly nine months ahead of a fresh filing. Approval is not guaranteed and the sale is priced accordingly — this is explicitly a licence in application, not an authorised entity.",
    jurisdictionCode: "SG",
    categoryCode: "PI",
    businessType: "FINTECH",
    askingPriceEur: null,
    revenueEur: null,
    ebitdaEur: null,
    licenceStatus: "IN_APPLICATION",
    regulator: "Monetary Authority of Singapore",
    licenceIssuedYear: null,
    yearEstablished: 2023,
    employees: 2,
    activeClients: 0,
    hasPassporting: false,
    reasonForSale: "The sponsoring group changed its regional strategy mid-application.",
    status: "PUBLISHED",
    isValidated: false,
    viewCount: 97,
    features: ["OFFICE"],
  },
  {
    sellerEmail: "advisory.uk@n5deal.demo",
    slug: "uk-small-emi-fca-authorised-embedded-finance",
    title: "UK small electronic money institution, FCA authorised, embedded finance ready",
    summary:
      "Small EMI with a clean FCA record, modest volumes and an API-first platform already integrated with a UK card issuer.",
    description:
      "A small electronic money institution authorised by the Financial Conduct Authority. Volumes sit comfortably within the small EMI threshold, and the company has a clean supervisory history with no enforcement or past business reviews.\n\nThe technology stack is API-first and already integrated with a UK card issuing processor, which makes this a fast route to market for an embedded finance proposition. Two of the four staff are willing to stay through a transition period.",
    jurisdictionCode: "GB",
    categoryCode: "SEMI",
    businessType: "FINTECH",
    askingPriceEur: 780_000,
    revenueEur: 310_000,
    ebitdaEur: 40_000,
    licenceStatus: "ACTIVE",
    regulator: "Financial Conduct Authority",
    licenceIssuedYear: 2021,
    yearEstablished: 2020,
    employees: 4,
    activeClients: 380,
    hasPassporting: false,
    reasonForSale: "The founders are focusing on a separate lending business.",
    status: "PUBLISHED",
    isValidated: true,
    viewCount: 428,
    features: ["STAFF", "SOFTWARE_PLATFORM", "PAYMENT_RAILS", "CLIENT_BASE", "SECURITY_AUDIT"],
  },
  {
    sellerEmail: "advisory.uk@n5deal.demo",
    slug: "gibraltar-vasp-registration-with-banking",
    title: "Gibraltar DLT provider registration with active banking relationships",
    summary:
      "GFSC-registered distributed ledger technology provider, operational, with two European banking relationships in place.",
    description:
      "A distributed ledger technology provider registered with the Gibraltar Financial Services Commission. The entity is operational, files regularly and maintains two European banking relationships — unusual for the sector and a large part of the value here.\n\nThe buyer should expect a change-in-control process with the GFSC taking approximately four months.",
    jurisdictionCode: "GI",
    categoryCode: "VASP",
    businessType: "CRYPTO",
    askingPriceEur: 1_650_000,
    revenueEur: 720_000,
    ebitdaEur: 150_000,
    licenceStatus: "ACTIVE",
    regulator: "Gibraltar Financial Services Commission",
    licenceIssuedYear: 2020,
    yearEstablished: 2019,
    employees: 7,
    activeClients: 2_400,
    hasPassporting: false,
    reasonForSale: "Group consolidation into a single MiCA entity in the EU.",
    status: "PUBLISHED",
    isValidated: true,
    viewCount: 603,
    features: ["STAFF", "BANK_ACCOUNTS", "MULTI_CURRENCY", "SOFTWARE_PLATFORM", "CLIENT_BASE"],
  },
  {
    sellerEmail: "malta.owner@n5deal.demo",
    slug: "malta-casp-mica-authorised-exchange",
    title: "Malta CASP authorised under MiCA, exchange and custody permissions",
    summary:
      "MFSA-authorised crypto-asset service provider with exchange and custody permissions under the MiCA regime.",
    description:
      "A crypto-asset service provider authorised by the Malta Financial Services Authority under MiCA, holding permissions for exchange of crypto-assets for funds and for custody and administration on behalf of clients.\n\nThe entity has a functioning compliance framework, an approved MLRO and completed its first full MiCA reporting cycle. Passporting notifications have been filed for six member states.",
    jurisdictionCode: "MT",
    categoryCode: "CASP",
    businessType: "CRYPTO",
    askingPriceEur: 2_100_000,
    revenueEur: 1_050_000,
    ebitdaEur: 180_000,
    licenceStatus: "ACTIVE",
    regulator: "Malta Financial Services Authority",
    licenceIssuedYear: 2025,
    yearEstablished: 2021,
    employees: 9,
    activeClients: 5_800,
    hasPassporting: true,
    reasonForSale: "Shareholder restructuring following a group merger.",
    status: "PUBLISHED",
    isValidated: false,
    viewCount: 776,
    features: ["STAFF", "OFFICE", "MULTI_CURRENCY", "SOFTWARE_PLATFORM", "CLIENT_BASE", "SECURITY_AUDIT"],
  },
  {
    sellerEmail: "malta.owner@n5deal.demo",
    slug: "cyprus-investment-firm-mifid-cysec",
    title: "Cyprus investment firm with MiFID permissions, CySEC supervised",
    summary:
      "CIF licence covering reception and transmission of orders, execution and portfolio management. Price on request.",
    description:
      "A Cyprus investment firm supervised by CySEC, holding MiFID permissions for reception and transmission of orders, execution of orders on behalf of clients, and portfolio management.\n\nThe firm has an established institutional client base and passports across the EU. Pricing is on request and will depend on whether the buyer takes the client book or the licence alone.",
    jurisdictionCode: "CY",
    categoryCode: "INV",
    businessType: "FOREX",
    askingPriceEur: null,
    revenueEur: 2_300_000,
    ebitdaEur: 520_000,
    licenceStatus: "ACTIVE",
    regulator: "CySEC",
    licenceIssuedYear: 2017,
    yearEstablished: 2016,
    employees: 18,
    activeClients: 890,
    hasPassporting: true,
    reasonForSale: "Owners exiting the CFD sector entirely.",
    status: "PUBLISHED",
    isValidated: true,
    viewCount: 254,
    features: ["STAFF", "OFFICE", "BANK_ACCOUNTS", "CLIENT_BASE"],
  },
  {
    sellerEmail: "seller@n5deal.demo",
    slug: "latvian-payment-institution-under-offer",
    title: "Latvian payment institution with Baltic merchant acquiring book",
    summary:
      "Operating PI with an acquiring book across the Baltics. Currently under offer, exclusivity ends next month.",
    description:
      "A payment institution licensed by Latvijas Banka with an established merchant acquiring book across Latvia, Lithuania and Estonia.\n\nThe asset is currently under offer with exclusivity running to the end of the month. Back-up offers are being recorded in case the process does not complete.",
    jurisdictionCode: "LV",
    categoryCode: "PI",
    businessType: "PAYMENT",
    askingPriceEur: 1_900_000,
    revenueEur: 1_400_000,
    ebitdaEur: 320_000,
    licenceStatus: "ACTIVE",
    regulator: "Latvijas Banka",
    licenceIssuedYear: 2020,
    yearEstablished: 2019,
    employees: 8,
    activeClients: 640,
    hasPassporting: true,
    reasonForSale: "Founder exit.",
    status: "UNDER_OFFER",
    isValidated: true,
    viewCount: 389,
    features: ["STAFF", "BANK_ACCOUNTS", "PAYMENT_RAILS", "CLIENT_BASE"],
  },
  {
    sellerEmail: "advisory.uk@n5deal.demo",
    slug: "irish-emi-sold-2025",
    title: "Irish e-money institution with SEPA and card issuing",
    summary: "Central Bank of Ireland authorised EMI. Transaction completed — retained for reference.",
    description:
      "An electronic money institution authorised by the Central Bank of Ireland with SEPA access and a card issuing programme. This transaction has completed; the listing is retained so that comparable pricing stays visible to the market.",
    jurisdictionCode: "IE",
    categoryCode: "EMI",
    businessType: "PAYMENT",
    askingPriceEur: 4_200_000,
    revenueEur: 3_100_000,
    ebitdaEur: 740_000,
    licenceStatus: "ACTIVE",
    regulator: "Central Bank of Ireland",
    licenceIssuedYear: 2018,
    yearEstablished: 2017,
    employees: 22,
    activeClients: 9_400,
    hasPassporting: true,
    reasonForSale: "Strategic exit.",
    status: "SOLD",
    isValidated: true,
    viewCount: 1_204,
    features: ["STAFF", "OFFICE", "BANK_ACCOUNTS", "MULTI_CURRENCY", "SOFTWARE_PLATFORM", "PAYMENT_RAILS", "CLIENT_BASE"],
  },
  {
    sellerEmail: "broker.hk@n5deal.demo",
    slug: "australian-afsl-remittance-draft",
    title: "Australian remittance business with AUSTRAC registration",
    summary: "Draft listing — financials still being confirmed with the seller.",
    description:
      "An AUSTRAC-registered remittance network provider operating corridors into the Pacific. The seller is still assembling audited figures, so this listing has not been published yet.",
    jurisdictionCode: "AU",
    categoryCode: "MTL",
    businessType: "PAYMENT",
    askingPriceEur: 480_000,
    revenueEur: null,
    ebitdaEur: null,
    licenceStatus: "ACTIVE",
    regulator: "AUSTRAC",
    licenceIssuedYear: 2019,
    yearEstablished: 2018,
    employees: 3,
    activeClients: 210,
    hasPassporting: false,
    reasonForSale: "Owner relocating.",
    status: "DRAFT",
    isValidated: false,
    viewCount: 0,
    features: ["CLIENT_BASE"],
  },
  {
    sellerEmail: "flagged.seller@n5deal.demo",
    slug: "panama-financial-licence-fast-transfer",
    title: "Panama financial licence, guaranteed transfer in 48 hours",
    summary: "Removed from the marketplace by a platform manager.",
    description:
      "Fast licence transfer with no due diligence requirements and no source of funds documentation. Payment in cash or crypto accepted.",
    jurisdictionCode: "PA",
    categoryCode: "VASP",
    businessType: "OTHER",
    askingPriceEur: 95_000,
    revenueEur: null,
    ebitdaEur: null,
    licenceStatus: "DORMANT",
    regulator: null,
    licenceIssuedYear: 2023,
    yearEstablished: 2023,
    employees: 0,
    activeClients: 0,
    hasPassporting: false,
    reasonForSale: null,
    status: "SUSPENDED",
    isValidated: false,
    viewCount: 46,
    features: [],
  },
  {
    sellerEmail: "seller@n5deal.demo",
    slug: "polish-small-payment-institution-fintech",
    title: "Polish small payment institution serving e-commerce merchants",
    summary:
      "KNF-registered small payment institution with an e-commerce merchant base and an in-house checkout product.",
    description:
      "A small payment institution registered with the Polish Financial Supervision Authority, serving mid-sized e-commerce merchants with an in-house checkout and reconciliation product.\n\nVolumes are approaching the small payment institution threshold, so the natural next step for a buyer is a full authorisation — the groundwork for that filing has already been prepared.",
    jurisdictionCode: "PL",
    categoryCode: "SPI",
    businessType: "FINTECH",
    askingPriceEur: 540_000,
    revenueEur: 380_000,
    ebitdaEur: 62_000,
    licenceStatus: "ACTIVE",
    regulator: "KNF",
    licenceIssuedYear: 2021,
    yearEstablished: 2020,
    employees: 5,
    activeClients: 310,
    hasPassporting: false,
    reasonForSale: "The team wants to focus on software rather than regulated operations.",
    status: "PUBLISHED",
    isValidated: false,
    viewCount: 172,
    features: ["STAFF", "SOFTWARE_PLATFORM", "CLIENT_BASE"],
  },
  {
    sellerEmail: "malta.owner@n5deal.demo",
    slug: "bulgarian-emi-with-multicurrency-iban",
    title: "Bulgarian EMI issuing multi-currency IBANs across the EEA",
    summary:
      "BNB authorised e-money institution with multi-currency IBAN issuance and a corporate client base.",
    description:
      "An electronic money institution authorised by the Bulgarian National Bank, issuing multi-currency IBANs to corporate clients across the EEA under passporting.\n\nThe operation is lean and profitable, with a compliance team of three and an outsourced technology stack that transfers with the entity.",
    jurisdictionCode: "BG",
    categoryCode: "EMI",
    businessType: "PAYMENT",
    askingPriceEur: 1_320_000,
    revenueEur: 860_000,
    ebitdaEur: 195_000,
    licenceStatus: "ACTIVE",
    regulator: "Bulgarian National Bank",
    licenceIssuedYear: 2020,
    yearEstablished: 2019,
    employees: 6,
    activeClients: 1_900,
    hasPassporting: true,
    reasonForSale: "Shareholder liquidity event.",
    status: "PUBLISHED",
    isValidated: true,
    viewCount: 311,
    features: ["STAFF", "BANK_ACCOUNTS", "MULTI_CURRENCY", "CLIENT_BASE"],
  },
  {
    sellerEmail: "advisory.uk@n5deal.demo",
    slug: "uae-payment-services-provider-adgm",
    title: "ADGM payment services provider with regional corridor volume",
    summary:
      "FSRA-regulated payment services provider in Abu Dhabi Global Market with live Gulf-to-Europe corridors.",
    description:
      "A payment services provider regulated by the Financial Services Regulatory Authority in ADGM, running live corridors between the Gulf and Europe.\n\nThe business is majority corporate flow, with the top five clients accounting for roughly 40% of volume — a concentration a buyer should price in.",
    jurisdictionCode: "AE",
    categoryCode: "PI",
    businessType: "PAYMENT",
    askingPriceEur: 3_400_000,
    revenueEur: 2_050_000,
    ebitdaEur: 480_000,
    licenceStatus: "ACTIVE",
    regulator: "ADGM FSRA",
    licenceIssuedYear: 2021,
    yearEstablished: 2020,
    employees: 14,
    activeClients: 420,
    hasPassporting: false,
    reasonForSale: "Founders exiting to focus on an asset management venture.",
    status: "PUBLISHED",
    isValidated: true,
    viewCount: 495,
    features: ["STAFF", "OFFICE", "BANK_ACCOUNTS", "MULTI_CURRENCY", "PAYMENT_RAILS", "CLIENT_BASE"],
  },
];

async function main() {
  console.log("Resetting demo data...");

  // Order matters: children first, then parents, then the taxonomy.
  await prisma.moderationAction.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.favourite.deleteMany();
  await prisma.assetFeature.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.buyerTargetJurisdiction.deleteMany();
  await prisma.buyerTargetCategory.deleteMany();
  await prisma.buyerTargetBusinessType.deleteMany();
  await prisma.buyerProfile.deleteMany();
  await prisma.sellerJurisdiction.deleteMany();
  await prisma.sellerProfile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.licenceCategory.deleteMany();
  await prisma.jurisdiction.deleteMany();

  console.log("Seeding taxonomy...");
  await prisma.jurisdiction.createMany({ data: JURISDICTIONS });
  await prisma.licenceCategory.createMany({ data: CATEGORIES });

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, BCRYPT_ROUNDS);

  console.log("Seeding platform managers...");
  const manager = await prisma.user.create({
    data: {
      email: "manager@n5deal.demo",
      passwordHash,
      fullName: "Ines Duarte",
      role: "PLATFORM_MANAGER",
    },
  });

  console.log("Seeding sellers...");
  const sellerRows = await Promise.all(
    SELLERS.map((seller) =>
      prisma.user.create({
        data: {
          email: seller.email,
          passwordHash,
          fullName: seller.fullName,
          role: "SELLER",
          status: seller.status ?? "ACTIVE",
          statusReason: seller.statusReason,
          sellerProfile: {
            create: {
              companyName: seller.companyName,
              headline: seller.headline,
              about: seller.about,
              country: seller.country,
              sellerType: seller.sellerType,
              isVerified: seller.isVerified,
              operatesIn: {
                create: seller.operatesIn.map((code) => ({ jurisdictionCode: code })),
              },
            },
          },
        },
      }),
    ),
  );
  const sellersByEmail = new Map(sellerRows.map((user) => [user.email, user.id]));

  console.log("Seeding buyers...");
  const buyerRows = await Promise.all(
    BUYERS.map((buyer) =>
      prisma.user.create({
        data: {
          email: buyer.email,
          passwordHash,
          fullName: buyer.fullName,
          role: "BUYER",
          buyerProfile: {
            create: {
              companyName: buyer.companyName,
              headline: buyer.headline,
              about: buyer.about,
              country: buyer.country,
              investorType: buyer.investorType,
              ticketMinEur: buyer.ticketMinEur,
              ticketMaxEur: buyer.ticketMaxEur,
              timeline: buyer.timeline,
              wantsOperatingOnly: buyer.wantsOperatingOnly,
              proofOfFundsReady: buyer.proofOfFundsReady,
              investmentThesis: buyer.investmentThesis,
              isPublished: buyer.isPublished ?? true,
              targetJurisdictions: {
                create: buyer.targetJurisdictions.map((code) => ({ jurisdictionCode: code })),
              },
              targetCategories: {
                create: buyer.targetCategories.map((code) => ({ categoryCode: code })),
              },
              targetBusinessTypes: {
                create: buyer.targetBusinessTypes.map((businessType) => ({ businessType })),
              },
            },
          },
        },
      }),
    ),
  );
  const buyersByEmail = new Map(buyerRows.map((user) => [user.email, user.id]));

  console.log("Seeding assets...");
  const assetRows = await Promise.all(
    ASSETS.map((asset) => {
      const sellerId = sellersByEmail.get(asset.sellerEmail);
      if (!sellerId) throw new Error(`Unknown seller ${asset.sellerEmail}`);

      const { sellerEmail: _sellerEmail, features, status, ...rest } = asset;

      return prisma.asset.create({
        data: {
          ...rest,
          sellerId,
          status,
          publishedAt: status === "DRAFT" ? null : new Date(),
          features: { create: features.map((code) => ({ code })) },
        },
      });
    }),
  );
  const assetsBySlug = new Map(assetRows.map((asset) => [asset.slug, asset.id]));

  console.log("Seeding conversations...");
  const nordway = buyersByEmail.get("buyer@n5deal.demo")!;
  const balticSeller = sellersByEmail.get("seller@n5deal.demo")!;
  const hkSeller = sellersByEmail.get("broker.hk@n5deal.demo")!;
  const familyOffice = buyersByEmail.get("family.office@n5deal.demo")!;

  await prisma.conversation.create({
    data: {
      buyerId: nordway,
      sellerId: balticSeller,
      assetId: assetsBySlug.get("lithuanian-emi-full-passporting-since-2019"),
      subject: "Lithuanian EMI with full EEA passporting, trading since 2019",
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
      messages: {
        create: [
          {
            senderId: nordway,
            body: "Good afternoon. We are a Nordic payments operator currently using a third-party BIN sponsor and we are looking to bring the licence in-house. Could you confirm whether the safeguarding arrangements and the MLRO would transfer with the entity?",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26),
            readAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
          },
          {
            senderId: balticSeller,
            body: "Good afternoon. Yes to both. Safeguarding is with two credit institutions and both accounts continue post-transfer. The MLRO has confirmed in writing that she intends to stay. Happy to share the last supervisory review letter once an NDA is in place.",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
          },
        ],
      },
    },
  });

  await prisma.conversation.create({
    data: {
      buyerId: familyOffice,
      sellerId: hkSeller,
      assetId: assetsBySlug.get("hong-kong-mso-remittance-operating-since-2018"),
      subject: "Operating Hong Kong MSO with remittance and currency exchange since 2018",
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 50),
      messages: {
        create: [
          {
            senderId: familyOffice,
            body: "We are interested primarily in the banking relationships. Are both accounts held with licensed banks in Hong Kong, and have either of them issued a notice of review in the last 24 months?",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50),
          },
        ],
      },
    },
  });

  // A seller reaching out to a buyer from the directory — no asset attached yet.
  await prisma.conversation.create({
    data: {
      buyerId: buyersByEmail.get("crypto.buyer@n5deal.demo")!,
      sellerId: sellersByEmail.get("malta.owner@n5deal.demo")!,
      assetId: null,
      subject: "MiCA-authorised CASP in Malta — may fit your mandate",
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
      messages: {
        create: [
          {
            senderId: sellersByEmail.get("malta.owner@n5deal.demo")!,
            body: "I saw your mandate for an EU CASP with an immediate timeline. We hold an MFSA-authorised entity with exchange and custody permissions and passporting notifications already filed for six member states. Would you like the details?",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
          },
        ],
      },
    },
  });

  console.log("Seeding favourites...");
  await prisma.favourite.createMany({
    data: [
      { userId: nordway, assetId: assetsBySlug.get("lithuanian-emi-full-passporting-since-2019")! },
      { userId: nordway, assetId: assetsBySlug.get("bulgarian-emi-with-multicurrency-iban")! },
      { userId: familyOffice, assetId: assetsBySlug.get("hong-kong-mso-remittance-operating-since-2018")! },
    ],
  });

  console.log("Seeding moderation history...");
  await prisma.moderationAction.createMany({
    data: [
      {
        actorId: manager.id,
        type: "USER_SUSPEND",
        targetUserId: sellersByEmail.get("flagged.seller@n5deal.demo")!,
        reason:
          "Listing copy promises regulatory approval and explicitly waives source-of-funds checks. Suspended pending compliance review.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
      },
      {
        actorId: manager.id,
        type: "ASSET_SUSPEND",
        targetAssetId: assetsBySlug.get("panama-financial-licence-fast-transfer")!,
        reason: "Advertises guaranteed licence transfer without due diligence. Breaches platform listing rules.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
      },
      {
        actorId: manager.id,
        type: "SELLER_VERIFY",
        targetUserId: balticSeller,
        reason: "KYB documents verified: certificate of incorporation, shareholder register, regulator confirmation.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 240),
      },
    ],
  });

  const counts = {
    jurisdictions: await prisma.jurisdiction.count(),
    categories: await prisma.licenceCategory.count(),
    users: await prisma.user.count(),
    assets: await prisma.asset.count(),
    conversations: await prisma.conversation.count(),
  };

  console.log("\nSeed complete:", counts);
  console.log(`\nDemo accounts (password for all: ${DEMO_PASSWORD})`);
  console.log("  buyer@n5deal.demo    — Nordway Capital, strategic buyer");
  console.log("  seller@n5deal.demo   — Baltic Licence Partners, verified seller");
  console.log("  manager@n5deal.demo  — platform manager");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

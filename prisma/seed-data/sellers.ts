export type SellerSeed = {
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

export const SELLERS: SellerSeed[] = [
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
    about: "Guaranteed approval in 48 hours, no source of funds questions asked. Cash only.",
    country: "PA",
    sellerType: "BROKER",
    isVerified: false,
    operatesIn: ["PA", "BVI"],
    status: "SUSPENDED",
    statusReason:
      "Listing copy promises regulatory approval and explicitly waives source-of-funds checks. Suspended pending compliance review.",
  },
];

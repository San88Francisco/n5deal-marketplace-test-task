import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { BCRYPT_ROUNDS, DEMO_PASSWORD } from "../src/constants";
import { ASSETS } from "./seed-data/assets";
import { BUYERS } from "./seed-data/buyers";
import { CATEGORIES, JURISDICTIONS } from "./seed-data/taxonomy";
import { SELLERS } from "./seed-data/sellers";

const prisma = new PrismaClient();

async function main() {
  console.log("Resetting demo data...");

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

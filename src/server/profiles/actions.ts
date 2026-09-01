"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/server/db";
import { buyerProfileSchema, sellerProfileSchema } from "@/lib/validation";
import { assertRole, AuthorizationError } from "@/server/auth/guards";

export type SaveResult = { ok: true } | { ok: false; error: string };

/**
 * These actions take a typed object rather than FormData: the form is driven by
 * react-hook-form, which already holds a structured value, and re-flattening it
 * into FormData only to parse it back would lose the array fields.
 *
 * The schema still runs here. Client-side validation is a convenience; this is
 * the boundary that actually enforces the rules.
 */
export async function saveBuyerProfileAction(input: unknown): Promise<SaveResult> {
  const parsed = buyerProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  try {
    const user = await assertRole("BUYER");
    const data = parsed.data;

    const profileData = {
      companyName: data.companyName,
      headline: data.headline,
      about: data.about,
      websiteUrl: data.websiteUrl || null,
      country: data.country,
      investorType: data.investorType,
      ticketMinEur: data.ticketMinEur,
      ticketMaxEur: data.ticketMaxEur,
      timeline: data.timeline,
      wantsOperatingOnly: data.wantsOperatingOnly,
      proofOfFundsReady: data.proofOfFundsReady,
      investmentThesis: data.investmentThesis || null,
      isPublished: data.isPublished,
    };

    // Replacing the join rows wholesale is simpler and safer than diffing them,
    // and the sets are tiny.
    const existing = await prisma.buyerProfile.findUnique({ where: { userId: user.id } });

    if (existing) {
      await prisma.$transaction([
        prisma.buyerTargetJurisdiction.deleteMany({ where: { buyerProfileId: existing.id } }),
        prisma.buyerTargetCategory.deleteMany({ where: { buyerProfileId: existing.id } }),
        prisma.buyerTargetBusinessType.deleteMany({ where: { buyerProfileId: existing.id } }),
        prisma.buyerProfile.update({
          where: { id: existing.id },
          data: {
            ...profileData,
            targetJurisdictions: {
              create: data.targetJurisdictions.map((code) => ({ jurisdictionCode: code })),
            },
            targetCategories: {
              create: data.targetCategories.map((code) => ({ categoryCode: code })),
            },
            targetBusinessTypes: {
              create: data.targetBusinessTypes.map((businessType) => ({ businessType })),
            },
          },
        }),
      ]);
    } else {
      await prisma.buyerProfile.create({
        data: {
          ...profileData,
          userId: user.id,
          targetJurisdictions: {
            create: data.targetJurisdictions.map((code) => ({ jurisdictionCode: code })),
          },
          targetCategories: {
            create: data.targetCategories.map((code) => ({ categoryCode: code })),
          },
          targetBusinessTypes: {
            create: data.targetBusinessTypes.map((businessType) => ({ businessType })),
          },
        },
      });
    }
  } catch (error) {
    if (error instanceof AuthorizationError) return { ok: false, error: error.message };
    console.error("[profile] buyer save failed", error);
    return { ok: false, error: "Could not save your mandate. Try again." };
  }

  revalidatePath("/account/buyer-profile");
  revalidatePath("/assets");
  revalidatePath("/sell/buyers");
  return { ok: true };
}

export async function saveSellerProfileAction(input: unknown): Promise<SaveResult> {
  const parsed = sellerProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  try {
    const user = await assertRole("SELLER");
    const data = parsed.data;

    const profileData = {
      companyName: data.companyName,
      headline: data.headline,
      about: data.about,
      websiteUrl: data.websiteUrl || null,
      country: data.country,
      sellerType: data.sellerType,
    };

    const existing = await prisma.sellerProfile.findUnique({ where: { userId: user.id } });

    if (existing) {
      await prisma.$transaction([
        prisma.sellerJurisdiction.deleteMany({ where: { sellerProfileId: existing.id } }),
        prisma.sellerProfile.update({
          where: { id: existing.id },
          data: {
            ...profileData,
            operatesIn: { create: data.operatesIn.map((code) => ({ jurisdictionCode: code })) },
          },
        }),
      ]);
    } else {
      await prisma.sellerProfile.create({
        data: {
          ...profileData,
          userId: user.id,
          // isVerified is deliberately absent: only a platform manager can set
          // it, after KYB. A seller cannot verify themselves.
          operatesIn: { create: data.operatesIn.map((code) => ({ jurisdictionCode: code })) },
        },
      });
    }
  } catch (error) {
    if (error instanceof AuthorizationError) return { ok: false, error: error.message };
    console.error("[profile] seller save failed", error);
    return { ok: false, error: "Could not save your company profile. Try again." };
  }

  revalidatePath("/account/seller-profile");
  return { ok: true };
}

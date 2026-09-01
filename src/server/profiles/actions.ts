"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/server/db";
import { buyerProfileSchema, sellerProfileSchema } from "@/lib/validation";
import { assertRole, AuthorizationError } from "@/server/auth/guards";
import { USER_ROLE } from "@/constants";
import { ROUTES } from "@/routes";

export type SaveResult = { ok: true } | { ok: false; error: string };

export async function saveBuyerProfileAction(input: unknown): Promise<SaveResult> {
  const parsed = buyerProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  try {
    const user = await assertRole(USER_ROLE.BUYER);
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

  revalidatePath(ROUTES.buyer.profile);
  revalidatePath(ROUTES.assets.index);
  revalidatePath(ROUTES.seller.buyers);
  return { ok: true };
}

export async function saveSellerProfileAction(input: unknown): Promise<SaveResult> {
  const parsed = sellerProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  try {
    const user = await assertRole(USER_ROLE.SELLER);
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

          operatesIn: { create: data.operatesIn.map((code) => ({ jurisdictionCode: code })) },
        },
      });
    }
  } catch (error) {
    if (error instanceof AuthorizationError) return { ok: false, error: error.message };
    console.error("[profile] seller save failed", error);
    return { ok: false, error: "Could not save your company profile. Try again." };
  }

  revalidatePath(ROUTES.seller.profile);
  return { ok: true };
}

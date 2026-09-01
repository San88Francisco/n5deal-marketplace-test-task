"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/server/db";
import { assetSchema } from "@/lib/validation";
import { assertRole, AuthorizationError } from "@/server/auth/guards";
import { SELLER_MANAGED_STATUSES } from "@/constants";

export type AssetFormState = { error?: string; fieldErrors?: Record<string, string[]> };

const slugify = (title: string): string =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70) || "listing";

/**
 * Human-readable, unique, and stable once published. Collisions append a
 * counter; the recursion is bounded in practice by how many listings can share
 * a title.
 */
async function uniqueSlug(title: string, excludeId?: string, suffix = 1): Promise<string> {
  const base = slugify(title);
  const candidate = suffix === 1 ? base : `${base}-${suffix}`;

  const clash = await prisma.asset.findUnique({ where: { slug: candidate } });
  if (!clash || clash.id === excludeId) return candidate;

  return uniqueSlug(title, excludeId, suffix + 1);
}

/**
 * Takes the react-hook-form value directly. `publish` is an intent rather than
 * a field: the same form both saves a work-in-progress and publishes it.
 */
export async function saveAssetAction(
  input: unknown,
  options: { assetId?: string | null; publish: boolean },
): Promise<AssetFormState & { ok?: true }> {
  const parsed = assetSchema.safeParse(input);

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const assetId = options.assetId || null;
  const { publish } = options;

  try {
    const user = await assertRole("SELLER");

    if (assetId) {
      const existing = await prisma.asset.findUnique({ where: { id: assetId } });
      if (!existing || existing.sellerId !== user.id) {
        throw new AuthorizationError("That listing is not yours");
      }
      // A suspended listing cannot be edited back into visibility by its owner;
      // only a platform manager can reinstate it.
      if (existing.status === "SUSPENDED") {
        return { error: "This listing is suspended. Contact the platform team." };
      }

      // A published listing keeps its slug: links to it are already in the wild.
      const slug = existing.publishedAt
        ? existing.slug
        : await uniqueSlug(parsed.data.title, existing.id);

      await prisma.$transaction([
        prisma.assetFeature.deleteMany({ where: { assetId } }),
        prisma.asset.update({
          where: { id: assetId },
          data: {
            ...toAssetData(parsed.data),
            slug,
            status: publish ? (existing.status === "DRAFT" ? "PUBLISHED" : existing.status) : existing.status,
            publishedAt: publish && !existing.publishedAt ? new Date() : existing.publishedAt,
            features: { create: parsed.data.features.map((code) => ({ code })) },
          },
        }),
      ]);
    } else {
      await prisma.asset.create({
        data: {
          ...toAssetData(parsed.data),
          slug: await uniqueSlug(parsed.data.title),
          sellerId: user.id,
          status: publish ? "PUBLISHED" : "DRAFT",
          publishedAt: publish ? new Date() : null,
          features: { create: parsed.data.features.map((code) => ({ code })) },
        },
      });
    }
  } catch (error) {
    if (error instanceof AuthorizationError) return { error: error.message };
    console.error("[asset] save failed", error);
    return { error: "Could not save that listing. Try again." };
  }

  revalidatePath("/sell/listings");
  revalidatePath("/assets");
  return { ok: true };
}

function toAssetData(input: ReturnType<typeof assetSchema.parse>) {
  return {
    title: input.title,
    summary: input.summary,
    description: input.description,
    jurisdictionCode: input.jurisdictionCode,
    categoryCode: input.categoryCode,
    businessType: input.businessType,
    askingPriceEur: input.askingPriceEur ?? null,
    revenueEur: input.revenueEur ?? null,
    ebitdaEur: input.ebitdaEur ?? null,
    licenceStatus: input.licenceStatus,
    regulator: input.regulator || null,
    licenceIssuedYear: input.licenceIssuedYear ?? null,
    yearEstablished: input.yearEstablished ?? null,
    employees: input.employees ?? null,
    activeClients: input.activeClients ?? null,
    hasPassporting: input.hasPassporting,
    reasonForSale: input.reasonForSale || null,
  };
}

/** Sellers control their own listing lifecycle, except suspension. */
export async function setAssetStatusAction(formData: FormData) {
  const assetId = String(formData.get("assetId"));
  const status = String(formData.get("status"));

  if (!SELLER_MANAGED_STATUSES.includes(status as (typeof SELLER_MANAGED_STATUSES)[number])) {
    return;
  }

  const user = await assertRole("SELLER");
  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset || asset.sellerId !== user.id || asset.status === "SUSPENDED") return;

  await prisma.asset.update({
    where: { id: assetId },
    data: {
      status: status as never,
      publishedAt: status === "PUBLISHED" && !asset.publishedAt ? new Date() : asset.publishedAt,
    },
  });

  revalidatePath("/sell/listings");
  revalidatePath("/assets");
}

export async function toggleFavouriteAction(formData: FormData) {
  const assetId = String(formData.get("assetId"));
  const user = await assertRole("BUYER");

  const existing = await prisma.favourite.findUnique({
    where: { userId_assetId: { userId: user.id, assetId } },
  });

  if (existing) {
    await prisma.favourite.delete({ where: { userId_assetId: { userId: user.id, assetId } } });
  } else {
    await prisma.favourite.create({ data: { userId: user.id, assetId } });
  }

  revalidatePath("/account/watchlist");
  revalidatePath(`/assets`);
}

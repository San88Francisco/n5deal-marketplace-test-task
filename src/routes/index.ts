/**
 * Every URL in the application, in one place.
 *
 * Paths written inline drift: a route gets renamed and three `href`s in unrelated
 * components keep pointing at the old one, with nothing to catch it. Going
 * through these helpers makes a rename a compile error instead.
 */

const withQuery = (path: string, query?: Record<string, string | number | undefined>) => {
  if (!query) return path;

  const search = new URLSearchParams(
    Object.entries(query)
      .filter(([, value]) => value !== undefined && value !== "")
      .map(([key, value]) => [key, String(value)]),
  ).toString();

  return search ? `${path}?${search}` : path;
};

export const ROUTES = {
  home: "/",

  auth: {
    signIn: "/sign-in",
    signUp: (role?: "BUYER" | "SELLER") => withQuery("/sign-up", { role }),
    suspended: "/account/suspended",
  },

  assets: {
    index: "/assets",
    list: (query?: Record<string, string | number | undefined>) => withQuery("/assets", query),
    detail: (slug: string) => `/assets/${slug}`,
  },

  buyer: {
    profile: "/account/buyer-profile",
    matches: "/account/matches",
    watchlist: "/account/watchlist",
  },

  seller: {
    profile: "/account/seller-profile",
    listings: "/sell/listings",
    newListing: "/sell/listings/new",
    editListing: (assetId: string) => `/sell/listings/${assetId}`,
    buyers: "/sell/buyers",
    buyersForAsset: (assetId: string) =>
      withQuery("/sell/buyers", { forAssetId: assetId, sort: "match" }),
  },

  manage: {
    overview: "/manage",
    participants: (query?: Record<string, string | number | undefined>) =>
      withQuery("/manage/participants", query),
    listings: (query?: Record<string, string | number | undefined>) =>
      withQuery("/manage/listings", query),
    audit: "/manage/audit",
  },

  messages: {
    index: "/messages",
    thread: (conversationId: string) => `/messages/${conversationId}`,
  },

  api: {
    smartSearch: "/api/smart-search",
    matchExplanation: "/api/match-explanation",
  },

  external: {
    n5deal: "https://n5deal.com",
  },
} as const;

/** Where each role belongs after signing in. */
export const landingFor = (role: string): string =>
  ({
    SELLER: ROUTES.seller.listings,
    PLATFORM_MANAGER: ROUTES.manage.overview,
    BUYER: ROUTES.assets.index,
  })[role] ?? ROUTES.assets.index;

/** Route prefixes the middleware guards with a cookie-presence check. */
export const PRIVATE_ROUTE_PREFIXES = ["/account", "/sell", "/manage", "/messages"] as const;

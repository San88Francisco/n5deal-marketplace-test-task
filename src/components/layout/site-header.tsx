import Link from "next/link";

import { getAuthState } from "@/server/auth/session";
import { countUnread } from "@/server/conversations/service";
import { signOutAction } from "@/server/auth/actions";
import { Button } from "@/components/ui/button";

type NavItem = { href: string; label: string };

/** Navigation is role-scoped: a buyer never sees a link into the seller area,
 *  which keeps the product legible and the permission model obvious. */
const NAV_BY_ROLE: Record<string, NavItem[]> = {
  BUYER: [
    { href: "/assets", label: "All listings" },
    { href: "/account/matches", label: "Matched for you" },
    { href: "/account/watchlist", label: "Watchlist" },
    { href: "/messages", label: "Messages" },
    { href: "/account/buyer-profile", label: "My mandate" },
  ],
  SELLER: [
    { href: "/sell/listings", label: "My listings" },
    { href: "/sell/buyers", label: "Buyer directory" },
    { href: "/assets", label: "All listings" },
    { href: "/messages", label: "Messages" },
    { href: "/account/seller-profile", label: "Company" },
  ],
  PLATFORM_MANAGER: [
    { href: "/manage", label: "Overview" },
    { href: "/manage/participants", label: "Participants" },
    { href: "/manage/listings", label: "Listings" },
    { href: "/manage/audit", label: "Audit trail" },
  ],
};

const ANONYMOUS_NAV: NavItem[] = [{ href: "/assets", label: "All listings" }];

export async function SiteHeader() {
  const state = await getAuthState();
  const user = state.status === "active" ? state.user : null;
  const nav = user ? (NAV_BY_ROLE[user.role] ?? ANONYMOUS_NAV) : ANONYMOUS_NAV;
  const unread = user && user.role !== "PLATFORM_MANAGER" ? await countUnread(user.id) : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-navy-800 bg-navy-950">
      <div className="container-page flex h-16 items-center gap-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded bg-accent-500 text-[15px] font-bold text-navy-950">
            N5
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-white">N5Deal</span>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative rounded px-3 py-2 text-[13.5px] text-ink-200 transition-colors hover:bg-navy-900 hover:text-white"
            >
              {item.label}
              {item.href === "/messages" && unread > 0 ? (
                <span className="ml-1.5 rounded-full bg-accent-500 px-1.5 py-0.5 text-[10.5px] font-semibold text-navy-950">
                  {unread}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-[13px] font-medium leading-tight text-white">{user.fullName}</p>
                <p className="text-[11px] uppercase tracking-wider text-ink-300">
                  {user.role === "PLATFORM_MANAGER" ? "Platform manager" : user.role.toLowerCase()}
                </p>
              </div>
              <form action={signOutAction}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="text-ink-200 hover:bg-navy-900 hover:text-white"
                >
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="text-ink-200 hover:bg-navy-900 hover:text-white">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild variant="accent" size="sm">
                <Link href="/sign-up">Create account</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile nav: the same links, scrolled horizontally rather than hidden
          behind a menu — these are the product's only five destinations. */}
      <div className="border-t border-navy-800 md:hidden">
        <nav className="container-page flex gap-1 overflow-x-auto py-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded px-3 py-1.5 text-[13px] text-ink-200 hover:bg-navy-900 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

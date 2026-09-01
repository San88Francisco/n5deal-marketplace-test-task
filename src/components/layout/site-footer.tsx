import Link from "next/link";

import { ROUTES } from "@/routes";

const FOOTER_LINKS = [
  { href: ROUTES.assets.index, label: "All listings", external: false },
  { href: ROUTES.external.n5deal, label: "n5deal.com", external: true },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-ink-100 bg-white">
      <div className="container-page flex flex-col gap-3 py-8 text-[13px] text-ink-500 sm:flex-row sm:items-center sm:justify-between">
        <p>
          N5Deal prototype — built as a technical assignment. Data is fictional and for
          demonstration only.
        </p>

        <nav className="flex gap-4">
          {FOOTER_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-ink-900"
                target="_blank"
                rel="noreferrer"
              >
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={link.href} className="hover:text-ink-900">
                {link.label}
              </Link>
            ),
          )}
        </nav>
      </div>
    </footer>
  );
}

import Link from "next/link";

import { cn } from "@/utils/cn";

export function Pagination({
  page,
  pageCount,
  basePath,
  params,
}: {
  page: number;
  pageCount: number;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  if (pageCount <= 1) return null;

  const href = (target: number) => {
    const carried = Object.entries(params).filter(
      ([key, value]) => Boolean(value) && key !== "page",
    ) as [string, string][];

    const search = new URLSearchParams([
      ...carried,
      ...(target > 1 ? ([["page", String(target)]] as [string, string][]) : []),
    ]).toString();

    return search ? `${basePath}?${search}` : basePath;
  };

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1).filter(
    (candidate) => candidate === 1 || candidate === pageCount || Math.abs(candidate - page) <= 1,
  );

  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Pagination">
      {page > 1 && (
        <Link href={href(page - 1)} className={linkClass(false)}>
          Previous
        </Link>
      )}

      {pages.map((candidate, index) => {
        const previous = pages[index - 1];
        const gap = previous != null && candidate - previous > 1;

        return (
          <span key={candidate} className="flex items-center gap-1.5">
            {gap && <span className="px-1 text-ink-300">…</span>}
            <Link
              href={href(candidate)}
              aria-current={candidate === page ? "page" : undefined}
              className={linkClass(candidate === page)}
            >
              {candidate}
            </Link>
          </span>
        );
      })}

      {page < pageCount && (
        <Link href={href(page + 1)} className={linkClass(false)}>
          Next
        </Link>
      )}
    </nav>
  );
}

function linkClass(active: boolean) {
  return cn(
    "tabular inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-[13px] transition-colors",
    active
      ? "border-navy-900 bg-navy-900 text-white"
      : "border-ink-200 bg-white text-ink-700 hover:border-navy-600 hover:text-ink-900",
  );
}

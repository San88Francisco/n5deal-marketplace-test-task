import { cn } from "@/utils/cn";

type StatListProps = {
  stats: readonly { label: string; value: React.ReactNode; icon?: React.ReactNode }[];
  className?: string;
};

export function StatList({ stats, className }: StatListProps) {
  return (
    <div className={cn("tabular flex gap-3 text-[12.5px] text-ink-500", className)}>
      {stats.map((stat) => (
        <span key={stat.label} className="inline-flex items-center gap-1" title={stat.label}>
          {stat.icon}
          {stat.value}
        </span>
      ))}
    </div>
  );
}

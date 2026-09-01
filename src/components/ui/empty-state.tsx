type EmptyStateProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export function EmptyState({ title, description, children }: EmptyStateProps) {
  return (
    <div className="card grid place-items-center px-6 py-20 text-center">
      <p className="text-[16px] font-medium text-ink-900">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-[440px] text-[13.5px] text-ink-500">{description}</p>
      )}
      {children && <div className="mt-4 flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  );
}

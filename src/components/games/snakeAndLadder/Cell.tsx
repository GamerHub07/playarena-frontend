interface CellProps {
  value: number;
}

export default function Cell({ value }: CellProps) {
  return (
    <div className="relative aspect-square border border-[var(--border)] flex items-center justify-center text-xs sm:text-sm font-medium text-[var(--text-muted)]">
      {value}
    </div>
  );
}

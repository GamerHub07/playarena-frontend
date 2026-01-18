interface Props {
  moves: { from: string; to: string }[];
}

export function MoveList({ moves }: Props) {
  return (
    <div className="h-full overflow-y-auto text-sm space-y-1">
      {moves.map((m, i) => (
        <div key={i} className="flex gap-2">
          <span className="text-gray-500">{Math.floor(i / 2) + 1}.</span>
          <span>{m.from} → {m.to}</span>
        </div>
      ))}
    </div>
  );
}

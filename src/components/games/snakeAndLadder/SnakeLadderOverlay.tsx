import { getCellPosition, SNAKES, LADDERS } from "./boardConfig";

export default function SnakeLadderOverlay() {
  const renderLine = (from: number, to: number, color: string) => {
    const start = getCellPosition(from);
    const end = getCellPosition(to);

    return (
      <line
        key={`${from}-${to}`}
        x1={`${(start.col + 0.5) * 10}%`}
        y1={`${(start.row + 0.5) * 10}%`}
        x2={`${(end.col + 0.5) * 10}%`}
        y2={`${(end.row + 0.5) * 10}%`}
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
    );
  };

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      {Object.entries(LADDERS).map(([from, to]) =>
        renderLine(Number(from), to, "#16A34A")
      )}
      {Object.entries(SNAKES).map(([from, to]) =>
        renderLine(Number(from), to, "#DC2626")
      )}
    </svg>
  );
}

interface TokenProps {
  color: string;
}

export default function Token({ color }: TokenProps) {
  return (
    <div
      className="absolute w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300"
      style={{ backgroundColor: color }}
    />
  );
}

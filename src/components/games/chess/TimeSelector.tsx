"use client";

const TIMES = [
  { label: "1 min", value: 1, name: "Bullet" },
  { label: "3 min", value: 3, name: "Blitz" },
  { label: "5 min", value: 5, name: "Rapid" },
  { label: "10 min", value: 10, name: "Rapid" },
];

interface TimeSelectorProps {
  onSelect: (min: number) => void;
  selected?: number;
}

export function TimeSelector({ onSelect, selected }: TimeSelectorProps) {
  return (
    <div className="w-full">
      <h3 className="text-xl font-semibold mb-5 text-white">Select Time Control</h3>
      <div className="grid grid-cols-4 gap-4">
        {TIMES.map((t) => (
          <button
            key={t.value}
            onClick={() => onSelect(t.value)}
            className={`p-6 rounded-xl border-2 transition-all ${
              selected === t.value
                ? 'border-[#81b64c] bg-[#81b64c]/20 shadow-lg scale-105'
                : 'border-[#3d3935] bg-[#1a1816] hover:border-[#81b64c]/50 hover:bg-[#1f1d1a] hover:scale-102'
            }`}
          >
            <div className="text-3xl font-bold text-white mb-1">
              {t.value}
            </div>
            <div className="text-sm text-gray-400 font-medium">
              {t.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}  
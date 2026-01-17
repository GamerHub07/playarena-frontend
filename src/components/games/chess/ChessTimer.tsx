

// ChessTimer Component
interface TimerProps {
  timeMs: number;
  isActive: boolean;
}

export function ChessTimer({ timeMs, isActive }: TimerProps) {
  const totalSeconds = Math.floor(timeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  
  // Check if time is running low (under 30 seconds)
  const isLowTime = timeMs < 30000;

  return (
    <div
      className={`px-5 py-3 rounded-lg font-mono font-bold text-3xl transition-all ${
        isActive 
          ? 'bg-[#81b64c] text-white shadow-lg animate-pulse' 
          : 'bg-[#1a1816] text-gray-400'
      } ${
        isLowTime && isActive
          ? 'text-red-400 animate-pulse'
          : ''
      }`}
    >
      {minutes}:{seconds}
    </div>
  );
}
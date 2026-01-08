'use client';

import { GameLogEntry, GameLogType } from '@/types/monopoly';
import { 
  GiCash, 
  GiPayMoney, 
  GiReceiveMoney, 
  GiHouse, 
  GiPriceTag, 
  GiPoliceOfficerHead, 
  GiCardRandom,
  GiScrollUnfurled
} from 'react-icons/gi';
import { FaHotel } from 'react-icons/fa';

interface GameLogPanelProps {
  logs: GameLogEntry[];
}

const LOG_ICONS: Record<GameLogType, React.ReactNode> = {
  PASS_GO: <GiCash className="text-yellow-500" />,
  RENT_PAID: <GiPayMoney className="text-red-500" />,
  RENT_RECEIVED: <GiReceiveMoney className="text-green-500" />,
  TAX_PAID: <GiPayMoney className="text-orange-500" />,
  PROPERTY_BOUGHT: <GiHouse className="text-blue-500" />,
  PROPERTY_SOLD: <GiPriceTag className="text-gray-500" />,
  JAIL_FINE: <GiPoliceOfficerHead className="text-blue-700" />,
  CARD_COLLECT: <GiCardRandom className="text-purple-500" />,
  CARD_PAY: <GiCardRandom className="text-purple-500" />,
  CARD_TRANSFER: <GiCardRandom className="text-purple-500" />,
  HOUSE_BUILT: <GiHouse className="text-green-600" />,
  HOTEL_BUILT: <FaHotel className="text-red-600" />,
};

export default function GameLogPanel({ logs }: GameLogPanelProps) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 max-h-[300px] overflow-y-auto">
      <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <GiScrollUnfurled className="text-yellow-600" /> Game Log
      </h4>
      
      {(!logs || logs.length === 0) ? (
        <p className="text-xs text-[#666] text-center py-4">No events yet...</p>
      ) : (
        <div className="space-y-2">
          {logs.slice().reverse().map((log) => (
            <div
              key={log.id}
              className="text-xs text-[#aaa] flex gap-2 items-start py-1 border-b border-[#2a2a2a] last:border-b-0"
            >
              <span className="flex-shrink-0" title={log.type}>{LOG_ICONS[log.type] || '📝'}</span>
              <div className="flex-1">
                <span className="text-white font-medium mr-1">{log.playerName}:</span>
                <span>{log.description}</span>
                <div className="text-[10px] text-[#555] mt-0.5">
                    {new Date(log.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

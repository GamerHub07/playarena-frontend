'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { BoardSquare } from '@/types/monopoly';

interface PropertyCardProps {
    property: BoardSquare;
    playerCash: number;
    onBuy: () => void;
    onDecline: () => void;
}

export default function PropertyCard({ property, playerCash, onBuy, onDecline }: PropertyCardProps) {
    const canAfford = playerCash >= (property.price || 0);

    // Determine property color
    let bgColor = '#4ade80'; // Default green
    if (property.id?.includes('BROWN')) bgColor = '#8B4513';
    if (property.id?.includes('LIGHT_BLUE')) bgColor = '#87CEEB';

    return (
        <Card className="w-full overflow-hidden animate-in zoom-in-95 duration-200 border-2 border-[#16a34a] shadow-[0_0_20px_rgba(22,163,74,0.2)]">
            {/* Property Header */}
            <div
                className="p-4 text-center"
                style={{ backgroundColor: bgColor }}
            >
                <h3 className="text-xl font-bold text-white drop-shadow-md">
                    {property.name || property.id?.replace('_', ' ')}
                </h3>
            </div>

            {/* Property Details */}
            <div className="p-4 space-y-4">
                <div className="text-center">
                    <p className="text-[#888] text-sm">Purchase Price</p>
                    <p className="text-3xl font-bold text-white">${property.price}</p>
                </div>

                <div className="py-3 px-4 bg-[#2a2a2a] rounded-lg">
                    <div className="flex justify-between text-sm">
                        <span className="text-[#888]">Rent</span>
                        <span className="text-white font-medium">${property.rent}</span>
                    </div>
                </div>

                <div className="py-3 px-4 bg-[#2a2a2a] rounded-lg">
                    <div className="flex justify-between text-sm">
                        <span className="text-[#888]">Your Cash</span>
                        <span className={`font-medium ${canAfford ? 'text-[#16a34a]' : 'text-red-400'}`}>
                            ${playerCash}
                        </span>
                    </div>
                </div>

                {!canAfford && (
                    <p className="text-center text-red-400 text-sm">
                        ❌ Not enough cash!
                    </p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2 flex-col sm:flex-row">
                    <Button
                        variant="secondary"
                        onClick={onDecline}
                        className="flex-1"
                    >
                        Decline
                    </Button>
                    <Button
                        onClick={onBuy}
                        disabled={!canAfford}
                        className="flex-1 !bg-[#16a34a] hover:!bg-[#15803d] disabled:!bg-gray-600"
                    >
                        Buy
                    </Button>
                </div>
            </div>
        </Card>
    );
}

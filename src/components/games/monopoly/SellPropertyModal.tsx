'use client';

import { BoardSquare } from '@/types/monopoly';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface SellPropertyModalProps {
    properties: BoardSquare[];
    debtAmount: number;
    playerCash: number;
    onSell: (propertyId: string) => void;
}

export default function SellPropertyModal({
    properties,
    debtAmount,
    playerCash,
    onSell,
}: SellPropertyModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <Card className="w-96 max-h-[80vh] overflow-hidden">
                <div className="p-4 bg-red-600 text-center">
                    <h3 className="text-xl font-bold text-white">⚠️ In Debt!</h3>
                    <p className="text-white/90 text-sm mt-1">
                        Balance: ₹{playerCash} (need ₹{Math.abs(playerCash)} more)
                    </p>
                </div>
                
                <div className="p-4">
                    <p className="text-[#888] text-sm mb-4 text-center">
                        Sell properties to pay off your debt
                    </p>
                    
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {properties.map((prop) => {
                            const salePrice = Math.floor((prop.price ?? 0) / 2);
                            return (
                                <div
                                    key={prop.id}
                                    className="flex items-center justify-between p-3 bg-[#2a2a2a] rounded-lg"
                                >
                                    <div>
                                        <p className="text-white font-medium text-sm">
                                            {prop.name || prop.id}
                                        </p>
                                        <p className="text-[#888] text-xs">
                                            Sell for ₹{salePrice} (half of ₹{prop.price})
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => onSell(prop.id)}
                                        className="!bg-red-600 hover:!bg-red-700 text-sm px-3 py-1"
                                    >
                                        Sell
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                    
                    {properties.length === 0 && (
                        <p className="text-red-400 text-center py-4">
                            No properties to sell - going bankrupt!
                        </p>
                    )}
                </div>
            </Card>
        </div>
    );
}

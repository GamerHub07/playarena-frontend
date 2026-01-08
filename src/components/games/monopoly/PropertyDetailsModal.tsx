'use client';

import Card from '@/components/ui/Card';
import { BoardSquare, PLAYER_TOKENS } from '@/types/monopoly';
import { Player } from '@/types/game';
import { GiHouse } from 'react-icons/gi';
import { FaHotel } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';

// Color display mapping to nice hex values
const COLOR_NAMES: Record<string, string> = {
    brown: '#8B4513',
    lightBlue: '#87CEEB',
    pink: '#FF69B4',
    orange: '#FFA500',
    red: '#ff6868',
    yellow: '#ecd630',
    green: '#47c447',
    blue: '#4f4fc8',
};

interface PropertyDetailsModalProps {
    property: BoardSquare;
    owner?: Player;
    ownerIndex?: number;
    onClose: () => void;
}

export default function PropertyDetailsModal({ 
    property, 
    owner, 
    ownerIndex,
    onClose 
}: PropertyDetailsModalProps) {
    // Get property color - use mapped color or fallback
    const bgColor = COLOR_NAMES[property.color || ''] || property.color || '#4ade80';
    
    // Calculate selling price (half of purchase price)
    const sellingPrice = Math.floor((property.price || 0) / 2);
    
    // Get rent tiers
    const rentTiers = property.rentTiers || [property.rent || 0];
    const baseRent = rentTiers[0] || property.rent || 0;
    const rent1House = rentTiers[1] || baseRent * 2;
    const rent2Houses = rentTiers[2] || baseRent * 3;
    const rent3Houses = rentTiers[3] || baseRent * 4;
    const rent4Houses = rentTiers[4] || baseRent * 5;
    const rentHotel = rentTiers[5] || baseRent * 6;
    
    // Check if this property type can have houses
    const canHaveHouses = property.type === 'PROPERTY';

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <div onClick={(e) => e.stopPropagation()}>
            <Card 
                className="w-80 max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200"
            >
                {/* Property Header */}
                <div 
                    className="p-4 text-center relative"
                    style={{ backgroundColor: bgColor }}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                    >
                        <IoClose className="text-white text-xl" />
                    </button>
                    <h3 className="text-xl font-bold text-white drop-shadow-md">
                        {property.name || property.id?.replace(/_/g, ' ')}
                    </h3>
                    {property.houses !== undefined && property.houses > 0 && (
                        <div className="flex justify-center gap-1 mt-2">
                            {property.houses === 5 ? (
                                <FaHotel className="text-red-200 text-lg" />
                            ) : (
                                Array.from({ length: property.houses }).map((_, i) => (
                                    <GiHouse key={i} className="text-green-200 text-sm" />
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Property Details */}
                <div className="p-5 space-y-3">
                    {/* Owner */}
                    {owner && ownerIndex !== undefined && (
                        <div className="py-2 px-3 bg-[#2a2a2a] rounded-lg">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-[#888]">Owner</span>
                                <div className="flex items-center gap-2">
                                    <span 
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: PLAYER_TOKENS[ownerIndex]?.color }}
                                    />
                                    <span className="text-white font-medium text-sm">{owner.username}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Prices */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="py-2 px-3 bg-[#2a2a2a] rounded-lg text-center">
                            <p className="text-[10px] text-[#888] uppercase">Buy Price</p>
                            <p className="text-lg font-bold text-[#16a34a]">₹{property.price}</p>
                        </div>
                        <div className="py-2 px-3 bg-[#2a2a2a] rounded-lg text-center">
                            <p className="text-[10px] text-[#888] uppercase">Sell Price</p>
                            <p className="text-lg font-bold text-[#ef4444]">₹{sellingPrice}</p>
                        </div>
                    </div>

                    {/* Base Rent */}
                    <div className="py-2 px-3 bg-[#2a2a2a] rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-[#888]">Base Rent</span>
                            <span className="text-white font-bold">₹{baseRent}</span>
                        </div>
                    </div>

                    {/* Rent Tiers - only for properties that can have houses */}
                    {canHaveHouses && (
                        <div className="py-3 px-3 bg-[#2a2a2a] rounded-lg space-y-2">
                            <p className="text-xs text-[#888] uppercase mb-2">Rent with Houses</p>
                            
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-1">
                                    <GiHouse className="text-green-500 text-xs" />
                                    <span className="text-[#aaa]">1 House</span>
                                </div>
                                <span className="text-white font-medium">₹{rent1House}</span>
                            </div>
                            
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-1">
                                    <GiHouse className="text-green-500 text-xs" />
                                    <GiHouse className="text-green-500 text-xs" />
                                    <span className="text-[#aaa]">2 Houses</span>
                                </div>
                                <span className="text-white font-medium">₹{rent2Houses}</span>
                            </div>
                            
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-1">
                                    <GiHouse className="text-green-500 text-xs" />
                                    <GiHouse className="text-green-500 text-xs" />
                                    <GiHouse className="text-green-500 text-xs" />
                                    <span className="text-[#aaa]">3 Houses</span>
                                </div>
                                <span className="text-white font-medium">₹{rent3Houses}</span>
                            </div>
                            
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-1">
                                    <GiHouse className="text-green-500 text-xs" />
                                    <GiHouse className="text-green-500 text-xs" />
                                    <GiHouse className="text-green-500 text-xs" />
                                    <GiHouse className="text-green-500 text-xs" />
                                    <span className="text-[#aaa]">4 Houses</span>
                                </div>
                                <span className="text-white font-medium">₹{rent4Houses}</span>
                            </div>
                            
                            <div className="flex justify-between items-center text-sm pt-1 border-t border-[#444]">
                                <div className="flex items-center gap-1">
                                    <FaHotel className="text-red-500 text-xs" />
                                    <span className="text-[#aaa]">Hotel</span>
                                </div>
                                <span className="text-white font-medium">₹{rentHotel}</span>
                            </div>
                        </div>
                    )}

                    {/* House Cost */}
                    {canHaveHouses && property.houseCost && (
                        <div className="py-2 px-3 bg-[#2a2a2a] rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-[#888]">House Cost</span>
                                <span className="text-white font-medium">₹{property.houseCost}</span>
                            </div>
                        </div>
                    )}

                    {/* Railroad/Utility specific info */}
                    {property.type === 'RAILROAD' && (
                        <div className="py-2 px-3 bg-[#2a2a2a] rounded-lg">
                            <p className="text-xs text-[#888] mb-1">Railroad Rent Rules</p>
                            <p className="text-[11px] text-[#aaa]">
                                1 RR: ₹25 • 2 RR: ₹50 • 3 RR: ₹100 • 4 RR: ₹200
                            </p>
                        </div>
                    )}
                    
                    {property.type === 'UTILITY' && (
                        <div className="py-2 px-3 bg-[#2a2a2a] rounded-lg">
                            <p className="text-xs text-[#888] mb-1">Utility Rent Rules</p>
                            <p className="text-[11px] text-[#aaa]">
                                1 Utility: 4× dice roll • 2 Utilities: 10× dice roll
                            </p>
                        </div>
                    )}
                </div>
            </Card>
            </div>
        </div>
    );
}

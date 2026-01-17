'use client';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { BoardSquare, PLAYER_TOKENS } from '@/types/monopoly';
import { Player } from '@/types/game';
import { GiHouse, GiCrane } from 'react-icons/gi';
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
    // Upgrade functionality (optional)
    isMyProperty?: boolean;
    hasMonopoly?: boolean;
    canBuildHouse?: boolean;
    canBuildHotel?: boolean;
    canSellHouse?: boolean;
    playerCash?: number;
    onBuildHouse?: (propertyId: string) => void;
    onBuildHotel?: (propertyId: string) => void;
    onSellProperty?: (propertyId: string) => void;
    onSellHouse?: (propertyId: string) => void;
}

export default function PropertyDetailsModal({ 
    property, 
    owner, 
    ownerIndex,
    onClose,
    isMyProperty = false,
    hasMonopoly = false,
    canBuildHouse = false,
    canBuildHotel = false,
    canSellHouse = false,
    playerCash = 0,
    onBuildHouse,
    onBuildHotel,
    onSellProperty,
    onSellHouse,
}: PropertyDetailsModalProps) {
    // Get property color - use mapped color or fallback
    const bgColor = COLOR_NAMES[property.color || ''] || property.color || '#4ade80';
    
    // Calculate selling price (half of purchase price)
    const sellingPrice = Math.floor((property.price || 0) / 2);
    
    // Calculate house sale price (half of house cost)
    const houseSalePrice = Math.floor((property.houseCost || 0) / 2);
    
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
    const houses = property.houses ?? 0;
    const isHotel = houses === 5;
    const houseCost = property.houseCost ?? 0;
    const canAffordHouse = playerCash >= houseCost;
    const hasHouses = houses > 0;

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
                    {/* Monopoly Badge */}
                    {hasMonopoly && isMyProperty && (
                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/30 border border-yellow-400/50">
                            <span className="text-[10px] font-bold text-yellow-200 uppercase tracking-wider">★ Monopoly</span>
                        </div>
                    )}
                    {houses > 0 && (
                        <div className="flex justify-center gap-1 mt-2">
                            {isHotel ? (
                                <FaHotel className="text-red-200 text-lg" />
                            ) : (
                                Array.from({ length: houses }).map((_, i) => (
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

                    {/* UPGRADE SECTION - Only show if user owns monopoly */}
                    {isMyProperty && hasMonopoly && canHaveHouses && !isHotel && (
                        <div className="py-3 px-3 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg border border-yellow-600/30">
                            <div className="flex items-center gap-2 mb-3">
                                <GiCrane className="text-yellow-500" />
                                <span className="text-sm font-bold text-yellow-300">Upgrade Property</span>
                            </div>
                            
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-[#aaa]">Current: {houses === 0 ? 'No buildings' : `${houses} House${houses > 1 ? 's' : ''}`}</span>
                                <span className="text-xs text-[#888]">Cost: ₹{houseCost}</span>
                            </div>

                            <div className="flex gap-2">
                                {houses < 4 && (
                                    <Button
                                        onClick={() => onBuildHouse?.(property.id)}
                                        disabled={!canBuildHouse || !canAffordHouse}
                                        className={`flex-1 text-sm py-2 ${canBuildHouse && canAffordHouse ? '!bg-green-600 hover:!bg-green-700' : '!bg-gray-700 cursor-not-allowed'}`}
                                    >
                                        <GiHouse className="inline mr-1" /> Build House
                                    </Button>
                                )}
                                {houses === 4 && (
                                    <Button
                                        onClick={() => onBuildHotel?.(property.id)}
                                        disabled={!canBuildHotel || !canAffordHouse}
                                        className={`flex-1 text-sm py-2 ${canBuildHotel && canAffordHouse ? '!bg-purple-600 hover:!bg-purple-700' : '!bg-gray-700 cursor-not-allowed'}`}
                                    >
                                        <FaHotel className="inline mr-1" /> Build Hotel
                                    </Button>
                                )}
                            </div>
                            
                            {!canAffordHouse && (
                                <p className="text-[10px] text-red-400 mt-2 text-center">Not enough cash (need ₹{houseCost})</p>
                            )}
                            {canAffordHouse && !canBuildHouse && houses < 4 && (
                                <p className="text-[10px] text-orange-400 mt-2 text-center">Build evenly - upgrade other properties first</p>
                            )}
                        </div>
                    )}

                    {/* Max level indicator */}
                    {isMyProperty && hasMonopoly && isHotel && (
                        <div className="py-2 px-3 bg-purple-900/30 rounded-lg border border-purple-600/30 text-center">
                            <span className="text-sm text-purple-300 font-medium">🏆 Maximum Level Reached!</span>
                        </div>
                    )}

                    {/* Sell Section - Show for owned properties */}
                    {isMyProperty && (
                        <div className="py-3 px-3 bg-red-900/20 rounded-lg border border-red-500/30 space-y-3">
                            <p className="text-xs text-red-300 font-medium uppercase">Sell Options</p>
                            
                            {/* Sell House Button */}
                            {hasHouses && canHaveHouses && (
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="text-sm text-[#ccc]">
                                            {isHotel ? 'Sell Hotel' : 'Sell House'}
                                        </span>
                                        <p className="text-xs text-green-400">+₹{houseSalePrice}</p>
                                    </div>
                                    <Button
                                        onClick={() => onSellHouse?.(property.id)}
                                        disabled={!canSellHouse}
                                        className={`text-sm py-1 px-3 ${canSellHouse ? '!bg-orange-600 hover:!bg-orange-700' : '!bg-gray-700 cursor-not-allowed'}`}
                                    >
                                        {isHotel ? '🏨 Sell' : '🏠 Sell'}
                                    </Button>
                                </div>
                            )}
                            {hasHouses && !canSellHouse && (
                                <p className="text-[10px] text-orange-400 text-center">Sell evenly - sell from properties with more houses first</p>
                            )}

                            {/* Sell Property Button */}
                            {!hasHouses && (
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="text-sm text-[#ccc]">Sell Property</span>
                                        <p className="text-xs text-green-400">+₹{sellingPrice}</p>
                                    </div>
                                    <Button
                                        onClick={() => onSellProperty?.(property.id)}
                                        className="text-sm py-1 px-3 !bg-red-600 hover:!bg-red-700"
                                    >
                                        💰 Sell
                                    </Button>
                                </div>
                            )}
                            {hasHouses && (
                                <p className="text-[10px] text-yellow-400 text-center">Sell all houses first to sell property</p>
                            )}
                        </div>
                    )}

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
                            
                            <div className={`flex justify-between items-center text-sm ${houses === 1 ? 'text-green-400' : ''}`}>
                                <div className="flex items-center gap-1">
                                    <GiHouse className="text-green-500 text-xs" />
                                    <span className="text-[#aaa]">1 House</span>
                                </div>
                                <span className="text-white font-medium">₹{rent1House}</span>
                            </div>
                            
                            <div className={`flex justify-between items-center text-sm ${houses === 2 ? 'text-green-400' : ''}`}>
                                <div className="flex items-center gap-1">
                                    <GiHouse className="text-green-500 text-xs" />
                                    <GiHouse className="text-green-500 text-xs" />
                                    <span className="text-[#aaa]">2 Houses</span>
                                </div>
                                <span className="text-white font-medium">₹{rent2Houses}</span>
                            </div>
                            
                            <div className={`flex justify-between items-center text-sm ${houses === 3 ? 'text-green-400' : ''}`}>
                                <div className="flex items-center gap-1">
                                    <GiHouse className="text-green-500 text-xs" />
                                    <GiHouse className="text-green-500 text-xs" />
                                    <GiHouse className="text-green-500 text-xs" />
                                    <span className="text-[#aaa]">3 Houses</span>
                                </div>
                                <span className="text-white font-medium">₹{rent3Houses}</span>
                            </div>
                            
                            <div className={`flex justify-between items-center text-sm ${houses === 4 ? 'text-green-400' : ''}`}>
                                <div className="flex items-center gap-1">
                                    <GiHouse className="text-green-500 text-xs" />
                                    <GiHouse className="text-green-500 text-xs" />
                                    <GiHouse className="text-green-500 text-xs" />
                                    <GiHouse className="text-green-500 text-xs" />
                                    <span className="text-[#aaa]">4 Houses</span>
                                </div>
                                <span className="text-white font-medium">₹{rent4Houses}</span>
                            </div>
                            
                            <div className={`flex justify-between items-center text-sm pt-1 border-t border-[#444] ${houses === 5 ? 'text-purple-400' : ''}`}>
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


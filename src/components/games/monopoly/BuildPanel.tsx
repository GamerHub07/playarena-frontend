'use client';

import { BoardSquare, MonopolyGameState } from '@/types/monopoly';
import Button from '@/components/ui/Button';
import { GiHouse, GiCrane, GiLightBulb } from 'react-icons/gi';
import { FaHotel } from 'react-icons/fa';

interface BuildPanelProps {
  gameState: MonopolyGameState;
  mySessionId: string;
  isMyTurn: boolean;
  onBuildHouse: (propertyId: string) => void;
  onBuildHotel: (propertyId: string) => void;
}

// Color group sizes for monopoly check
const COLOR_GROUP_SIZES: Record<string, number> = {
  brown: 2,
  lightBlue: 3,
  pink: 3,
  orange: 3,
  red: 3,
  yellow: 3,
  green: 3,
  blue: 2,
};

// Color display mapping
const COLOR_NAMES: Record<string, string> = {
  brown: '#8B4513',
  lightBlue: '#87CEEB',
  pink: '#FF69B4',
  orange: '#FFA500',
  red: '#ff6868ff',
  yellow: '#f3ff9aff',
  green: '#47c447ff',
  blue: '#4f4fc8ff',
};

export default function BuildPanel({
  gameState,
  mySessionId,
  isMyTurn,
  onBuildHouse,
  onBuildHotel,
}: BuildPanelProps) {
  const myState = gameState.playerState[mySessionId];
  if (!myState) return null;

  // Get my properties grouped by color
  const myProperties = gameState.board.filter(
    s => s.type === 'PROPERTY' && s.owner === mySessionId
  );

  // Group properties by color
  const propertyGroups: Record<string, BoardSquare[]> = {};
  myProperties.forEach(prop => {
    if (prop.color) {
      if (!propertyGroups[prop.color]) {
        propertyGroups[prop.color] = [];
      }
      propertyGroups[prop.color].push(prop);
    }
  });

  // Check which color groups are complete monopolies
  const monopolies = Object.entries(propertyGroups).filter(
    ([color, props]) => props.length === COLOR_GROUP_SIZES[color]
  );

  if (monopolies.length === 0) {
    return null; // No monopolies to build on
  }

  // Check if can build house on a property
  const canBuildHouse = (property: BoardSquare): boolean => {
    if (!property.color) return false;
    const houses = property.houses ?? 0;
    if (houses >= 4) return false; // Already has 4 houses or hotel

    // Check even building rule
    const colorProps = propertyGroups[property.color] || [];
    const minHouses = Math.min(...colorProps.map(p => p.houses ?? 0));
    if (houses > minHouses) return false;

    // Check cash
    const cost = property.houseCost ?? 0;
    return myState.cash >= cost;
  };

  // Check if can build hotel on a property
  const canBuildHotel = (property: BoardSquare): boolean => {
    if (!property.color) return false;
    const houses = property.houses ?? 0;
    if (houses !== 4) return false; // Need exactly 4 houses

    // Check even building - all must have 4 houses
    const colorProps = propertyGroups[property.color] || [];
    const minHouses = Math.min(...colorProps.map(p => p.houses ?? 0));
    if (minHouses < 4) return false;

    // Check cash
    const cost = property.houseCost ?? 0;
    return myState.cash >= cost;
  };

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
        <GiCrane className="text-yellow-500" /> Build Houses & Hotels
      </h3>

      {!isMyTurn && (
        <p className="text-sm text-[#888] mb-3">Wait for your turn to build</p>
      )}

      <div className="space-y-4">
        {monopolies.map(([color, properties]) => (
          <div key={color} className="border border-[#333] rounded-lg p-3">
            {/* Color header */}
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: COLOR_NAMES[color] || color }}
              />
              <span className="text-sm font-medium text-white capitalize">
                {color} Monopoly
              </span>
            </div>

            {/* Properties */}
            <div className="space-y-2">
              {properties.map(property => {
                const houses = property.houses ?? 0;
                const isHotel = houses === 5;
                const canBuild = isMyTurn && canBuildHouse(property);
                const canUpgrade = isMyTurn && canBuildHotel(property);

                return (
                  <div
                    key={property.id}
                    className="flex items-center justify-between bg-[#0f0f0f] rounded-lg p-2"
                  >
                    <div className="flex-1">
                      <p className="text-sm text-white">{property.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {isHotel ? (
                          <span className="text-xs flex items-center gap-1"><FaHotel className="text-red-500" /> Hotel</span>
                        ) : houses > 0 ? (
                          <>
                            {Array.from({ length: houses }).map((_, i) => (
                              <GiHouse key={i} className="text-xs text-green-500" />
                            ))}
                            <span className="text-xs text-[#888] ml-1">
                              ({houses}/4 houses)
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-[#666]">No improvements</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {houses < 4 && (
                        <button
                          onClick={() => onBuildHouse(property.id)}
                          disabled={!canBuild}
                          className={`
                                                        px-3 py-1 rounded text-xs font-medium transition-colors
                                                        ${canBuild
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-[#333] text-[#666] cursor-not-allowed'
                            }
                                                    `}
                          title={canBuild ? `Build house ($${property.houseCost})` : 'Cannot build'}
                        >
                          <div className="flex items-center gap-1">
                            <GiHouse /> ${property.houseCost}
                          </div>
                        </button>
                      )}
                      {houses === 4 && (
                        <button
                          onClick={() => onBuildHotel(property.id)}
                          disabled={!canUpgrade}
                          className={`
                                                        px-3 py-1 rounded text-xs font-medium transition-colors
                                                        ${canUpgrade
                              ? 'bg-purple-600 hover:bg-purple-700 text-white'
                              : 'bg-[#333] text-[#666] cursor-not-allowed'
                            }
                                                    `}
                          title={canUpgrade ? `Build hotel ($${property.houseCost})` : 'Cannot build hotel'}
                        >
                          <div className="flex items-center gap-1">
                            <FaHotel /> ${property.houseCost}
                          </div>
                        </button>
                      )}
                      {isHotel && (
                        <span className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded text-xs">
                          Max
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-[#666] mt-3 flex items-center gap-1">
        <GiLightBulb className="text-yellow-600/50" /> Build evenly across properties. Need 4 houses before building a hotel.
      </p>
    </div>
  );
}

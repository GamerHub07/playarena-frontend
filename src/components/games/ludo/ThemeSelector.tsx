'use client';

import { useState } from 'react';
import { useLudoTheme } from '@/contexts/LudoThemeContext';
import { LudoTheme } from '@/config/ludoThemes';

interface ThemeSelectorProps {
  compact?: boolean;
  isHost: boolean;
  onThemeChange: (themeId: string) => void;
}

export default function ThemeSelector({ compact = false, isHost, onThemeChange }: ThemeSelectorProps) {
  const { theme, themeId, availableThemes } = useLudoTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeSelect = (newThemeId: string) => {
    onThemeChange(newThemeId);
    setIsOpen(false);
  };

  const ThemePreview = ({ t, isActive }: { t: LudoTheme; isActive: boolean }) => (
    <button
      onClick={() => handleThemeSelect(t.id)}
      className={`
                w-full p-3 rounded-lg transition-all duration-200
                ${isActive ? 'ring-2 scale-[1.02]' : 'hover:scale-[1.01]'}
            `}
      style={{
        background: t.board.boardFrame,
        border: `2px solid ${isActive ? t.ui.accentColor : t.board.boardFrameBorder}`,
        boxShadow: isActive ? `0 0 12px ${t.ui.accentColor}40` : '0 2px 8px rgba(0,0,0,0.3)',
      }}
    >
      <div className="flex items-center gap-3">
        {/* Mini board preview */}
        <div
          className="w-12 h-12 rounded-md grid grid-cols-2 grid-rows-2 gap-0.5 p-0.5 flex-shrink-0"
          style={{ backgroundColor: t.board.innerBoard }}
        >
          <div className="rounded-sm" style={{ backgroundColor: t.playerColors.red.bg }} />
          <div className="rounded-sm" style={{ backgroundColor: t.playerColors.green.bg }} />
          <div className="rounded-sm" style={{ backgroundColor: t.playerColors.blue.bg }} />
          <div className="rounded-sm" style={{ backgroundColor: t.playerColors.yellow.bg }} />
        </div>

        {/* Theme info */}
        <div className="flex-1 text-left">
          <p
            className="font-semibold text-sm"
            style={{
              color: t.ui.textPrimary,
              fontFamily: t.effects.fontFamily,
            }}
          >
            {t.name}
          </p>
          {!compact && (
            <p
              className="text-xs"
              style={{ color: t.ui.textSecondary }}
            >
              {t.description}
            </p>
          )}
        </div>

        {/* Active indicator */}
        {isActive && (
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: t.ui.accentColor }}
          >
            <svg className="w-3 h-3" fill="none" stroke={t.ui.textPrimary} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
    </button>
  );

  // Non-host players see a read-only theme indicator
  if (!isHost) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg"
        style={{
          backgroundColor: theme.ui.cardBackground,
          border: `2px solid ${theme.ui.cardBorder}`,
          color: theme.ui.textSecondary,
        }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
        <span
          className="text-sm"
          style={{ fontFamily: theme.effects.fontFamily }}
        >
          {theme.name}
        </span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="relative">
        {/* Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
          style={{
            backgroundColor: theme.ui.cardBackground,
            border: `2px solid ${theme.ui.cardBorder}`,
            color: theme.ui.textPrimary,
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          <span
            className="text-sm font-medium"
            style={{ fontFamily: theme.effects.fontFamily }}
          >
            Theme
          </span>
          <span className="text-xs opacity-70">(Host)</span>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Menu */}
            <div
              className="absolute top-full right-0 mt-2 w-72 rounded-xl overflow-hidden z-50"
              style={{
                backgroundColor: theme.ui.cardBackground,
                border: `2px solid ${theme.ui.cardBorder}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              <div className="p-3">
                <p
                  className="text-xs font-medium px-2 py-1 mb-2"
                  style={{
                    color: theme.ui.textSecondary,
                    fontFamily: theme.effects.fontFamily,
                  }}
                >
                  Select Theme (applies to all players)
                </p>
                <div className="space-y-2">
                  {availableThemes.map((t) => (
                    <ThemePreview
                      key={t.id}
                      t={t}
                      isActive={t.id === themeId}
                    />
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Full theme selector grid
  return (
    <div
      className="p-4 rounded-xl"
      style={{
        backgroundColor: theme.ui.cardBackground,
        border: `2px solid ${theme.ui.cardBorder}`,
      }}
    >
      <h3
        className="text-lg font-semibold mb-4"
        style={{
          color: theme.ui.textPrimary,
          fontFamily: theme.effects.fontFamily,
        }}
      >
        🎨 Board Theme (Host Only)
      </h3>
      <div className="space-y-2">
        {availableThemes.map((t) => (
          <ThemePreview
            key={t.id}
            t={t}
            isActive={t.id === themeId}
          />
        ))}
      </div>
    </div>
  );
}

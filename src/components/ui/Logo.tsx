'use client';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
}

export default function Logo({ size = 'md', showText = true }: LogoProps) {
    const sizes = {
        sm: { icon: 32, text: 'text-lg' },
        md: { icon: 40, text: 'text-xl' },
        lg: { icon: 56, text: 'text-2xl' },
    };

    const { icon, text } = sizes[size];

    return (
        <div className="flex items-center gap-2.5 group">
            {/* Logo Icon - VS Shield */}
            <div
                className="relative flex items-center justify-center transition-transform group-hover:scale-105"
                style={{ width: icon, height: icon }}
            >
                <svg
                    viewBox="0 0 100 100"
                    width={icon}
                    height={icon}
                    className="block"
                >
                    <defs>
                        {/* Gradient for the shield */}
                        <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fbbf24" />
                            <stop offset="50%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#d97706" />
                        </linearGradient>

                        {/* Shadow filter */}
                        <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.15" />
                        </filter>
                    </defs>

                    {/* Shield Shape */}
                    <path
                        d="M50 5 L90 20 L90 45 C90 70 70 90 50 95 C30 90 10 70 10 45 L10 20 Z"
                        fill="url(#shieldGrad)"
                        filter="url(#logoShadow)"
                    />

                    {/* Inner shield highlight */}
                    <path
                        d="M50 12 L82 24 L82 45 C82 65 65 82 50 87 C35 82 18 65 18 45 L18 24 Z"
                        fill="none"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="1"
                    />

                    {/* VS Text */}
                    <text
                        x="50"
                        y="58"
                        textAnchor="middle"
                        fontFamily="system-ui, -apple-system, sans-serif"
                        fontSize="32"
                        fontWeight="900"
                        fill="#1a1a1a"
                        letterSpacing="-2"
                    >
                        VS
                    </text>

                    {/* Crossed swords decoration */}
                    <path
                        d="M25 72 L40 60 M75 72 L60 60"
                        stroke="#1a1a1a"
                        strokeWidth="3"
                        strokeLinecap="round"
                        opacity="0.4"
                    />
                </svg>
            </div>

            {/* Text */}
            {showText && (
                <div className="flex flex-col leading-none">
                    <span className={`${text} font-black tracking-tight text-[var(--dark)]`}>
                        Versus<span className="text-[#fbbf24]">Arena</span>
                    </span>
                </div>
            )}
        </div>
    );
}

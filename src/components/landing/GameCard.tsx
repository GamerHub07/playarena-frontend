'use client';

import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';

interface GameCardProps {
    title: string;
    description: string;
    players: string;
    status: 'available' | 'coming-soon';
    href: string;
    icon: React.ReactNode;
}

export default function GameCard({ title, description, players, status, href, icon }: GameCardProps) {
    const router = useRouter();

    const handleClick = () => {
        if (status === 'available') {
            router.push(href);
        }
    };

    return (
        <Card
            hover={status === 'available'}
            onClick={handleClick}
            className="p-6 relative overflow-hidden"
        >
            {status === 'coming-soon' && (
                <div className="absolute top-4 right-4 px-2 py-1 bg-[var(--surface-alt)] rounded text-xs text-[var(--text-muted)]">
                    Coming Soon
                </div>
            )}

            {/* Icon */}
            <div className="w-14 h-14 bg-[var(--surface-alt)] rounded-xl flex items-center justify-center mb-4">
                {icon}
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-[var(--text)] mb-2">{title}</h3>

            {/* Description */}
            <p className="text-[var(--text-muted)] text-sm mb-4 line-clamp-2">{description}</p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                <span className="text-sm text-[var(--text-muted)]">{players} Players</span>
                {status === 'available' && (
                    <span className="text-sm text-[var(--primary)] font-medium">Play Now →</span>
                )}
            </div>
        </Card>
    );
}

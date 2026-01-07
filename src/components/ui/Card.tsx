import { ReactNode, CSSProperties } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
    hover?: boolean;
    onClick?: () => void;
}

export default function Card({ children, className = '', style, hover = false, onClick }: CardProps) {
    return (
        <div
            onClick={onClick}
            className={`
        bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-sm
        ${hover ? 'cursor-pointer transition-all duration-200 hover:border-[var(--primary)] hover:shadow-lg hover:shadow-[var(--primary)]/10 dark:hover:shadow-[var(--primary)]/5' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
            style={style}
        >
            {children}
        </div>
    );
}

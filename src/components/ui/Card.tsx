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
        bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl
        ${hover ? 'cursor-pointer transition-all duration-200 hover:border-[#3b82f6] hover:shadow-lg hover:shadow-[#3b82f6]/10' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
            style={style}
        >
            {children}
        </div>
    );
}

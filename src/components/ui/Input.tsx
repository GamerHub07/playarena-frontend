'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, id, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={id} className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={id}
                    className={`
            w-full px-4 py-3 bg-[var(--surface-alt)]/50 border border-[var(--border)] rounded-lg
            text-[var(--text)] placeholder-[var(--text-muted)]/50
            focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent
            transition-all duration-200
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm text-red-500">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;

import { ReactNode } from 'react';
import { ThemeProvider } from '@/hooks/useTheme';
import { ToastProvider } from '@/contexts/ToastContext';

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider>
            <ToastProvider>
                {children}
            </ToastProvider>
        </ThemeProvider>
    );
}

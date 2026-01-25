'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, Info, Trophy, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'reward';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, message, type, duration };

    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-24 right-4 z-50 flex flex-col gap-3 pointer-events-none min-w-[320px]">
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem: React.FC<{ toast: Toast, onDismiss: () => void }> = ({ toast, onDismiss }) => {
  const icons = {
    success: <CheckCircle className="text-green-500" size={24} />,
    error: <XCircle className="text-red-500" size={24} />,
    info: <Info className="text-blue-500" size={24} />,
    reward: <Trophy className="text-yellow-500" size={24} />
  };

  const bgColors = {
    success: 'bg-background border-green-500/20',
    error: 'bg-background border-red-500/20',
    info: 'bg-background border-blue-500/20',
    reward: 'bg-black/90 border-yellow-500/30'
  };

  // Gradient overrides for "Reward" type to make it special
  const isReward = toast.type === 'reward';

  let className = bgColors[toast.type];

  if (isReward) {
    className = "bg-neutral-900/95 border-yellow-500/40 shadow-[0_0_30px_-5px_rgba(234,179,8,0.2)]";
  } else {
    className = `${className} bg-background/95 backdrop-blur-sm shadow-xl`;
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`pointer-events-auto flex items-center gap-4 p-4 rounded-xl border ${className} overflow-hidden relative group`}
    >
      {isReward && (
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent animate-pulse" />
      )}

      <div className="relative z-10 shrink-0">
        {icons[toast.type]}
      </div>

      <div className="flex-1 min-w-0 relative z-10">
        <p className={`font-medium text-sm ${isReward ? 'text-yellow-100' : 'text-foreground'}`}>
          {toast.message}
        </p>
      </div>

      <button
        onClick={onDismiss}
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors relative z-10"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

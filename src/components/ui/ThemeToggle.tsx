"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle() {
    const { setTheme, theme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Avoid hydration mismatch
    React.useEffect(() => setMounted(true), [])
    if (!mounted) return <div className="w-14 h-8" />

    const isDark = theme === "dark"

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="relative w-14 h-8 flex items-center p-1 rounded-full bg-surface-alt/40 border border-border/40 backdrop-blur-md cursor-pointer transition-colors hover:border-primary/30 group overflow-hidden"
            aria-label="Toggle theme"
        >
            {/* Background Sliding Indicator */}
            <motion.div
                className="absolute w-6 h-6 rounded-full bg-white dark:bg-primary shadow-sm dark:shadow-[0_0_15px_rgba(234,179,8,0.4)] z-0"
                animate={{
                    x: isDark ? 24 : 0,
                }}
                transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                }}
            />

            {/* Icons Container */}
            <div className="relative flex justify-between items-center w-full px-1 z-10 pointer-events-none">
                <motion.div
                    animate={{
                        scale: isDark ? 0.7 : 1,
                        opacity: isDark ? 0.5 : 1,
                        rotate: isDark ? -45 : 0
                    }}
                >
                    <Sun size={14} className={isDark ? "text-text-muted" : "text-amber-500"} fill={isDark ? "none" : "currentColor"} />
                </motion.div>

                <motion.div
                    animate={{
                        scale: isDark ? 1 : 0.7,
                        opacity: isDark ? 1 : 0.5,
                        rotate: isDark ? 0 : 45
                    }}
                >
                    <Moon size={14} className={isDark ? "text-white" : "text-text-muted"} fill={isDark ? "currentColor" : "none"} />
                </motion.div>
            </div>

            {/* Subtle Gradient Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 pointer-events-none" />
        </button>
    )
}

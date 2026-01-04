"use client"

import * as React from "react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
    const { setTheme, theme } = useTheme()

    return (
        <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="relative p-2 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 transition-colors backdrop-blur-sm border border-black/5 dark:border-white/10 group"
            aria-label="Toggle theme"
        >
            <div className="relative w-5 h-5">
                {/* Sun Icon */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="absolute inset-0 w-full h-full text-amber-500 transition-all duration-300 rotate-0 scale-100 dark:-rotate-90 dark:scale-0"
                >
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>

                {/* Moon Icon */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="absolute inset-0 w-full h-full text-indigo-400 transition-all duration-300 rotate-90 scale-0 dark:rotate-0 dark:scale-100"
                >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    <path d="M12 2v1" className="opacity-0 dark:opacity-50" />
                    <path d="M12 21v1" className="opacity-0 dark:opacity-50" />
                    <path d="M4.22 4.22l.71.71" className="opacity-0 dark:opacity-50" />
                    <path d="M19.07 19.07l.71.71" className="opacity-0 dark:opacity-50" />
                    <path d="M1 12h1" className="opacity-0 dark:opacity-50" />
                    <path d="M22 12h1" className="opacity-0 dark:opacity-50" />
                    <path d="M4.22 19.78l.71-.71" className="opacity-0 dark:opacity-50" />
                    <path d="M19.07 4.93l.71-.71" className="opacity-0 dark:opacity-50" />
                </svg>
            </div>
            <span className="sr-only">Toggle theme</span>
        </button>
    )
}

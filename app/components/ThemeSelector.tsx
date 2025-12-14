'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor, Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function ThemeSelector() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const themes = [
        { id: 'light', name: 'Claro', icon: Sun },
        { id: 'dark', name: 'Oscuro', icon: Moon },
        { id: 'system', name: 'Automático', icon: Monitor },
    ]

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Monitor size={20} className="text-purple-500" />
                        Apariencia
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                        Personaliza cómo se ve la aplicación en tu dispositivo.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {themes.map((t) => {
                    const Icon = t.icon
                    const isActive = theme === t.id
                    return (
                        <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={cn(
                                "relative flex flex-col items-center gap-3 p-4 rounded-xl border transition-all",
                                isActive
                                    ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
                                    : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                            )}
                        >
                            <Icon
                                size={24}
                                className={cn(
                                    isActive ? "text-purple-600 dark:text-purple-400" : "text-zinc-500 dark:text-zinc-400"
                                )}
                            />
                            <span className={cn(
                                "text-sm font-medium",
                                isActive ? "text-purple-700 dark:text-purple-300" : "text-zinc-600 dark:text-zinc-400"
                            )}>
                                {t.name}
                            </span>
                            {isActive && (
                                <div className="absolute top-3 right-3 text-purple-600 dark:text-purple-400">
                                    <Check size={16} />
                                </div>
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

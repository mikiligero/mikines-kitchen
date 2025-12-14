'use client'

import { useState } from 'react'
import { CategoryManager } from '@/app/components/CategoryManager'
import { BackupManager } from '@/app/components/BackupManager'
import { MaintenanceManager } from '@/app/components/MaintenanceManager'
import { ThemeSelector } from '@/app/components/ThemeSelector'
import { Settings, Tag, Database, Wrench, Sliders } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminDashboardProps {
    categories: { id: string; name: string }[]
}

type Tab = 'categories' | 'backups' | 'maintenance' | 'settings'

export function AdminDashboard({ categories }: AdminDashboardProps) {
    const [activeTab, setActiveTab] = useState<Tab>('categories')

    return (
        <div className="flex flex-col md:flex-row gap-8 min-h-[600px]">
            {/* Sidebar */}
            <aside className="w-full md:w-64 flex-shrink-0">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden sticky top-24">
                    <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <Settings size={18} />
                            Panel
                        </h2>
                    </div>
                    <nav className="p-2 space-y-1">
                        <button
                            onClick={() => setActiveTab('categories')}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                activeTab === 'categories'
                                    ? "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400"
                                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            )}
                        >
                            <Tag size={18} />
                            Categorías
                        </button>
                        <button
                            onClick={() => setActiveTab('backups')}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                activeTab === 'backups'
                                    ? "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400"
                                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            )}
                        >
                            <Database size={18} />
                            Copias de Seguridad
                        </button>
                        <button
                            onClick={() => setActiveTab('maintenance')}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                activeTab === 'maintenance'
                                    ? "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400"
                                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            )}
                        >
                            <Wrench size={18} />
                            Mantenimiento
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                activeTab === 'settings'
                                    ? "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400"
                                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            )}
                        >
                            <Sliders size={18} />
                            Apariencia
                        </button>
                    </nav>
                </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1">
                <div className="max-w-4xl animate-in fade-in duration-300 slide-in-from-bottom-4">
                    {activeTab === 'categories' && (
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Categorías</h1>
                                <p className="text-zinc-500">Organiza las etiquetas de tus recetas.</p>
                            </div>
                            <CategoryManager categories={categories} />
                        </div>
                    )}

                    {activeTab === 'backups' && (
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Copias de Seguridad</h1>
                                <p className="text-zinc-500">Exporta o restaura tus datos.</p>
                            </div>
                            <BackupManager />
                        </div>
                    )}

                    {activeTab === 'maintenance' && (
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Mantenimiento</h1>
                                <p className="text-zinc-500">Herramientas del sistema.</p>
                            </div>
                            <MaintenanceManager />
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Apariencia</h1>
                                <p className="text-zinc-500">Preferencias de la aplicación.</p>
                            </div>
                            <ThemeSelector />
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

'use client'

import { useState, useTransition } from 'react'
import { cleanOrphanedImages } from '@/app/actions/admin'
import { Brush, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'

export function MaintenanceManager() {
    const [isPending, startTransition] = useTransition()
    const [result, setResult] = useState<{ count: number; message: string } | null>(null)

    const handleCleanup = () => {
        if (!confirm("Esto eliminará permanentemente todas las imágenes que no estén asociadas a ninguna receta. ¿Estás seguro?")) {
            return
        }

        startTransition(async () => {
            const res = await cleanOrphanedImages()
            setResult(res)
        })
    }

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Brush className="text-purple-600 dark:text-purple-400" />
                    Mantenimiento del Sistema
                </h2>
                <p className="text-zinc-500 text-sm mt-1">
                    Herramientas para optimizar el almacenamiento y rendimiento.
                </p>
            </div>

            <div className="p-6">
                <div className="flex items-start justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <div>
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Limpieza de Imágenes</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
                            Escanea la carpeta de subidas y elimina cualquier archivo de imagen que no esté siendo utilizado por ninguna receta en la base de datos.
                        </p>

                        {result && (
                            <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-sm flex items-center gap-2">
                                <CheckCircle size={16} />
                                {result.message}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleCleanup}
                        disabled={isPending}
                        className="flex-shrink-0 bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-600 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? <Loader2 className="animate-spin" size={16} /> : <Brush size={16} />}
                        Limpiar Librería
                    </button>
                </div>
            </div>
        </div>
    )
}

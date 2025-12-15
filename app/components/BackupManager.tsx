'use client'

import { restoreBackupFromZip } from '@/app/actions/backup'
import { Download, Upload, AlertTriangle, FileArchive, CheckCircle } from 'lucide-react'
import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils'

export function BackupManager() {
    const [isPending, startTransition] = useTransition()
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) {
            setSelectedFile(null)
            return
        }

        if (!file.name.endsWith('.zip')) {
            setStatus({ type: 'error', message: 'Por favor selecciona un archivo .zip' })
            setSelectedFile(null)
            return
        }

        setSelectedFile(file)
        setStatus(null)
    }

    const handleRestore = () => {
        if (!selectedFile) return

        if (!confirm('¡ADVERTENCIA!\n\nEsta acción BORRARÁ todos los datos actuales (recetas, categorías e IMÁGENES) y los reemplazará con los datos de la copia de seguridad.\n\n¿Estás seguro de que quieres continuar?')) {
            return
        }

        startTransition(async () => {
            try {
                const formData = new FormData()
                formData.append('backup', selectedFile)

                const response = await fetch('/api/backup/restore', {
                    method: 'POST',
                    body: formData,
                })

                if (!response.ok) {
                    const error = await response.json()
                    throw new Error(error.error || 'Restore failed')
                }

                setStatus({ type: 'success', message: 'Restauración completada con éxito. Las imágenes y datos han sido recuperados.' })
                setSelectedFile(null)

                // Refresh the page to show new data
                window.location.reload()
            } catch (error) {
                console.error(error)
                setStatus({ type: 'error', message: 'Error al restaurar: asegúrate de que el archivo ZIP es válido.' })
            }
        })
    }

    return (
        <div className="space-y-8">
            {/* Export Section */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <Download size={20} className="text-purple-500" />
                            Exportar Copia de Seguridad
                        </h3>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                            Descarga un archivo ZIP con tus recetas, categorías e imágenes.
                        </p>
                    </div>
                </div>

                <a
                    href="/api/backup/download"
                    download="recipines_backup.zip"
                    className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <Download size={18} />
                    Descargar ZIP
                </a>
            </div>

            {/* Import Section */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <Upload size={20} className="text-amber-500" />
                            Restaurar Copia de Seguridad
                        </h3>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                            Sube un archivo ZIP para recuperar tus datos e imágenes.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <label className="cursor-pointer flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 px-4 py-2 rounded-lg font-medium transition-colors border border-zinc-200 dark:border-zinc-700">
                            <FileArchive size={18} />
                            {selectedFile ? 'Cambiar Archivo' : 'Seleccionar ZIP'}
                            <input
                                type="file"
                                accept=".zip"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </label>
                        {selectedFile && (
                            <span className="text-sm text-zinc-500 dark:text-zinc-400 font-mono">
                                {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                        )}
                    </div>

                    {status && (
                        <div className={cn(
                            "p-3 rounded-lg text-sm flex items-center gap-2",
                            status.type === 'success' ? "bg-purple-900/20 text-purple-400" : "bg-red-900/20 text-red-400"
                        )}>
                            {status.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                            {status.message}
                        </div>
                    )}

                    {selectedFile && (
                        <div className="bg-zinc-50 dark:bg-zinc-950/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-start gap-3 bg-red-900/10 p-3 rounded-lg mb-4">
                                <AlertTriangle className="text-red-500 flex-shrink-0" size={18} />
                                <p className="text-xs text-red-300 leading-relaxed">
                                    Al restaurar, se <strong>eliminarán todos los datos e imágenes actuales</strong>.
                                    Asegúrate de que quieres reemplazar tu base de datos actual con este archivo.
                                </p>
                            </div>

                            <button
                                onClick={handleRestore}
                                disabled={isPending}
                                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {isPending ? 'Restaurando...' : 'Confirmar y Restaurar ZIP'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

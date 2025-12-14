'use client'

import { useState, useTransition } from 'react'
import { X, Loader2 } from 'lucide-react'
import { changePassword } from '@/app/actions/auth'

interface ChangePasswordModalProps {
    isOpen: boolean
    onClose: () => void
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [showPasswords, setShowPasswords] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        setSuccess(false)
        const formData = new FormData(e.currentTarget)
        const newPassword = formData.get('newPassword') as string
        const confirmPassword = formData.get('confirmPassword') as string

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas nuevas no coinciden')
            return
        }

        startTransition(async () => {
            const result = await changePassword(formData)
            if (result?.error) {
                setError(result.error)
            } else {
                setSuccess(true)
                setTimeout(() => {
                    onClose()
                    setSuccess(false)
                }, 1500)
            }
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
                    <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">Cambiar Contraseña</h3>
                    <button onClick={onClose} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Contraseña Actual</label>
                        <input
                            name="currentPassword"
                            type={showPasswords ? "text" : "password"}
                            required
                            className="w-full p-2 rounded-lg border bg-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Nueva Contraseña</label>
                        <input
                            name="newPassword"
                            type={showPasswords ? "text" : "password"}
                            required
                            className="w-full p-2 rounded-lg border bg-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Confirmar Nueva Contraseña</label>
                        <input
                            name="confirmPassword"
                            type={showPasswords ? "text" : "password"}
                            required
                            className="w-full p-2 rounded-lg border bg-transparent"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="showPasswords"
                            checked={showPasswords}
                            onChange={(e) => setShowPasswords(e.target.checked)}
                            className="rounded border-zinc-300 text-purple-600 focus:ring-purple-500"
                        />
                        <label htmlFor="showPasswords" className="text-sm text-zinc-500 select-none cursor-pointer">
                            Mostrar contraseñas
                        </label>
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm font-medium">{error}</p>
                    )}

                    {success && (
                        <p className="text-purple-500 text-sm font-medium">¡Contraseña actualizada correctamente!</p>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isPending || success}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isPending && <Loader2 className="animate-spin" size={16} />}
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { login, checkAnyUserExists, createFirstUser } from '@/app/actions/auth'
import { Loader2, Lock, Sparkles } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string>('')
    const [isSetupMode, setIsSetupMode] = useState<boolean>(false)
    const [checking, setChecking] = useState<boolean>(true)

    useEffect(() => {
        checkAnyUserExists().then((exists) => {
            setIsSetupMode(!exists)
            setChecking(false)
        })
    }, [])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        const formData = new FormData(e.currentTarget)

        startTransition(async () => {
            const result = await (isSetupMode ? createFirstUser(formData) : login(formData))
            if (result?.error) {
                setError(result.error)
            } else {
                router.push('/')
                router.refresh()
            }
        })
    }

    if (checking) return null // Prevent flash

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-start justify-center p-4 pt-32">
            <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className={`p-3 rounded-full mb-4 ${isSetupMode
                        ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500'
                        : 'bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-500'
                        }`}>
                        {isSetupMode ? <Sparkles size={32} /> : <Lock size={32} />}
                    </div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white text-center">
                        {isSetupMode ? 'Bienvenido a Mikines' : 'Mikines Kitchen'}
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-500 text-sm mt-1 text-center">
                        {isSetupMode
                            ? 'Configura tu cuenta de administrador'
                            : 'Inicia sesión para continuar'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-400 mb-1">
                            {isSetupMode ? 'Nuevo Usuario' : 'Usuario'}
                        </label>
                        <input
                            name="username"
                            type="text"
                            required
                            className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none border"
                            placeholder="Usuario"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-400 mb-1">
                            {isSetupMode ? 'Crea una Contraseña' : 'Contraseña'}
                        </label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none border"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm font-medium text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className={`w-full text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${isSetupMode
                            ? 'bg-amber-600 hover:bg-amber-500'
                            : 'bg-purple-600 hover:bg-purple-500'
                            }`}
                    >
                        {isPending ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            isSetupMode ? 'Crear Administrador' : 'Entrar'
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}

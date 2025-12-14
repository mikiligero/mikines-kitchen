'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/app/actions/auth'
import { Loader2, Lock } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string>('')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        const formData = new FormData(e.currentTarget)

        startTransition(async () => {
            const result = await login(formData)
            if (result?.error) {
                setError(result.error)
            } else {
                router.push('/')
                router.refresh()
            }
        })
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex items-start justify-center p-4 pt-32">
            <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 bg-purple-500/10 rounded-full mb-4 text-purple-500">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Mikines Kitchen</h1>
                    <p className="text-zinc-500 text-sm">Inicia sesión para continuar</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Usuario</label>
                        <input
                            name="username"
                            type="text"
                            required
                            className="w-full bg-zinc-800 border-zinc-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            placeholder="Usuario"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Contraseña</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full bg-zinc-800 border-zinc-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
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
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {isPending ? <Loader2 className="animate-spin" size={20} /> : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    )
}

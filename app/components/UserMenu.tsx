'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import { User, LogOut, KeyRound } from 'lucide-react'
import { ChangePasswordModal } from './ChangePasswordModal'

export function UserMenu() {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [showPasswordModal, setShowPasswordModal] = useState(false)

    const handleLogout = async () => {
        await logout()
        router.push('/login')
        router.refresh()
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-purple-600 transition-colors"
            >
                <User size={20} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg z-20 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800">
                            <p className="text-xs text-zinc-500">Sesión iniciada como</p>
                            <p className="font-medium truncate">mikines</p>
                        </div>

                        <button
                            onClick={() => {
                                setIsOpen(false)
                                setShowPasswordModal(true)
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                        >
                            <KeyRound size={16} /> Cambiar Contraseña
                        </button>

                        <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"
                        >
                            <LogOut size={16} /> Cerrar Sesión
                        </button>
                    </div>
                </>
            )}

            <ChangePasswordModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
            />
        </div>
    )
}

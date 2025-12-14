'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Settings } from 'lucide-react'
import { UserMenu } from './UserMenu'

export function Header() {
    const pathname = usePathname()

    return (
        <header className="border-b bg-white dark:bg-zinc-900 sticky top-0 z-50 transition-colors">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden group-hover:opacity-90 transition-opacity">
                        <Image
                            src="/mikines-logo-v3.png"
                            alt="Mikines Kitchen Logo"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-zinc-100">
                        Mikines Kitchen
                    </span>
                </Link>
                {!pathname?.startsWith('/login') && (
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin"
                            className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:text-purple-600 dark:hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
                            title="Administración"
                        >
                            <Settings size={20} />
                        </Link>
                        <UserMenu />
                    </div>
                )}
            </div>
        </header>
    )
}

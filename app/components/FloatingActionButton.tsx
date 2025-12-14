'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plus } from 'lucide-react'

export function FloatingActionButton() {
    const pathname = usePathname()

    if (pathname?.startsWith('/login')) return null

    return (
        <Link
            href="/recipes/new"
            className="fixed bottom-8 right-8 z-50 p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 group"
            title="Nueva Receta"
        >
            <Plus size={28} className="transition-transform group-hover:rotate-90" />
        </Link>
    )
}

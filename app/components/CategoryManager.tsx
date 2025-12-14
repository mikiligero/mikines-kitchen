'use client'
import { deleteCategory, createCategory, updateCategory } from '@/app/actions/recipes'
import { Trash2, Plus, Pencil, Save, X, Loader2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils'

export function CategoryManager({ categories }: { categories: { id: string; name: string }[] }) {
    const [isPending, startTransition] = useTransition()
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')
    const [newName, setNewName] = useState('')

    const handleDelete = (id: string, name: string) => {
        if (confirm(`¿Estás seguro de que quieres borrar la categoría "${name}"? Esto NO borrará las recetas asociadas.`)) {
            startTransition(async () => {
                await deleteCategory(id)
            })
        }
    }

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newName.trim()) return

        startTransition(async () => {
            await createCategory(newName)
            setNewName('')
        })
    }

    const startEdit = (cat: { id: string, name: string }) => {
        setEditingId(cat.id)
        setEditName(cat.name)
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditName('')
    }

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault()
        if (!editName.trim() || !editingId) return

        startTransition(async () => {
            await updateCategory(editingId, editName)
            setEditingId(null)
            setEditName('')
        })
    }

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Gestión de Categorías</h2>
                <p className="text-zinc-500 text-sm mt-1">
                    Administra las categorías disponibles. Borrar una categoría la desvinculará de las recetas.
                </p>
            </div>

            {/* Create New */}
            <form onSubmit={handleCreate} className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex gap-2">
                <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nueva categoría..."
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                    type="submit"
                    disabled={isPending || !newName.trim()}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isPending ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                    Crear
                </button>
            </form>

            {categories.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">
                    No hay categorías creadas aún.
                </div>
            ) : (
                <ul className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-[400px] overflow-y-auto">
                    {categories.map((cat) => (
                        <li key={cat.id} className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
                            {editingId === cat.id ? (
                                <form onSubmit={handleUpdate} className="flex-1 flex gap-2 items-center mr-2">
                                    <input
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="flex-1 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-sm"
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        disabled={isPending}
                                        className="p-1 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded"
                                    >
                                        <Save size={18} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className="p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded"
                                    >
                                        <X size={18} />
                                    </button>
                                </form>
                            ) : (
                                <>
                                    <span className="font-medium text-zinc-700 dark:text-zinc-300">{cat.name}</span>
                                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => startEdit(cat)}
                                            disabled={isPending}
                                            className="p-2 text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat.id, cat.name)}
                                            disabled={isPending}
                                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Borrar"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

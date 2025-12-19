'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createRecipe, updateRecipe, RecipeWithRelations } from '@/app/actions/recipes'
import { uploadImage } from '@/app/actions/upload'
import { Plus, Trash2, Upload, Loader2, Save, FileJson, PenTool, Copy, Link as LinkIcon, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CategorySelector } from './CategorySelector'
import { StarRating } from './StarRating'
import { ImageSearchModal } from './ImageSearchModal'
import { ImageCropper } from './ImageCropper'

const JSON_TEMPLATE = {
    "title": "Recipe Name",
    "description": "Short description",
    "servings": 4,
    "prepTime": 15,
    "cookTime": 30,
    "rating": 5,
    "notes": "Tus notas personales aquí...",
    "ingredients": [
        { "name": "Ingredient 1", "amount": 100, "unit": "g" },
        { "name": "Ingredient 2", "amount": 2, "unit": "tbsp" }
    ],
    "instructions": [
        "Step 1: Preheat oven...",
        "Step 2: Mix ingredients...",
        "Step 3: Bake..."
    ]
}

interface RecipeFormProps {
    initialData?: RecipeWithRelations
}

export function RecipeForm({ initialData }: RecipeFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    // Mode State
    const [mode, setMode] = useState<'manual' | 'json'>('manual')
    const [jsonInput, setJsonInput] = useState('')
    const [jsonError, setJsonError] = useState<string | null>(null)

    // Image State
    const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload')
    const [imageUrl, setImageUrl] = useState('')
    const [showImageSearch, setShowImageSearch] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // Form State
    const [ingredients, setIngredients] = useState<{ name: string; amount: string; unit: string }[]>(
        initialData?.ingredients?.map(i => ({ name: i.name, amount: String(i.amount), unit: i.unit }))
        ?? [{ name: '', amount: '', unit: '' }]
    )
    const [categories, setCategories] = useState<string[]>(
        initialData?.categories?.map(c => c.name) ?? []
    )
    const [rating, setRating] = useState(initialData?.rating || 0)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.imagePath ?? null)

    // Dirty state tracking for unsaved changes warning
    const [isDirty, setIsDirty] = useState(false)

    // Monitor changes to set dirty state
    useEffect(() => {
        // Handle browser actions (close tab, refresh, back button)
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault()
                e.returnValue = ''
            }
        }

        // Handle internal navigation (clicking links)
        const handleAnchorClick = (e: MouseEvent) => {
            if (!isDirty) return

            const target = e.target as HTMLElement
            const anchor = target.closest('a')

            if (anchor) {
                // Ignore new tabs or downloads
                if (anchor.target === '_blank' || anchor.hasAttribute('download')) return

                // Confirm navigation
                if (!window.confirm('Tienes cambios sin guardar. ¿Seguro que quieres salir?')) {
                    e.preventDefault()
                    e.stopPropagation() // Stop Next.js Link navigation
                }
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        window.addEventListener('click', handleAnchorClick, true) // Capture phase to intercept before Next.js

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
            window.removeEventListener('click', handleAnchorClick, true)
        }
    }, [isDirty])

    // Detect changes in inputs
    const handleFormChange = () => {
        if (!isDirty) setIsDirty(true)
    }

    // Cropper State
    const [showCropper, setShowCropper] = useState(false)
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null)

    const addIngredient = () => {
        setIngredients([...ingredients, { name: '', amount: '', unit: '' }])
        if (!isDirty) setIsDirty(true)
    }

    const removeIngredient = (index: number) => {
        if (ingredients.length > 1) {
            setIngredients(ingredients.filter((_, i) => i !== index))
            if (!isDirty) setIsDirty(true)
        }
    }

    const handleIngredientChange = (index: number, field: keyof typeof ingredients[0], value: string) => {
        const newIngredients = [...ingredients]
        newIngredients[index][field] = value
        setIngredients(newIngredients)
        if (!isDirty) setIsDirty(true)
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            if (!isDirty) setIsDirty(true)
            const file = e.target.files[0]
            const url = URL.createObjectURL(file)
            setCropImageSrc(url)
            setShowCropper(true)
            e.target.value = '' // Allow selecting same file again
        }
    }

    const handleCropComplete = (croppedBlob: Blob) => {
        const file = new File([croppedBlob], "cropped-image.jpg", { type: "image/jpeg" })
        setImageFile(file)
        setPreviewUrl(URL.createObjectURL(file))
        setShowCropper(false)
        setCropImageSrc(null)
    }

    const handleCropCancel = () => {
        setShowCropper(false)
        setCropImageSrc(null)
    }

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value
        setImageUrl(url)
        setPreviewUrl(url)
    }

    const handleImageSelect = (url: string) => {
        setImageUrl(url)
        setPreviewUrl(url)
        setShowImageSearch(false)
    }

    const handleOpenImageSearch = () => {
        const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement
        const title = titleInput?.value || initialData?.title || ''
        setSearchQuery(title)
        setShowImageSearch(true)
    }

    const copyTemplate = () => {
        navigator.clipboard.writeText(JSON.stringify(JSON_TEMPLATE, null, 2))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setJsonError(null)

        startTransition(async () => {
            const formData = new FormData(e.currentTarget)

            let recipeData;

            if (mode === 'manual') {
                recipeData = {
                    title: formData.get('title') as string,
                    description: formData.get('description') as string,
                    instructions: formData.get('instructions') as string,
                    servings: Number(formData.get('servings')),
                    prepTime: Number(formData.get('prepTime')) || undefined,
                    cookTime: Number(formData.get('cookTime')) || undefined,
                    rating: rating,
                    notes: formData.get('notes') as string,
                    ingredients: ingredients
                        .filter(i => i.name.trim() !== '')
                        .map(i => ({
                            name: i.name,
                            amount: Number(i.amount) || 0,
                            unit: i.unit
                        })),
                    categories
                }
            } else {
                try {
                    const parsed = JSON.parse(jsonInput)
                    // Basic validation
                    if (!parsed.title || !parsed.instructions || !Array.isArray(parsed.ingredients)) {
                        throw new Error("Invalid JSON structure. Must have title, instructions (array or string), and ingredients array.")
                    }

                    // Handle instructions as array or string
                    const instructions = Array.isArray(parsed.instructions)
                        ? parsed.instructions.join('\n\n')
                        : parsed.instructions

                    recipeData = {
                        ...parsed,
                        instructions,
                        rating: rating > 0 ? rating : (parsed.rating || 0),
                        notes: parsed.notes || '',
                        categories: [...(parsed.categories || []), ...categories] // Merge parsed categories with manually selected ones if needed
                    }
                } catch (err: unknown) {
                    setJsonError(err instanceof Error ? err.message : "Invalid JSON")
                    return
                }
            }

            let imagePath = initialData?.imagePath || ''

            if (imageMode === 'upload' && imageFile) {
                const uploadFormData = new FormData()
                uploadFormData.append('image', imageFile)
                const uploadedPath = await uploadImage(uploadFormData)
                if (uploadedPath) imagePath = uploadedPath
            } else if (imageMode === 'url' && imageUrl) {
                imagePath = imageUrl
            }

            try {
                const payload = {
                    ...recipeData,
                    imagePath: imagePath || undefined
                }

                if (initialData?.id) {
                    await updateRecipe(initialData.id, payload)
                } else {
                    await createRecipe(payload)
                }

                router.push(initialData?.id ? `/recipes/${initialData.id}` : '/')
                router.refresh()
            } catch (error) {
                console.error("Failed to save recipe", error)
                setJsonError("Server error saving recipe")
            }
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {initialData ? 'Editar Receta' : 'Crear Nueva Receta'}
                </h2>

                <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                    <button
                        type="button"
                        onClick={() => setMode('manual')}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                            mode === 'manual' ? "bg-white dark:bg-zinc-700 shadow-sm text-purple-600 dark:text-purple-300" : "text-zinc-500 dark:text-zinc-400"
                        )}
                    >
                        <PenTool size={16} /> Manual
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('json')}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                            mode === 'json' ? "bg-white dark:bg-zinc-700 shadow-sm text-purple-600 dark:text-purple-300" : "text-zinc-500 dark:text-zinc-400"
                        )}
                    >
                        <FileJson size={16} /> Importar JSON
                    </button>
                </div>
            </div>

            {mode === 'manual' && (
                <div className="grid gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Título de la Receta</label>
                        <input
                            name="title"
                            required
                            defaultValue={initialData?.title}
                            onChange={handleFormChange}
                            className="w-full p-2 rounded-lg border bg-transparent"
                            placeholder="ej. Tarta de Manzana de la Abuela"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Descripción</label>
                        <textarea
                            name="description"
                            defaultValue={initialData?.description || ''}
                            onChange={handleFormChange}
                            className="w-full p-2 rounded-lg border bg-transparent h-20"
                            placeholder="Una breve historia sobre esta receta..."
                        />
                    </div>
                </div>
            )}

            {/* JSON Input - Moved to top for JSON mode */}
            {mode === 'json' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium">Datos JSON</label>
                        <button
                            type="button"
                            onClick={copyTemplate}
                            className="text-xs flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                        >
                            <Copy size={14} /> Copiar Plantilla
                        </button>
                    </div>
                    <p className="text-xs text-zinc-500">Pega aquí el JSON de tu receta. La estructura debe coincidir con la plantilla.</p>
                    <textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        className="w-full p-4 rounded-xl border bg-zinc-50 dark:bg-zinc-950/50 font-mono text-sm h-96 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        placeholder={JSON.stringify(JSON_TEMPLATE, null, 2)}
                    />
                    {jsonError && (
                        <p className="text-red-500 text-sm">{jsonError}</p>
                    )}
                </div>
            )}

            {/* Categories - Common for both modes (or at least useful to have outside JSON) */}
            <CategorySelector selected={categories} onChange={setCategories} />

            <div className="pt-2">
                <label className="block text-sm font-medium mb-1">Valoración</label>
                <StarRating value={rating} onChange={setRating} size={24} />
            </div>

            {mode === 'manual' && (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Porciones</label>
                            <input type="number" name="servings" defaultValue={initialData?.servings || 4} min={1} className="w-full p-2 rounded-lg border bg-transparent" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Prep (min)</label>
                            <input type="number" name="prepTime" defaultValue={initialData?.prepTime || ''} className="w-full p-2 rounded-lg border bg-transparent" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Cocción (min)</label>
                            <input type="number" name="cookTime" defaultValue={initialData?.cookTime || ''} className="w-full p-2 rounded-lg border bg-transparent" />
                        </div>
                    </div>

                    {/* Ingredients */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium">Ingredientes</label>
                            <button type="button" onClick={addIngredient} className="text-sm text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1 hover:text-purple-700 dark:hover:text-purple-300">
                                <Plus size={16} /> Añadir Ingrediente
                            </button>
                        </div>
                        <div className="space-y-2">
                            {ingredients.map((ing, i) => (
                                <div key={i} className="flex gap-2">
                                    <input
                                        placeholder="Cant."
                                        value={ing.amount}
                                        onChange={e => handleIngredientChange(i, 'amount', e.target.value)}
                                        className="w-20 p-2 rounded-lg border bg-transparent"
                                    />
                                    <input
                                        placeholder="Unidad"
                                        value={ing.unit}
                                        onChange={e => handleIngredientChange(i, 'unit', e.target.value)}
                                        className="w-24 p-2 rounded-lg border bg-transparent"
                                    />
                                    <input
                                        placeholder="Nombre del ingrediente"
                                        value={ing.name}
                                        onChange={e => handleIngredientChange(i, 'name', e.target.value)}
                                        className="flex-1 p-2 rounded-lg border bg-transparent"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeIngredient(i)}
                                        className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                                        disabled={ingredients.length === 1}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Instructions */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Instrucciones</label>
                        <textarea
                            name="instructions"
                            required
                            defaultValue={initialData?.instructions}
                            onChange={handleFormChange}
                            className="w-full p-2 rounded-lg border bg-transparent h-40 font-mono text-sm leading-relaxed"
                            placeholder="Paso 1: Precalentar el horno..."
                        />
                    </div>
                </>
            )}

            <div className="pt-2">
                <label className="block text-sm font-medium mb-1">Notas</label>
                <textarea
                    name="notes"
                    defaultValue={initialData?.notes || ''}
                    onChange={handleFormChange}
                    placeholder="Escribe tus trucos o variaciones..."
                    className="w-full p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg dark:bg-zinc-800 min-h-[100px]"
                />
            </div>

            {/* Image Selection */}
            <div className="space-y-4">
                <div className="flex gap-4 border-b border-zinc-100 dark:border-zinc-800">
                    <button
                        type="button"
                        onClick={() => setImageMode('upload')}
                        className={cn(
                            "pb-2 text-sm font-medium transition-colors relative",
                            imageMode === 'upload' ? "text-purple-600 dark:text-purple-300" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700"
                        )}
                    >
                        Subir Foto
                        {imageMode === 'upload' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400" />}
                    </button>
                    <button
                        type="button"
                        onClick={() => setImageMode('url')}
                        className={cn(
                            "pb-2 text-sm font-medium transition-colors relative",
                            imageMode === 'url' ? "text-purple-600 dark:text-purple-300" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700"
                        )}
                    >
                        URL de Internet
                        {imageMode === 'url' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400" />}
                    </button>
                </div>

                {imageMode === 'upload' ? (
                    <div className="space-y-4">
                        {/* Standard File Input Area */}
                        <div className="relative aspect-video rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-purple-500 transition-colors group">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            {previewUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={previewUrl} alt="Vista previa" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center justify-center w-full h-full text-zinc-400 group-hover:text-purple-500 transition-colors">
                                    <Upload size={32} className="mb-2" />
                                    <span className="text-sm font-medium">Haz clic para subir foto</span>
                                </div>
                            )}
                        </div>

                        {/* Mobile Camera Button - hidden on desktop via CSS if desired, or always visible */}
                        <div className="flex justify-center md:hidden">
                            <label className="flex items-center gap-2 px-4 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-medium cursor-pointer active:scale-95 transition-transform w-full justify-center">
                                <span className="text-xl">📷</span>
                                <span>Hacer Foto</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <LinkIcon size={16} className="absolute left-3 top-3 text-zinc-400" />
                                <input
                                    type="url"
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                    value={imageUrl}
                                    onChange={handleUrlChange}
                                    className="w-full pl-10 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleOpenImageSearch}
                                className="px-4 py-2 bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors"
                            >
                                <Search size={16} /> Buscar Imagen
                            </button>
                        </div>

                        {previewUrl && (
                            <div className="aspect-video rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={previewUrl} alt="Vista previa" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={isPending}
                className={cn(
                    "w-full py-3 rounded-xl bg-purple-600 text-white font-medium flex items-center justify-center gap-2 hover:bg-purple-700 transition-all",
                    isPending && "opacity-70 cursor-not-allowed"
                )}
            >
                {isPending ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                {isPending ? "Guardando Receta..." : "Guardar Receta"}
            </button>

            {showCropper && cropImageSrc && (
                <ImageCropper
                    imageSrc={cropImageSrc}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                />
            )}

            <ImageSearchModal
                isOpen={showImageSearch}
                onClose={() => setShowImageSearch(false)}
                onSelect={handleImageSelect}
                initialQuery={searchQuery}
            />
        </form>
    )
}

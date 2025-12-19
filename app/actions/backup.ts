'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import AdmZip from 'adm-zip'
import fs from 'node:fs/promises'
import path from 'node:path'

// Types for the backup data
type BackupData = {
    version: number
    generatedAt: string
    categories: { id: string; name: string }[]
    users?: { id: string; username: string; password: string }[]
    recipes: any[] // Using any to avoid complex nested types, but effectively matches Prisma return
}

export async function getBackupData(): Promise<BackupData> {
    const categories = await prisma.category.findMany()
    const recipes = await prisma.recipe.findMany({
        include: {
            ingredients: true,
            categories: true
        }
    })

    return {
        version: 1,
        generatedAt: new Date().toISOString(),
        categories,
        recipes
    }
}

export async function restoreBackupFromZip(formData: FormData) {
    // This server action is kept for backward compatibility or non-streaming usage
    // tailored to use the internal logic but without the streaming response directly here
    // unless we change how we call it. For the streaming API, we will use performRestoreFromZip directly.
    const file = formData.get('backup') as File

    if (!file) {
        throw new Error('No backup file provided')
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    await performRestoreFromZip(buffer)
}

export async function performRestoreFromZip(buffer: Buffer, onProgress?: (message: string) => void) {
    const log = (msg: string) => {
        if (onProgress) onProgress(msg)
        console.log(`[Restore] ${msg}`)
    }

    log('Iniciando proceso de restauración...')
    const zip = new AdmZip(buffer)

    // 1. Extract and Restore Database
    log('Extrayendo archivo backup.json...')
    const jsonEntry = zip.getEntry('backup.json')
    if (!jsonEntry) {
        log('ERROR: No se encontró backup.json en el archivo ZIP')
        throw new Error('Invalid backup: missing backup.json')
    }

    const jsonContent = zip.readAsText(jsonEntry)
    log('Analizando contenido JSON...')
    const data: BackupData = JSON.parse(jsonContent)

    await restoreBackup(data, onProgress)

    // 2. Extract Images
    log('Preparando restauración de imágenes...')
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')

    // Ensure dir exists
    try {
        await fs.access(uploadsDir)
    } catch {
        log('Creando directorio public/uploads...')
        await fs.mkdir(uploadsDir, { recursive: true })
    }

    const entries = zip.getEntries()
    const imageEntries = entries.filter(e => !e.isDirectory && e.entryName.startsWith('uploads/'))
    log(`Encontradas ${imageEntries.length} imágenes para restaurar...`)

    let imageCount = 0
    for (const entry of entries) {
        if (!entry.isDirectory && entry.entryName.startsWith('uploads/')) {
            const fileName = path.basename(entry.entryName)
            // Prevent directory traversal or weird names if flattened
            if (fileName && fileName !== 'uploads') {
                const targetPath = path.join(uploadsDir, fileName)
                await fs.writeFile(targetPath, entry.getData())
                imageCount++
                if (imageCount % 10 === 0) {
                    log(`Restauradas ${imageCount} imágenes...`)
                }
            }
        }
    }
    log(`Restauración de imágenes completada. Total: ${imageCount}`)
    log('Proceso de restauración finalizado exitosamente.')
}

export async function restoreBackup(data: BackupData, onProgress?: (message: string) => void) {
    const log = (msg: string) => {
        if (onProgress) onProgress(msg)
    }

    if (!data.version || !data.categories || !data.recipes) {
        log('ERROR: Formato de archivo inválido')
        throw new Error('Invalid backup file format')
    }

    log(`Versión del backup: ${data.version}`)
    log(`Fecha del backup: ${data.generatedAt}`)

    // Execute in transaction to ensure integrity
    log('Iniciando transacción de base de datos...')
    await prisma.$transaction(async (tx) => {
        // 1. Clear existing data
        log('Limpiando base de datos actual...')

        log('Eliminando ingredientes...')
        await tx.ingredient.deleteMany()

        log('Eliminando recetas...')
        await tx.recipe.deleteMany()

        // Disconnect categories from recipes (technically handled by recipe deletion but good to be safe if m-n is implicit)
        // Actually implicit m-n table entries are deleted when recipe is deleted.

        log('Eliminando categorías...')
        await tx.category.deleteMany()

        log('Eliminando usuarios...')
        await tx.user.deleteMany()

        // 2. Restore Users (if present)
        if (data.users) {
            log(`Restaurando ${data.users.length} usuarios...`)
            for (const user of data.users) {
                await tx.user.create({
                    data: {
                        id: user.id,
                        username: user.username,
                        password: user.password
                    }
                })
            }
        }

        // 2. Restore Categories
        // We use createMany if possible, but SQLite might have limits.
        // Also we want to preserve IDs.
        log(`Restaurando ${data.categories.length} categorías...`)
        for (const cat of data.categories) {
            await tx.category.create({
                data: {
                    id: cat.id,
                    name: cat.name
                }
            })
        }

        // 3. Restore Recipes
        log(`Restaurando ${data.recipes.length} recetas...`)
        for (const recipe of data.recipes) {
            // We need to reconstruct the create payload
            // connect categories by ID
            const categoryIds = recipe.categories.map((c: any) => ({ id: c.id }))

            await tx.recipe.create({
                data: {
                    id: recipe.id,
                    title: recipe.title,
                    description: recipe.description,
                    instructions: recipe.instructions,
                    servings: recipe.servings,
                    prepTime: recipe.prepTime,
                    cookTime: recipe.cookTime,
                    rating: recipe.rating,
                    notes: recipe.notes,
                    imagePath: recipe.imagePath,
                    createdAt: recipe.createdAt,
                    updatedAt: recipe.updatedAt,
                    ingredients: {
                        create: recipe.ingredients.map((ing: any) => ({
                            id: ing.id,
                            name: ing.name,
                            amount: ing.amount,
                            unit: ing.unit
                        }))
                    },
                    categories: {
                        connect: categoryIds
                    }
                }
            })
        }
    })
    log('Base de datos restaurada correctamente.')

    revalidatePath('/')
    revalidatePath('/admin')
    revalidatePath('/recipes')
}

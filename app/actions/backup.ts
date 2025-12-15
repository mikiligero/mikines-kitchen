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
    const file = formData.get('backup') as File

    if (!file) {
        throw new Error('No backup file provided')
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    await performRestoreFromZip(buffer)
}

export async function performRestoreFromZip(buffer: Buffer) {
    const zip = new AdmZip(buffer)

    // 1. Extract and Restore Database
    const jsonEntry = zip.getEntry('backup.json')
    if (!jsonEntry) throw new Error('Invalid backup: missing backup.json')

    const jsonContent = zip.readAsText(jsonEntry)
    const data: BackupData = JSON.parse(jsonContent)

    await restoreBackup(data)

    // 2. Extract Images
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')

    // Ensure dir exists
    try {
        await fs.access(uploadsDir)
    } catch {
        await fs.mkdir(uploadsDir, { recursive: true })
    }

    const entries = zip.getEntries()
    for (const entry of entries) {
        if (!entry.isDirectory && entry.entryName.startsWith('uploads/')) {
            const fileName = path.basename(entry.entryName)
            // Prevent directory traversal or weird names if flattened
            if (fileName && fileName !== 'uploads') {
                const targetPath = path.join(uploadsDir, fileName)
                await fs.writeFile(targetPath, entry.getData())
            }
        }
    }
}

export async function restoreBackup(data: BackupData) {
    if (!data.version || !data.categories || !data.recipes) {
        throw new Error('Invalid backup file format')
    }

    // Execute in transaction to ensure integrity
    await prisma.$transaction(async (tx) => {
        // 1. Clear existing data
        // Delete recipes first (cascades to ingredients)
        await tx.ingredient.deleteMany()
        await tx.recipe.deleteMany()

        // Disconnect categories from recipes (technically handled by recipe deletion but good to be safe if m-n is implicit)
        // Actually implicit m-n table entries are deleted when recipe is deleted.

        // Delete categories
        await tx.category.deleteMany()

        // Delete users
        await tx.user.deleteMany()

        // 2. Restore Users (if present)
        if (data.users) {
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
        for (const cat of data.categories) {
            await tx.category.create({
                data: {
                    id: cat.id,
                    name: cat.name
                }
            })
        }

        // 3. Restore Recipes
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

    revalidatePath('/')
    revalidatePath('/admin')
    revalidatePath('/recipes')
}

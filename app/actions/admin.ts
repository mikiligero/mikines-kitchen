'use server'

import prisma from '@/lib/prisma'
import fs from 'fs/promises'
import path from 'path'

export async function cleanOrphanedImages() {
    try {
        // 1. Get all image paths currently in use by recipes
        const recipes = await prisma.recipe.findMany({
            select: { imagePath: true },
            where: { imagePath: { not: null } }
        })

        const usedImages = new Set<string>()
        recipes.forEach(r => {
            if (r.imagePath) {
                // Extract filename from path (e.g., "/uploads/xyz.jpg" -> "xyz.jpg")
                const filename = path.basename(r.imagePath)
                usedImages.add(filename)
            }
        })

        // 2. Get all files in the uploads directory
        const uploadDir = path.join(process.cwd(), 'public', 'uploads')

        try {
            await fs.access(uploadDir)
        } catch {
            return { count: 0, message: "No hay directorio de imágenes." }
        }

        const files = await fs.readdir(uploadDir)

        // 3. Find orphaned files
        let deletedCount = 0
        const filesToDelete: string[] = []

        for (const file of files) {
            if (!usedImages.has(file) && file !== '.gitkeep') {
                filesToDelete.push(path.join(uploadDir, file))
            }
        }

        // 4. Delete files
        await Promise.all(
            filesToDelete.map(async (filepath) => {
                try {
                    await fs.unlink(filepath)
                    deletedCount++
                } catch (err) {
                    console.error(`Error deleting file ${filepath}:`, err)
                }
            })
        )

        return {
            count: deletedCount,
            message: `Se han eliminado ${deletedCount} imágenes sin usar.`
        }

    } catch (error) {
        console.error('Error cleaning library:', error)
        return { count: 0, message: "Error al limpiar la librería." }
    }
}

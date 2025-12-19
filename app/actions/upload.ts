'use server'

import fs from 'node:fs/promises'
import path from 'node:path'
import { v4 as uuidv4 } from 'uuid'

import sharp from 'sharp'

export async function uploadImage(formData: FormData): Promise<string | null> {
    const file = formData.get('image') as File
    if (!file || file.size === 0) return null

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')

    // Ensure directory exists
    try {
        await fs.access(uploadDir)
    } catch {
        await fs.mkdir(uploadDir, { recursive: true })
    }

    // Process image with sharp
    // Resize to max 1080px width/height, convert to webp, quality 80%
    const optimizedBuffer = await sharp(buffer)
        .resize(1080, 1080, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer()

    // Create filename with .webp extension
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '').replace(/\.[^/.]+$/, "")
    const filename = `${uuidv4()}-${cleanName}.webp`
    const filepath = path.join(uploadDir, filename)

    await fs.writeFile(filepath, optimizedBuffer)

    // Return the API URL instead of the static public URL
    return `/api/uploads/${filename}`
}

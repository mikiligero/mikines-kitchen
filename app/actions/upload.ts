'use server'

import fs from 'node:fs/promises'
import path from 'node:path'
import { v4 as uuidv4 } from 'uuid'

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

    const filename = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
    const filepath = path.join(uploadDir, filename)

    await fs.writeFile(filepath, buffer)

    return `/uploads/${filename}`
}

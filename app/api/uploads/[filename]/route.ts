import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    const filename = (await params).filename

    // Security: prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return new NextResponse('Invalid filename', { status: 400 })
    }

    const filePath = path.join(process.cwd(), 'public', 'uploads', filename)

    try {
        const fileBuffer = await fs.readFile(filePath)

        // Determine content type
        const ext = path.extname(filename).toLowerCase()
        let contentType = 'application/octet-stream'
        if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg'
        if (ext === '.png') contentType = 'image/png'
        if (ext === '.webp') contentType = 'image/webp'
        if (ext === '.gif') contentType = 'image/gif'

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        })
    } catch (error) {
        return new NextResponse('File not found', { status: 404 })
    }
}

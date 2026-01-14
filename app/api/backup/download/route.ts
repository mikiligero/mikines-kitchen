import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import AdmZip from 'adm-zip'
import fs from 'node:fs/promises'
import path from 'node:path'

export async function GET(request: NextRequest) {
    try {
        const zip = new AdmZip()

        // 1. Fetch DB Data
        const categories = await prisma.category.findMany()
        const users = await prisma.user.findMany()
        const recipes = await prisma.recipe.findMany({
            include: {
                ingredients: true,
                categories: true
            }
        })

        const backupData = {
            version: 1,
            generatedAt: new Date().toISOString(),
            users,
            categories,
            recipes
        }

        // Add backup.json to zip
        zip.addFile('backup.json', Buffer.from(JSON.stringify(backupData, null, 2)))

        // 2. Add Images
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
        try {
            // Check if uploads dir exists
            await fs.access(uploadsDir)

            // Read dir
            const files = await fs.readdir(uploadsDir)

            for (const file of files) {
                // Filter out system files like .DS_Store
                if (file.startsWith('.')) continue;

                const filePath = path.join(uploadsDir, file)
                const fileStat = await fs.stat(filePath)

                if (fileStat.isFile()) {
                    zip.addLocalFile(filePath, 'uploads')
                }
            }
        } catch (error) {
            // If uploads dir doesn't exist, just verify empty/skip

        }

        const buffer = zip.toBuffer()

        // 3. Return Response
        const filename = `recipines_backup_${new Date().toISOString().split('T')[0]}.zip`

        return new NextResponse(new Uint8Array(buffer), {
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        })

    } catch (error) {
        console.error("Backup generation error:", error)
        return NextResponse.json({ error: 'Failed to generate backup' }, { status: 500 })
    }
}

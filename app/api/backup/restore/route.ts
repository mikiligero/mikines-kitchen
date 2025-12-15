import { NextRequest, NextResponse } from 'next/server'
import { performRestoreFromZip } from '@/app/actions/backup'

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '512mb',
        },
    },
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('backup') as File

        if (!file) {
            return NextResponse.json(
                { error: 'No backup file provided' },
                { status: 400 }
            )
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        await performRestoreFromZip(buffer)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('API Route: Restore failed', error)
        return NextResponse.json(
            { error: 'Failed to restore backup' },
            { status: 500 }
        )
    }
}

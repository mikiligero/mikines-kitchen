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

        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder()

                const sendLog = (message: string) => {
                    const data = JSON.stringify({ message }) + '\n'
                    controller.enqueue(encoder.encode(data))
                }

                try {
                    await performRestoreFromZip(buffer, sendLog)
                    // Send success signal
                    controller.enqueue(encoder.encode(JSON.stringify({ success: true }) + '\n'))
                    controller.close()
                } catch (error: any) {
                    console.error('API Route: Restore failed', error)
                    const errorMessage = error.message || 'Unknown error during restore'
                    // Send error signal
                    controller.enqueue(encoder.encode(JSON.stringify({ error: errorMessage }) + '\n'))
                    controller.close()
                }
            }
        })

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'application/x-ndjson',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        })

    } catch (error) {
        console.error('API Route: Restore failed', error)
        return NextResponse.json(
            { error: 'Failed to restore backup' },
            { status: 500 }
        )
    }
}

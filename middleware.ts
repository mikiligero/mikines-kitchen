import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-this'
const key = new TextEncoder().encode(SECRET_KEY)

export async function middleware(request: NextRequest) {
    // 1. Check for public routes
    if (
        request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/api') || // Allow APIs if needed, but risky. For now keeping minimal.
        request.nextUrl.pathname.includes('.') // Assume files with extensions are assets (images, etc)
    ) {
        return NextResponse.next()
    }

    // 2. Check for session cookie
    const session = request.cookies.get('session')?.value

    if (!session) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // 3. Verify session
    try {
        await jwtVerify(session, key, { algorithms: ['HS256'] })
        return NextResponse.next()
    } catch {
        // Invalid token
        return NextResponse.redirect(new URL('/login', request.url))
    }
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

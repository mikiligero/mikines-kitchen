'use server'

import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-this'
const key = new TextEncoder().encode(SECRET_KEY)

export async function login(formData: FormData) {
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    if (!username || !password) return { error: 'Rellena todos los campos' }

    // SQLite approach for case-insensitive lookup
    // Note: We need to query raw because Prisma's 'mode: insensitive' doesn't support SQLite
    const users = await prisma.$queryRaw<Array<{ id: string, username: string, password: string }>>`
        SELECT * FROM User WHERE LOWER(username) = LOWER(${username}) LIMIT 1
    `
    const user = users[0]

    if (!user) return { error: 'Credenciales inválidas' }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) return { error: 'Credenciales inválidas' }

    // Create session
    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 365 days
    const session = await new SignJWT({ userId: user.id, username: user.username })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('365d')
        .sign(key)

    // Set cookie
    // Note: In Next.js Server Actions, we need to await cookies()
    const cookieStore = await cookies()
    cookieStore.set('session', session, {
        httpOnly: true,
        // Allow HTTP for local network production deployments
        secure: false, // process.env.NODE_ENV === 'production',
        expires,
        sameSite: 'lax'
    })

    return { success: true }
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('session')
}

export async function getSession() {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value
    if (!session) return null
    try {
        const { payload } = await jwtVerify(session, key, { algorithms: ['HS256'] })
        return payload
    } catch {
        return null
    }
}

export async function changePassword(formData: FormData) {
    const session = await getSession()
    if (!session) return { error: 'No autorizado' }

    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string

    if (!currentPassword || !newPassword) return { error: 'Faltan datos' }

    const user = await prisma.user.findUnique({ where: { id: session.userId as string } })
    if (!user) return { error: 'Usuario no encontrado' }

    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) return { error: 'La contraseña actual es incorrecta' }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
    })

    return { success: true }
}

export async function checkAnyUserExists() {
    try {
        const count = await prisma.user.count()
        return count > 0
    } catch (e) {
        return false
    }
}

export async function createFirstUser(formData: FormData) {
    const count = await prisma.user.count()
    if (count > 0) return { error: 'Ya existe un administrador' }

    const username = formData.get('username') as string
    const password = formData.get('password') as string

    if (!username || !password) return { error: 'Rellena todos los campos' }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data: { username, password: hashedPassword }
    })

    // Create session
    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 365 days
    const session = await new SignJWT({ userId: user.id, username: user.username })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('365d')
        .sign(key)

    const cookieStore = await cookies()
    cookieStore.set('session', session, {
        httpOnly: true,
        secure: false, // Disabling secure for LAN deployment
        expires,
        sameSite: 'lax'
    })

    return { success: true }
}

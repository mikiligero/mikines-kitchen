import { describe, it, expect, vi, beforeEach } from 'vitest'
import { login, createFirstUser } from './auth'

// Mocks
const mockQueryRaw = vi.fn()
const mockCreate = vi.fn()
const mockCount = vi.fn()
const mockFindUnique = vi.fn()
const mockUpdate = vi.fn()

vi.mock('@/lib/prisma', () => ({
    default: {
        $queryRaw: (...args: any[]) => mockQueryRaw(...args),
        user: {
            create: (...args: any[]) => mockCreate(...args),
            count: (...args: any[]) => mockCount(...args),
            findUnique: (...args: any[]) => mockFindUnique(...args),
            update: (...args: any[]) => mockUpdate(...args),
        }
    }
}))

// Mock bcrypt
const mockCompare = vi.fn()
const mockHash = vi.fn()

vi.mock('bcryptjs', () => ({
    default: {
        compare: (...args: any[]) => mockCompare(...args),
        hash: (...args: any[]) => mockHash(...args),
    }
}))

const mocks = vi.hoisted(() => {
    const sign = vi.fn().mockResolvedValue('fake-jwt-token')
    const setExpirationTime = vi.fn().mockReturnValue({ sign })
    const setProtectedHeader = vi.fn().mockReturnValue({ setExpirationTime })
    const setCookie = vi.fn()

    const deleteCookie = vi.fn()
    const getCookie = vi.fn()
    const jwtVerify = vi.fn()

    return {
        sign,
        setExpirationTime,
        setProtectedHeader,
        setCookie,
        delete: deleteCookie,
        get: getCookie,
        jwtVerify
    }
})

vi.mock('jose', () => {
    return {
        SignJWT: vi.fn().mockImplementation(function () {
            return {
                setProtectedHeader: mocks.setProtectedHeader
            }
        }),
        jwtVerify: mocks.jwtVerify,
    }
})

vi.mock('next/headers', () => ({
    cookies: () => Promise.resolve({
        set: mocks.setCookie,
        delete: mocks.delete,
        get: mocks.get
    })
}))

beforeEach(() => {
    vi.clearAllMocks()
    // Re-setup chains in case clearAllMocks wipes returns (it wipes call history mostly)
    // But better safe:
    mocks.setProtectedHeader.mockReturnValue({ setExpirationTime: mocks.setExpirationTime })
    mocks.setExpirationTime.mockReturnValue({ sign: mocks.sign })
    mocks.get.mockReturnValue(undefined)
})

describe('auth server actions', () => {
    describe('login', () => {
        it('returns error if fields missing', async () => {
            const data = new FormData()
            const result = await login(data)
            expect(result).toEqual({ error: 'Rellena todos los campos' })
        })

        it('returns error if user not found', async () => {
            const data = new FormData()
            data.append('username', 'user')
            data.append('password', 'pass')

            mockQueryRaw.mockResolvedValue([]) // No user found

            const result = await login(data)
            expect(result).toEqual({ error: 'Credenciales inválidas' })
        })

        it('returns error if password incorrect', async () => {
            const data = new FormData()
            data.append('username', 'user')
            data.append('password', 'wrongpass')

            mockQueryRaw.mockResolvedValue([{ id: '1', username: 'user', password: 'hashedpass' }])
            mockCompare.mockResolvedValue(false) // invalid

            const result = await login(data)
            expect(result).toEqual({ error: 'Credenciales inválidas' })
        })

        it('creates session on success', async () => {
            const data = new FormData()
            data.append('username', 'user')
            data.append('password', 'correctpass')

            mockQueryRaw.mockResolvedValue([{ id: '1', username: 'user', password: 'hashedpass' }])
            mockCompare.mockResolvedValue(true) // valid

            const result = await login(data)

            expect(result).toEqual({ success: true })
            expect(mocks.setCookie).toHaveBeenCalledWith('session', 'fake-jwt-token', expect.anything())
        })
    })

    describe('logout', () => {
        it('deletes the session cookie', async () => {
            const { logout } = await import('./auth')
            await logout()
            expect(mocks.delete).toHaveBeenCalledWith('session')
        })
    })

    describe('changePassword', () => {
        it('fails if no session', async () => {
            const { changePassword } = await import('./auth')
            // mocks.get returns undefined by default
            const data = new FormData()
            const result = await changePassword(data)
            expect(result).toEqual({ error: 'No autorizado' })
        })

        it('fails if user not found', async () => {
            const { changePassword } = await import('./auth')

            // Mock session presence
            mocks.get.mockReturnValue({ value: 'valid-token' })

            // Mock verify
            mocks.jwtVerify.mockResolvedValue({ payload: { userId: '1' } })

            // Mock findUnique to null
            mockFindUnique.mockResolvedValue(null)

            const data = new FormData()
            data.append('currentPassword', 'old')
            data.append('newPassword', 'new')

            const result = await changePassword(data)
            expect(result).toEqual({ error: 'Usuario no encontrado' })
        })

        it('changes password successfully', async () => {
            const { changePassword } = await import('./auth')

            // Setup valid session
            mocks.get.mockReturnValue({ value: 'valid-token' })
            mocks.jwtVerify.mockResolvedValue({ payload: { userId: '1' } } as any)

            // Setup user found
            mockFindUnique.mockResolvedValue({ id: '1', password: 'hashed_old' })

            // Setup correct password compare
            // We need to access mockCompare which is defined in module scope
            // but not exported via hoisted. It is a simple vi.fn() at top level.
            // We need to import it? No, it's in this file.

            // Wait, mockCompare is defined: `const mockCompare = vi.fn()`
            mockCompare.mockResolvedValue(true)

            // Mock hash for new password
            // We mocked bcryptjs default export above
            // const mockHash = vi.fn()
            // access via module-level var:
            // mockHash is defined at top level
            mockHash.mockResolvedValue('hashed_new_secure')

            const data = new FormData()
            data.append('currentPassword', 'correct_old')
            data.append('newPassword', 'new_secure')

            const result = await changePassword(data)

            expect(result).toEqual({ success: true })
            expect(mockUpdate).toHaveBeenCalledWith({
                where: { id: '1' },
                data: { password: 'hashed_new_secure' }
            })
        })

        it('fails if old password incorrect', async () => {
            const { changePassword } = await import('./auth')

            mocks.get.mockReturnValue({ value: 'valid-token' })
            mocks.jwtVerify.mockResolvedValue({ payload: { userId: '1' } })

            mockFindUnique.mockResolvedValue({ id: '1', username: 'user', password: 'hashed_old_pass' })
            mockCompare.mockResolvedValue(false) // Old password incorrect

            const data = new FormData()
            data.append('currentPassword', 'wrong_old')
            data.append('newPassword', 'new')

            const result = await changePassword(data)
            expect(result).toEqual({ error: 'La contraseña actual es incorrecta' })
        })

        it('updates password on success', async () => {
            const { changePassword } = await import('./auth')

            mocks.get.mockReturnValue({ value: 'valid-token' })
            mocks.jwtVerify.mockResolvedValue({ payload: { userId: '1' } })

            mockFindUnique.mockResolvedValue({ id: '1', username: 'user', password: 'hashed_old_pass' })
            mockCompare.mockResolvedValue(true)
            mockHash.mockResolvedValue('hashed_new_pass')
            mockUpdate.mockResolvedValue({ id: '1', username: 'user', password: 'hashed_new_pass' })

            const data = new FormData()
            data.append('currentPassword', 'correct_old')
            data.append('newPassword', 'new_secure')

            const result = await changePassword(data)
            expect(result).toEqual({ success: true })
            expect(mockUpdate).toHaveBeenCalledWith({
                where: { id: '1' },
                data: { password: 'hashed_new_pass' }
            })
        })
    })
})

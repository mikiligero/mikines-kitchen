import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { Header } from './Header'

const mocks = vi.hoisted(() => ({
    pathname: '/'
}))

vi.mock('next/navigation', () => ({
    usePathname: () => mocks.pathname
}))

// Mock UserMenu to avoid complex dependencies
vi.mock('./UserMenu', () => ({
    UserMenu: () => <div data-testid="user-menu">UserMenu</div>
}))

beforeEach(() => {
    cleanup()
    mocks.pathname = '/'
})

describe('Header', () => {
    it('renders logo on home page', () => {
        render(<Header />)
        const logo = screen.getByAltText('Mikines Kitchen Logo')
        expect(logo).toBeDefined()
        expect(screen.getByText('Mikines Kitchen')).toBeDefined()
    })

    it('renders admin link and user menu on home page', () => {
        render(<Header />)
        const adminLink = screen.getByTitle('Administración')
        expect(adminLink).toBeDefined()
        expect(screen.getByTestId('user-menu')).toBeDefined()
    })

    it('hides admin link and user menu on login page', () => {
        mocks.pathname = '/login'
        render(<Header />)

        // Logo should be visible
        expect(screen.getByText('Mikines Kitchen')).toBeDefined()

        // Admin link and menu should be hidden
        expect(screen.queryByTitle('Administración')).toBeNull()
        expect(screen.queryByTestId('user-menu')).toBeNull()
    })
})

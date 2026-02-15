import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { Pagination } from './Pagination'

const mocks = vi.hoisted(() => ({
    searchParams: new URLSearchParams()
}))

vi.mock('next/navigation', () => ({
    useSearchParams: () => mocks.searchParams
}))

beforeEach(() => {
    cleanup()
    mocks.searchParams = new URLSearchParams()
})

describe('Pagination', () => {
    it('does not render if totalPages <= 1', () => {
        render(<Pagination totalPages={1} currentPage={1} />)
        expect(screen.queryByText(/página/i)).toBeNull()
    })

    it('renders correctly for multiple pages', () => {
        render(<Pagination totalPages={5} currentPage={1} />)
        expect(screen.getByText('Página 1 de 5')).toBeDefined()
    })

    it('disables "Previous" button on first page', () => {
        render(<Pagination totalPages={5} currentPage={1} />)

        const links = screen.getAllByRole('link')
        // First link is Prev
        expect(links[0].getAttribute('href')).toBe('#')
    })

    it('generates correct next page URL', () => {
        // Mock existing params
        mocks.searchParams = new URLSearchParams('q=soup')
        render(<Pagination totalPages={5} currentPage={2} />)

        const links = screen.getAllByRole('link')
        // Next link (second one) should preserve 'q=soup' and add 'page=3'
        const nextLink = links[1]
        const href = nextLink.getAttribute('href')

        // URLSearchParams sorting is browser dependent usually, but implementation just sets 'page'
        // ?q=soup&page=3 or ?page=3&q=soup
        expect(href).toContain('q=soup')
        expect(href).toContain('page=3')
    })
})

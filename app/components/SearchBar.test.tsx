import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { SearchBar } from './SearchBar'

const mocks = vi.hoisted(() => ({
    replace: vi.fn(),
    searchParams: new URLSearchParams()
}))

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        replace: mocks.replace
    }),
    useSearchParams: () => mocks.searchParams,
    usePathname: () => '/recipes'
}))

beforeEach(() => {
    cleanup()
    mocks.replace.mockClear()
    mocks.searchParams = new URLSearchParams()
})

describe('SearchBar', () => {
    it('renders with empty input by default', () => {
        render(<SearchBar />)
        const input = screen.getByPlaceholderText(/buscar recetas/i) as HTMLInputElement
        expect(input.value).toBe('')
    })

    it('renders with initial value from URL', () => {
        mocks.searchParams = new URLSearchParams('q=pasta')
        render(<SearchBar />)
        const input = screen.getByPlaceholderText(/buscar recetas/i) as HTMLInputElement
        expect(input.value).toBe('pasta')
    })

    it('updates URL on input change', async () => {
        mocks.searchParams = new URLSearchParams()
        render(<SearchBar />)
        const input = screen.getByPlaceholderText(/buscar recetas/i)

        fireEvent.change(input, { target: { value: 'soup' } })

        expect(mocks.replace).toHaveBeenCalledWith('/recipes?q=soup')
    })

    it('removes query param when clearing input', () => {
        mocks.searchParams = new URLSearchParams('q=soup')
        render(<SearchBar />)
        const input = screen.getByPlaceholderText(/buscar recetas/i)

        fireEvent.change(input, { target: { value: '' } })

        // When cleared, params is empty. toString() returns empty string.
        // The component: `router.replace(pathname?${params.toString()})`
        // So '/recipes?'
        expect(mocks.replace).toHaveBeenCalledWith('/recipes?')
    })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { FilterPanel } from './FilterPanel'

const mocks = vi.hoisted(() => ({
    push: vi.fn(),
    searchParams: new URLSearchParams(),
    useFilterOpen: true
}))

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: mocks.push }),
    useSearchParams: () => mocks.searchParams,
    usePathname: () => '/'
}))

vi.mock('./FilterContext', () => ({
    useFilter: () => ({ isOpen: mocks.useFilterOpen })
}))

const mockCategories = [
    { id: '1', name: 'Desayuno' },
    { id: '2', name: 'Cena' }
]

beforeEach(() => {
    cleanup()
    mocks.push.mockClear()
    mocks.searchParams = new URLSearchParams()
    mocks.useFilterOpen = true
})

describe('FilterPanel', () => {
    it('does not render when closed', () => {
        mocks.useFilterOpen = false
        render(<FilterPanel categories={mockCategories} />)
        expect(screen.queryByText('Categoría')).toBeNull()
    })

    it('renders categories and inputs when open', () => {
        render(<FilterPanel categories={mockCategories} />)
        expect(screen.getByText('Categoría')).toBeDefined()
        expect(screen.getByText('Desayuno')).toBeDefined()
        expect(screen.getByText('Tiempo')).toBeDefined()
    })

    it('applies category filter on click', () => {
        render(<FilterPanel categories={mockCategories} />)
        const catBtn = screen.getByText('Desayuno')
        fireEvent.click(catBtn)

        // Should push new URL with category
        expect(mocks.push).toHaveBeenCalledWith('/?category=Desayuno')
    })

    it('removes category filter on second click', () => {
        mocks.searchParams = new URLSearchParams('category=Desayuno')
        render(<FilterPanel categories={mockCategories} />)

        const catBtn = screen.getByText('Desayuno')
        fireEvent.click(catBtn)

        // Should push URL without category
        expect(mocks.push).toHaveBeenCalledWith('/?')
    })

    it('applies time filter', () => {
        render(<FilterPanel categories={mockCategories} />)
        const radio = screen.getByLabelText(/Rápido/i)
        fireEvent.click(radio)

        expect(mocks.push).toHaveBeenCalledWith('/?time=short')
    })

    it('applies sort filter', () => {
        render(<FilterPanel categories={mockCategories} />)
        const select = screen.getByRole('combobox') // Select element
        fireEvent.change(select, { target: { value: 'oldest' } })

        expect(mocks.push).toHaveBeenCalledWith('/?sort=oldest')
    })

    it('shows clear filters button when filters are active', () => {
        mocks.searchParams = new URLSearchParams('category=Desayuno')
        render(<FilterPanel categories={mockCategories} />)

        const clearBtn = screen.getByText('Limpiar Filtros')
        fireEvent.click(clearBtn)

        expect(mocks.push).toHaveBeenCalledWith('/')
    })
})

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { PortionScaler } from './PortionScaler'
import { Ingredient } from '@prisma/client'

// Mock unitConversion to avoid dependency on its logic here
vi.mock('@/lib/unitConversion', () => ({
    getGramEquivalent: vi.fn((name, amount) => {
        if (name === 'Harina' && amount === 1) return '(~120g)'
        return null
    })
}))

const mockIngredients: Ingredient[] = [
    { id: '1', name: 'Harina', amount: 1, unit: 'cup', recipeId: 'r1', createdAt: new Date(), updatedAt: new Date() },
    { id: '2', name: 'Azucar', amount: 200, unit: 'g', recipeId: 'r1', createdAt: new Date(), updatedAt: new Date() }
]

afterEach(() => {
    cleanup()
})

describe('PortionScaler', () => {
    it('renders initial ingredients correctly', () => {
        render(<PortionScaler initialServings={4} ingredients={mockIngredients} />)

        expect(screen.getByText('Harina')).toBeDefined()
        expect(screen.getByText('Azucar')).toBeDefined()
        // Check input values
        expect(screen.getByDisplayValue('1')).toBeDefined()
        expect(screen.getByDisplayValue('200')).toBeDefined()
        // Check servings display
        expect(screen.getByText('4')).toBeDefined()
    })

    it('scales amounts when incrementing servings', async () => {
        render(<PortionScaler initialServings={4} ingredients={mockIngredients} />)

        // Find plus button (second button in the group)
        const buttons = screen.getAllByRole('button')
        const plusButton = buttons[1]

        fireEvent.click(plusButton) // Servings 4 -> 5

        // Expect servings to update
        expect(screen.getByText('5')).toBeDefined()

        // Expect amounts to scale: 1 * (5/4) = 1.25
        expect(screen.getByDisplayValue('1.25')).toBeDefined()
        // 200 * (5/4) = 250
        expect(screen.getByDisplayValue('250')).toBeDefined()
    })

    it('scales amounts when decrementing servings', () => {
        render(<PortionScaler initialServings={4} ingredients={mockIngredients} />)

        const buttons = screen.getAllByRole('button')
        const minusButton = buttons[0]

        fireEvent.click(minusButton) // Servings 4 -> 3

        expect(screen.getByText('3')).toBeDefined()

        // 1 * (3/4) = 0.75
        expect(screen.getByDisplayValue('0.75')).toBeDefined()
    })

    it('updates servings when changing ingredient amount', () => {
        render(<PortionScaler initialServings={4} ingredients={mockIngredients} />)

        const inputs = screen.getAllByRole('spinbutton')
        const harinaInput = inputs[0] // 1 cup

        // Change Harina to 2 cups (double)
        fireEvent.change(harinaInput, { target: { value: '2' } })

        // Should calculate: newServings = (2 * 4) / 1 = 8
        expect(screen.getByText('8')).toBeDefined()

        // Check other ingredient scales too: 200 * (8/4) = 400
        expect(screen.getByDisplayValue('400')).toBeDefined()
    })

    it('displays gram equivalent when applicable', () => {
        render(<PortionScaler initialServings={4} ingredients={mockIngredients} />)
        // Mock returns (~120g) for Harina=1
        expect(screen.getByText('(~120g)')).toBeDefined()
    })

    it('does not allow servings below 1 via decrement button', () => {
        render(<PortionScaler initialServings={1} ingredients={mockIngredients} />)

        const buttons = screen.getAllByRole('button')
        const minusButton = buttons[0]

        fireEvent.click(minusButton)

        // Servings should remain 1
        expect(screen.getByText('1')).toBeDefined()
        expect(screen.getByText('(~120g)')).toBeDefined()
    })

    it('handles extraction of non-numeric amounts', () => {
        render(<PortionScaler initialServings={4} ingredients={mockIngredients} />)
        const inputs = screen.getAllByRole('spinbutton')
        const harinaInput = inputs[0]

        fireEvent.change(harinaInput, { target: { value: 'abc' } })

        // Should remain 4
        expect(screen.getByText('4')).toBeDefined()
    })
})

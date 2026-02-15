import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { StarRating } from './StarRating'

afterEach(() => {
    cleanup()
})

describe('StarRating', () => {
    it('renders correct number of filled stars based on value', () => {
        // Render with value 3. Should have stars 1,2,3 filled.
        const { container } = render(<StarRating value={3} />)

        // Lucide stars are SVGs. We can check classes.
        // Filled stars have 'fill-amber-400'
        const filledStars = container.querySelectorAll('.fill-amber-400')
        expect(filledStars.length).toBe(3)
        // Total stars should be 5
        const allStars = container.querySelectorAll('svg')
        expect(allStars.length).toBe(5)
    })

    it('handles click events when not readOnly', () => {
        const handleChange = vi.fn()
        render(<StarRating value={0} onChange={handleChange} />)

        const buttons = screen.getAllByRole('button')
        // Click 4th star (index 3) -> value 4
        fireEvent.click(buttons[3])

        expect(handleChange).toHaveBeenCalledWith(4)
    })

    it('does not trigger change when readOnly', () => {
        const handleChange = vi.fn()
        render(<StarRating value={0} onChange={handleChange} readOnly />)

        const buttons = screen.getAllByRole('button')
        fireEvent.click(buttons[3])

        expect(handleChange).not.toHaveBeenCalled()
    })

    it('updates hover state on mouse enter', () => {
        const { container } = render(<StarRating value={1} />)

        const buttons = screen.getAllByRole('button')
        // Hover over 5th star
        fireEvent.mouseEnter(buttons[4])

        // Should show 5 filled stars visually (though value prop is still 1)
        const filledStars = container.querySelectorAll('.fill-amber-400')
        expect(filledStars.length).toBe(5)

        // Mouse leave
        fireEvent.mouseLeave(buttons[4])
        // Should revert to value 1
        const filledStarsAfter = container.querySelectorAll('.fill-amber-400')
        expect(filledStarsAfter.length).toBe(1)
    })
})

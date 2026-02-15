import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { RecipeCard } from './RecipeCard'
import { RecipeWithRelations } from '@/app/actions/recipes'

afterEach(() => {
    cleanup()
})

const mockRecipe: RecipeWithRelations = {
    id: '123',
    title: 'Test Recipe',
    description: 'Desc',
    ingredients: [],
    instructions: 'Instr',
    servings: 4,
    prepTime: 10,
    cookTime: 20,
    rating: 4,
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    imagePath: '/img.jpg',
    categories: [],
    notes: null
}

describe('RecipeCard', () => {
    it('renders recipe details correctly', () => {
        render(<RecipeCard recipe={mockRecipe} />)

        expect(screen.getByText('Test Recipe')).toBeDefined()
        expect(screen.getByText('30 min')).toBeDefined() // 10+20
        expect(screen.getByText('4 p.')).toBeDefined()

        // Link href
        const link = screen.getByRole('link')
        expect(link.getAttribute('href')).toBe('/recipes/123')
    })

    it('renders image correctly', () => {
        render(<RecipeCard recipe={mockRecipe} />)
        const img = screen.getByRole('img')
        expect(img.getAttribute('src')).toBe('/img.jpg')
    })

    it('handles list variant layout', () => {
        render(<RecipeCard recipe={mockRecipe} variant="list" />)
        // In list view, servings format is '4p' instead of '4 p.'
        expect(screen.getByText('4p')).toBeDefined()
    })

    it('handles missing image', () => {
        const recipeNoImg = { ...mockRecipe, imagePath: null }
        render(<RecipeCard recipe={recipeNoImg} />)
        // Should show fallback emoji 🍳
        expect(screen.getByText('🍳')).toBeDefined()
    })
})

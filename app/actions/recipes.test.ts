import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getRecipes, createRecipe } from './recipes'

// Mock Prisma
const mockFindMany = vi.fn()
const mockCount = vi.fn()
const mockCreate = vi.fn()
const mockTransaction = vi.fn()
const mockDelete = vi.fn()

vi.mock('@/lib/prisma', () => ({
    default: {
        recipe: {
            findMany: (...args: any[]) => mockFindMany(...args),
            count: (...args: any[]) => mockCount(...args),
            create: (...args: any[]) => mockCreate(...args),
            delete: (...args: any[]) => mockDelete(...args),
        },
        $transaction: (...args: any[]) => mockTransaction(...args)
    }
}))

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}))

beforeEach(() => {
    vi.clearAllMocks()
})

describe('recipes server actions', () => {
    describe('getRecipes', () => {
        it('fetches recipes with default pagination', async () => {
            // Mock transaction return: [recipes, count]
            mockTransaction.mockResolvedValue([[], 0])
            // Force standard pagination path by ensuring no in-memory processing needed
            await getRecipes({})

            expect(mockTransaction).toHaveBeenCalled()
            // Check first call args of transaction
            // findMany should be called with skip 0, take 50
            // Since we mocked via ...args passthrough, we need to inspect the calls to the *internal* mocks if transaction executes them, 
            // OR checks transaction args themselves.
            // But here getRecipes calls prisma.recipe.findMany() INSIDE the transaction array.
            // So our mockFindMany should be called?
            // Wait, prisma.$transaction([ p1, p2 ]) calls p1 and p2 (which are promises returned by findMany).
            // So getRecipes calls prisma.recipe.findMany(), gets a promise, passes to $transaction.

            expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({
                skip: 0,
                take: 50
            }))
        })

        it('applies query filter', async () => {
            mockTransaction.mockResolvedValue([[], 0])
            await getRecipes({ query: 'pasta' })

            expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    OR: expect.arrayContaining([
                        { title: { contains: 'pasta' } }
                    ])
                })
            }))
        })

        it('applies category filter', async () => {
            mockTransaction.mockResolvedValue([[], 0])
            await getRecipes({ category: 'Cena' })

            expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    categories: { some: { name: 'Cena' } }
                })
            }))
        })

        it('triggers in-memory sort for "fastest"', async () => {
            // "fastest" triggers findMany without pagination inside the if(needsInMemoryProcessing) block
            // and does NOT use transaction
            mockFindMany.mockResolvedValue([
                { id: '1', prepTime: 10, cookTime: 10 },
                { id: '2', prepTime: 5, cookTime: 5 }
            ])

            const result = await getRecipes({ sort: 'fastest' })

            expect(mockTransaction).not.toHaveBeenCalled()
            expect(mockFindMany).toHaveBeenCalled()

            // Check sort result
            expect(result.recipes[0].id).toBe('2') // 10 min
            expect(result.recipes[1].id).toBe('1') // 20 min
        })

        it('filters by time (short)', async () => {
            mockFindMany.mockResolvedValue([
                { id: '1', prepTime: 10, cookTime: 10 }, // 20m (short)
                { id: '2', prepTime: 30, cookTime: 10 }  // 40m (medium)
            ])

            const result = await getRecipes({ time: 'short' })

            expect(result.recipes).toHaveLength(1)
            expect(result.recipes[0].id).toBe('1')
        })

        it('filters by time (medium)', async () => {
            mockFindMany.mockResolvedValue([
                { id: '1', prepTime: 10, cookTime: 10 }, // 20m
                { id: '2', prepTime: 30, cookTime: 10 }  // 40m
            ])
            const result = await getRecipes({ time: 'medium' })
            expect(result.recipes).toHaveLength(1)
            expect(result.recipes[0].id).toBe('2')
        })
    })

    describe('createRecipe', () => {
        it('creates recipe with correct data structure', async () => {
            const input = {
                title: 'New Recipe',
                instructions: 'Do this',
                servings: 4,
                ingredients: [{ name: 'Flour', amount: 100, unit: 'g' }],
                categories: ['Baking']
            }

            mockCreate.mockResolvedValue({ id: '1', ...input })

            await createRecipe(input)

            expect(mockCreate).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    title: 'New Recipe',
                    ingredients: {
                        create: [{ name: 'Flour', amount: 100, unit: 'g' }]
                    },
                    categories: {
                        connectOrCreate: [{
                            where: { name: 'Baking' },
                            create: { name: 'Baking' }
                        }]
                    }
                })
            })
        })
    })

    describe('updateRecipe', () => {
        it('executes transaction with delete and update', async () => {
            // Mock transaction implementation: run the callback passed to it
            mockTransaction.mockImplementation(async (callback) => {
                // The callback expects a 'tx' object. We'll pass our mocked prisma object.
                // We need deep mocks for tx.ingredient.deleteMany and tx.recipe.update
                const tx = {
                    ingredient: { deleteMany: vi.fn() },
                    recipe: { update: vi.fn().mockResolvedValue({ id: '1' }) }
                }
                return await callback(tx)
            })

            const input = {
                title: 'Updated',
                instructions: 'Instr',
                servings: 2,
                ingredients: [],
                categories: []
            }

            await import('./recipes').then(mod => mod.updateRecipe('1', input))

            expect(mockTransaction).toHaveBeenCalled()
        })
    })

    describe('deleteRecipe', () => {
        it('deletes recipe by id', async () => {
            mockDelete.mockResolvedValue({ id: '1' })
            await import('./recipes').then(mod => mod.deleteRecipe('1'))
            expect(mockDelete).toHaveBeenCalledWith({ where: { id: '1' } })
        })
    })
})

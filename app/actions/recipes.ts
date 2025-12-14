'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export type RecipeWithRelations = Awaited<ReturnType<typeof getRecipes>>[number]

export async function getRecipes(options: {
    query?: string
    category?: string
    time?: string
    sort?: string
    rating?: string | number
} = {}) {
    const { query, category, time, sort, rating } = options

    const where: any = {}

    if (query) {
        where.OR = [
            { title: { contains: query } },
            { ingredients: { some: { name: { contains: query } } } },
            { categories: { some: { name: { contains: query } } } },
        ]
    }

    if (category) {
        where.categories = {
            some: {
                name: category
            }
        }
    }

    if (rating) {
        where.rating = {
            gte: Number(rating)
        }
    }

    // Fetch base results
    const recipes = await prisma.recipe.findMany({
        where,
        include: {
            ingredients: true,
            categories: true,
        },
        orderBy: {
            createdAt: 'desc', // Default sort for initial fetch
        },
    })

    // Filter by Time (Client-side logic on server)
    let filtered = recipes
    if (time) {
        filtered = recipes.filter(r => {
            const totalTime = (r.prepTime || 0) + (r.cookTime || 0)
            if (time === 'short') return totalTime < 30
            if (time === 'medium') return totalTime >= 30 && totalTime <= 60
            if (time === 'long') return totalTime > 60
            return true
        })
    }

    // Sort
    if (sort) {
        if (sort === 'oldest') {
            filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        } else if (sort === 'newest') {
            filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        } else if (sort === 'fastest') {
            filtered.sort((a, b) => {
                const timeA = (a.prepTime || 0) + (a.cookTime || 0)
                const timeB = (b.prepTime || 0) + (b.cookTime || 0)
                return timeA - timeB
            })
        }
    }

    return filtered
}

export async function getRecipe(id: string) {
    return await prisma.recipe.findUnique({
        where: { id },
        include: {
            ingredients: true,
            categories: true,
        },
    })
}

export async function getCategories() {
    return await prisma.category.findMany({
        orderBy: { name: 'asc' },
    })
}

export async function createRecipe(data: {
    title: string
    description?: string
    instructions: string
    servings: number
    prepTime?: number
    cookTime?: number
    rating?: number
    notes?: string
    imagePath?: string
    ingredients: { name: string; amount: number; unit: string }[]
    categories: string[]
}) {
    const recipe = await prisma.recipe.create({
        data: {
            title: data.title,
            description: data.description,
            instructions: data.instructions,
            servings: data.servings,
            prepTime: data.prepTime,
            cookTime: data.cookTime,
            rating: data.rating,
            notes: data.notes,
            imagePath: data.imagePath,
            ingredients: {
                create: data.ingredients,
            },
            categories: {
                connectOrCreate: data.categories.map((name) => ({
                    where: { name },
                    create: { name },
                })),
            },
        },
    })

    revalidatePath('/')
    return recipe
}

export async function updateRecipe(id: string, data: {
    title: string
    description?: string
    instructions: string
    servings: number
    prepTime?: number
    cookTime?: number
    rating?: number
    notes?: string
    imagePath?: string
    ingredients: { name: string; amount: number; unit: string }[]
    categories: string[]
}) {
    // Transaction: Update recipe details, replace ingredients, update categories
    const recipe = await prisma.$transaction(async (tx) => {
        // 1. Delete existing ingredients
        await tx.ingredient.deleteMany({ where: { recipeId: id } })

        // 2. Update recipe and relations
        return await tx.recipe.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                instructions: data.instructions,
                servings: data.servings,
                prepTime: data.prepTime,
                cookTime: data.cookTime,
                rating: data.rating,
                notes: data.notes,
                imagePath: data.imagePath,
                ingredients: {
                    create: data.ingredients,
                },
                categories: {
                    set: [], // Disconnect all
                    connectOrCreate: data.categories.map((name) => ({
                        where: { name },
                        create: { name },
                    })),
                },
            },
        })
    })

    revalidatePath('/')
    revalidatePath(`/recipes/${id}`)
    return recipe
}

export async function deleteRecipe(id: string) {
    await prisma.recipe.delete({ where: { id } })
    revalidatePath('/')
}

export async function deleteCategory(id: string) {
    await prisma.category.delete({ where: { id } })
    revalidatePath('/')
    revalidatePath('/recipes/new') // Affects category selector
    revalidatePath('/admin')
}

export async function createCategory(name: string) {
    await prisma.category.create({ data: { name } })
    revalidatePath('/')
    revalidatePath('/recipes/new')
    revalidatePath('/admin')
}

export async function updateCategory(id: string, name: string) {
    await prisma.category.update({
        where: { id },
        data: { name }
    })
    revalidatePath('/')
    revalidatePath('/recipes/new')
    revalidatePath('/admin')
}

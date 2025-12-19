'use client'

import { useState } from 'react'
import { Users, Minus, Plus } from 'lucide-react'
import { Ingredient } from '@prisma/client'

interface PortionScalerProps {
    initialServings: number
    ingredients: Ingredient[]
    className?: string
}

export function PortionScaler({ initialServings, ingredients, className }: PortionScalerProps) {
    const [servings, setServings] = useState(initialServings || 1) // Default to 1 if 0/undefined

    const scale = (amount: number) => {
        if (!amount) return 0
        const scaled = (amount / (initialServings || 1)) * servings
        // Format to avoiding long decimals: round to 2 decimals
        return Math.round(scaled * 100) / 100
    }

    const handleAmountChange = (baseAmount: number, newAmountStr: string) => {
        const newAmount = parseFloat(newAmountStr)
        if (isNaN(newAmount) || newAmount < 0) return

        // Calculate needed servings to get this amount
        // newAmount = (baseAmount / initialServings) * newServings
        // newServings = (newAmount * initialServings) / baseAmount
        const newServings = (newAmount * (initialServings || 1)) / baseAmount

        // Round to 2 decimals to avoid floating point weirdness but keep precision
        setServings(Math.round(newServings * 100) / 100)
    }

    return (
        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Ingred.</h3>

                <div className="flex items-center gap-3 bg-white dark:bg-black rounded-full border border-zinc-200 dark:border-zinc-800 px-3 py-1">
                    <Users size={16} className="text-zinc-500" />
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setServings(Math.max(1, Math.floor(servings) - 1))}
                            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                        >
                            <Minus size={14} />
                        </button>
                        <span className="font-medium min-w-[4ch] text-center">
                            {Number.isInteger(servings) ? servings : servings.toFixed(2)}
                        </span>
                        <button
                            onClick={() => setServings(Math.floor(servings) + 1)}
                            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                </div>
            </div>

            <ul className={`space-y-3 ${className}`}>
                {ingredients.map((ing) => (
                    <li key={ing.id} className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0 group">
                        <span className="font-medium text-zinc-700 dark:text-purple-400 flex-1 mr-4">
                            {ing.name}
                        </span>
                        <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold whitespace-nowrap">
                            {ing.amount > 0 ? (
                                <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    className="w-16 bg-transparent text-right border-b border-transparent hover:border-purple-200 focus:border-purple-500 focus:outline-none transition-colors appearance-none -moz-appearance-textfield [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                    value={scale(ing.amount)}
                                    onChange={(e) => handleAmountChange(ing.amount, e.target.value)}
                                    onClick={(e) => e.currentTarget.select()}
                                />
                            ) : null}
                            <span>{ing.unit}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}


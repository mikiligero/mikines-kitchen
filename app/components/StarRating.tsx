'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface StarRatingProps {
    value: number
    onChange?: (value: number) => void
    readOnly?: boolean
    size?: number
}

export function StarRating({ value, onChange, readOnly = false, size = 20 }: StarRatingProps) {
    const [hoverValue, setHoverValue] = useState<number | null>(null)

    const handleMouseEnter = (index: number) => {
        if (!readOnly) {
            setHoverValue(index)
        }
    }

    const handleMouseLeave = () => {
        if (!readOnly) {
            setHoverValue(null)
        }
    }

    const handleClick = (index: number) => {
        if (!readOnly && onChange) {
            onChange(index)
        }
    }

    const stars = [1, 2, 3, 4, 5]

    return (
        <div className="flex items-center gap-1">
            {stars.map((star) => {
                const filled = (hoverValue !== null ? hoverValue : value) >= star

                return (
                    <button
                        key={star}
                        type="button"
                        onClick={() => handleClick(star)}
                        onMouseEnter={() => handleMouseEnter(star)}
                        onMouseLeave={handleMouseLeave}
                        disabled={readOnly}
                        className={cn(
                            "transition-colors",
                            readOnly ? "cursor-default" : "cursor-pointer hover:scale-110 transition-transform"
                        )}
                    >
                        <Star
                            size={size}
                            className={cn(
                                "transition-colors",
                                filled ? "fill-amber-400 text-amber-400" : "fill-transparent text-zinc-300 dark:text-zinc-600"
                            )}
                        />
                    </button>
                )
            })}
        </div>
    )
}

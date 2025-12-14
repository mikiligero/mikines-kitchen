'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface FilterContextType {
    isOpen: boolean
    toggle: () => void
    close: () => void
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export function FilterProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)

    const toggle = () => setIsOpen(prev => !prev)
    const close = () => setIsOpen(false)

    return (
        <FilterContext.Provider value={{ isOpen, toggle, close }}>
            {children}
        </FilterContext.Provider>
    )
}

export function useFilter() {
    const context = useContext(FilterContext)
    if (context === undefined) {
        throw new Error('useFilter must be used within a FilterProvider')
    }
    return context
}

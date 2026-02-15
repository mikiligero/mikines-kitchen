import { describe, it, expect } from 'vitest'
import { getGramEquivalent } from './unitConversion'

describe('getGramEquivalent', () => {
    it('should return correct grams for standard cup inputs', () => {
        expect(getGramEquivalent('Harina de trigo', 1, 'cup')).toBe('(~120g)')
        expect(getGramEquivalent('Azúcar blanco', 1, 'taza')).toBe('(~200g)')
    })

    it('should return correct grams for ounce inputs', () => {
        expect(getGramEquivalent('Cualquier cosa', 1, 'oz')).toBe('(~28g)')
        expect(getGramEquivalent('Queso crema', 4, 'oz')).toBe('(~113g)')
        expect(getGramEquivalent('Algo', 10, 'onzas')).toBe('(~284g)')
    })

    it('should handle decimal amounts', () => {
        expect(getGramEquivalent('Harina', 0.5, 'cup')).toBe('(~60g)')
        expect(getGramEquivalent('Azúcar', 0.25, 'cup')).toBe('(~50g)')
    })

    it('should return null for non-cup units', () => {
        expect(getGramEquivalent('Harina', 1, 'gramos')).toBeNull()
        expect(getGramEquivalent('Leche', 200, 'ml')).toBeNull()
    })

    it('should return null for unknown ingredients', () => {
        expect(getGramEquivalent('Uranio enriquecido', 1, 'cup')).toBeNull()
    })

    it('should be case insensitive', () => {
        expect(getGramEquivalent('HARINA', 1, 'CUP')).toBe('(~120g)')
        expect(getGramEquivalent('harina', 1, 'Cup')).toBe('(~120g)')
    })

    it('should match partial ingredient names', () => {
        expect(getGramEquivalent('Harina integral', 1, 'cup')).toBe('(~120g)')
        expect(getGramEquivalent('Azúcar moreno', 1, 'cup')).toBe('(~200g)')
    })
})

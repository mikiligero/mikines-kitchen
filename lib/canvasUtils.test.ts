import { describe, it, expect } from 'vitest'
import { getRadianAngle, rotateSize } from './canvasUtils'

describe('canvasUtils', () => {
    describe('getRadianAngle', () => {
        it('should convert degrees to radians correctly', () => {
            expect(getRadianAngle(0)).toBe(0)
            expect(getRadianAngle(180)).toBe(Math.PI)
            expect(getRadianAngle(90)).toBe(Math.PI / 2)
            expect(getRadianAngle(360)).toBe(Math.PI * 2)
        })
    })

    describe('rotateSize', () => {
        it('should return same size for 0 rotation', () => {
            const width = 100
            const height = 200
            const result = rotateSize(width, height, 0)
            expect(result.width).toBeCloseTo(100)
            expect(result.height).toBeCloseTo(200)
        })

        it('should swap dimensions for 90 degree rotation', () => {
            const width = 100
            const height = 200
            const result = rotateSize(width, height, 90)
            // sin(90) = 1, cos(90) = 0
            // w = 0*100 + 1*200 = 200
            // h = 1*100 + 0*200 = 100
            expect(result.width).toBeCloseTo(200)
            expect(result.height).toBeCloseTo(100)
        })

        it('should handle 45 degree rotation', () => {
            const width = 100
            const height = 100
            const result = rotateSize(width, height, 45)
            // Diagonal of 100x100 square is sqrt(100^2 + 100^2) = 141.42...
            // Bounding box of 45 deg rotated square is its diagonal length
            expect(result.width).toBeCloseTo(141.42, 2)
            expect(result.height).toBeCloseTo(141.42, 2)
        })
    })
})

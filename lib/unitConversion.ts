export function getGramEquivalent(name: string, amount: number, unit: string): string | null {
    const normalize = (str: string) => str.toLowerCase().trim()
    const u = normalize(unit)
    const n = normalize(name)

    // Check if unit is cup-like
    // Includes standard abbreviations and Spanish/English terms
    const cupUnits = ['cup', 'cups', 'taza', 'tazas', 'c', 'tza', 'tz']
    if (!cupUnits.includes(u)) {
        return null
    }

    // Density map (grams per 1 cup)
    // Values are approximate averages
    const densities: Record<string, number> = {
        'harina': 120, // All-purpose flour
        'flour': 120,
        'azucar': 200, // Granulated sugar
        'azúcar': 200,
        'sugar': 200,
        'mantequilla': 227,
        'butter': 227,
        'leche': 240,
        'milk': 240,
        'agua': 240,
        'water': 240,
        'avena': 90, // Rolled oats
        'oats': 90,
        'arroz': 185, // White rice, uncooked
        'rice': 185,
        'aceite': 220, // Vegetable oil
        'oil': 220,
        'cacao': 90, // Cocoa powder
        'cocoa': 90,
        'miel': 340,
        'honey': 340,
        'glass sugar': 120,
        'azúcar glass': 120,
        'azucar glass': 120,
        'powdered sugar': 120
    }

    // Find matching density by checking if ingredient name contains the key
    let gramsPerCup = 0
    // Sort keys by length desc to match specific terms first (e.g. "azucar glass" before "azucar")
    const sortedKeys = Object.keys(densities).sort((a, b) => b.length - a.length)

    for (const key of sortedKeys) {
        if (n.includes(key)) {
            gramsPerCup = densities[key]
            break
        }
    }

    if (gramsPerCup === 0) return null

    const totalGrams = Math.round(amount * gramsPerCup)

    return `(~${totalGrams}g)`
}

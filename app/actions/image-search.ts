'use server'

export interface SearchResult {
    title: string
    thumbnail: string
    image: string
    source: string
}

export async function searchImages(query: string): Promise<SearchResult[]> {
    if (!query) return []

    try {
        // 1. Get VQD token (required by DDG to prevent scraping, but we emulate a browser)
        const res = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(query)}&t=h_&iax=images&ia=images`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Referer': 'https://duckduckgo.com/'
            }
        })
        const html = await res.text()

        // Extract vqd token - looks like vqd="3-1234567890..."
        // Regex handles vqd="VALUE" or vqd='VALUE'
        let vqd = null
        const vqdMatch = html.match(/vqd=['"]([^'"]+)['"]/)
        if (vqdMatch) vqd = vqdMatch[1]

        if (!vqd) {
            console.error("[ImageSearch] Could not extract VQD token")
            return []
        }

        // 2. Fetch Images using the token
        const apiUrl = `https://duckduckgo.com/i.js?q=${encodeURIComponent(query)}&vqd=${vqd}&o=json&p=1`
        const apiRes = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Referer': 'https://duckduckgo.com/',
                'x-requested-with': 'XMLHttpRequest',
                'authority': 'duckduckgo.com'
            }
        })

        if (!apiRes.ok) {
            console.error("[ImageSearch] DDG API failed", apiRes.status)
            return []
        }

        const data = await apiRes.json()

        // 3. Transform
        if (data && data.results) {
            return data.results.map((item: any) => ({
                title: item.title,
                thumbnail: item.thumbnail,
                image: item.image,
                source: item.url
            })).slice(0, 30)
        }

        return []

    } catch (e) {
        console.error("[ImageSearch] Search failed", e)
        return []
    }
}

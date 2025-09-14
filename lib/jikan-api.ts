// Jikan API service for fetching real-time anime data
const JIKAN_BASE_URL = 'https://api.jikan.moe/v4'

export interface JikanAnime {
  mal_id: number
  title: string
  title_english?: string
  title_japanese?: string
  type: string
  episodes?: number
  status: string
  aired: {
    from: string
    to?: string
  }
  score?: number
  scored_by?: number
  rank?: number
  popularity?: number
  synopsis?: string
  background?: string
  season?: string
  year?: number
  genres: Array<{ mal_id: number; name: string; type: string }>
  studios: Array<{ mal_id: number; name: string; type: string }>
  images: {
    jpg: {
      image_url: string
      small_image_url: string
      large_image_url: string
    }
  }
  trailer?: {
    youtube_id?: string
    url?: string
  }
  duration?: string
  rating?: string
}

export interface JikanResponse<T> {
  data: T
  pagination?: {
    last_visible_page: number
    has_next_page: boolean
    current_page: number
    items: {
      count: number
      total: number
      per_page: number
    }
  }
}

class JikanAPI {
  private async request<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${JIKAN_BASE_URL}${endpoint}`)
    
    if (!response.ok) {
      throw new Error(`Jikan API error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    return data
  }

  // Get anime by ID
  async getAnimeById(id: number): Promise<JikanAnime> {
    const response = await this.request<JikanResponse<JikanAnime>>(`/anime/${id}`)
    return response.data
  }

  // Search anime
  async searchAnime(query: string, page = 1, limit = 25): Promise<JikanResponse<JikanAnime[]>> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString()
    })
    return this.request<JikanResponse<JikanAnime[]>>(`/anime?${params}`)
  }

  // Get top anime
  async getTopAnime(type = 'tv', page = 1, limit = 25): Promise<JikanResponse<JikanAnime[]>> {
    const params = new URLSearchParams({
      type,
      page: page.toString(),
      limit: limit.toString()
    })
    return this.request<JikanResponse<JikanAnime[]>>(`/top/anime?${params}`)
  }

  // Get seasonal anime
  async getSeasonalAnime(year: number, season: string, page = 1): Promise<JikanResponse<JikanAnime[]>> {
    const params = new URLSearchParams({
      page: page.toString()
    })
    return this.request<JikanResponse<JikanAnime[]>>(`/seasons/${year}/${season}?${params}`)
  }

  // Get current season anime
  async getCurrentSeasonAnime(page = 1): Promise<JikanResponse<JikanAnime[]>> {
    const params = new URLSearchParams({
      page: page.toString()
    })
    return this.request<JikanResponse<JikanAnime[]>>(`/seasons/now?${params}`)
  }

  // Get anime recommendations
  async getAnimeRecommendations(id: number): Promise<JikanResponse<Array<{ entry: JikanAnime }>>> {
    return this.request<JikanResponse<Array<{ entry: JikanAnime }>>>(`/anime/${id}/recommendations`)
  }

  // Get anime by genre
  async getAnimeByGenre(genreId: number, page = 1): Promise<JikanResponse<JikanAnime[]>> {
    const params = new URLSearchParams({
      genres: genreId.toString(),
      page: page.toString()
    })
    return this.request<JikanResponse<JikanAnime[]>>(`/anime?${params}`)
  }

  // Get random anime
  async getRandomAnime(): Promise<JikanAnime> {
    const response = await this.request<JikanResponse<JikanAnime>>('/random/anime')
    return response.data
  }
}

export const jikanAPI = new JikanAPI()

// Helper function to convert Jikan anime to our database format
export function convertJikanToAnimeMetadata(jikanAnime: JikanAnime) {
  return {
    mal_id: jikanAnime.mal_id,
    title: jikanAnime.title,
    title_english: jikanAnime.title_english || null,
    title_japanese: jikanAnime.title_japanese || null,
    type: jikanAnime.type,
    episodes: jikanAnime.episodes || null,
    status: jikanAnime.status,
    aired_from: jikanAnime.aired.from ? new Date(jikanAnime.aired.from).toISOString() : null,
    aired_to: jikanAnime.aired.to ? new Date(jikanAnime.aired.to).toISOString() : null,
    score: jikanAnime.score || null,
    scored_by: jikanAnime.scored_by || null,
    rank: jikanAnime.rank || null,
    popularity: jikanAnime.popularity || null,
    synopsis: jikanAnime.synopsis || null,
    background: jikanAnime.background || null,
    season: jikanAnime.season || null,
    year: jikanAnime.year || null,
    image_url: jikanAnime.images.jpg.image_url,
    trailer_url: jikanAnime.trailer?.url || null,
    duration: jikanAnime.duration || null,
    rating: jikanAnime.rating || null,
    genres: jikanAnime.genres.map(g => g.name),
    studios: jikanAnime.studios.map(s => s.name),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

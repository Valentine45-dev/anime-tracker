import { supabase } from './supabase'
import type { Database } from './supabase'

type UserAnime = Database['public']['Tables']['user_anime']['Row']
type UserAnimeInsert = Database['public']['Tables']['user_anime']['Insert']
type UserAnimeUpdate = Database['public']['Tables']['user_anime']['Update']
type AnimeMetadata = Database['public']['Tables']['anime_metadata']['Row']

export interface AnimeListEntry extends UserAnime {
  anime_metadata: AnimeMetadata
}

export interface AnimeListStats {
  totalAnime: number
  completedAnime: number
  averageProgress: number
  statusCounts: Record<string, number>
  watchTimeHours: number
}

// Get user's anime list
export async function getUserAnimeList(
  userId: string,
  status?: string
): Promise<AnimeListEntry[]> {
  try {
    let query = supabase
      .from('user_anime')
      .select(`
        *,
        anime_metadata:anime_metadata_id (*)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data as AnimeListEntry[]
  } catch (error) {
    console.error('Error fetching user anime list:', error)
    throw error
  }
}

// Add anime to user's list
export async function addAnimeToList(
  userId: string,
  animeMetadataId: number,
  status: string = 'plan-to-watch',
  progress: number = 0,
  userRating?: number,
  notes?: string,
  startDate?: string,
  finishDate?: string,
  isFavorite: boolean = false
): Promise<AnimeListEntry> {
  try {
    // Check if anime already exists in user's list
    const { data: existingEntry } = await supabase
      .from('user_anime')
      .select('id')
      .eq('user_id', userId)
      .eq('anime_metadata_id', animeMetadataId)
      .single()

    if (existingEntry) {
      throw new Error('Anime already exists in your list')
    }

    // Add anime to list
    const { data, error } = await supabase
      .from('user_anime')
      .insert({
        user_id: userId,
        anime_metadata_id: animeMetadataId,
        status,
        progress,
        user_rating: userRating,
        notes,
        start_date: startDate,
        finish_date: finishDate,
        is_favorite: isFavorite,
      })
      .select(`
        *,
        anime_metadata:anime_metadata_id (*)
      `)
      .single()

    if (error) {
      throw error
    }

    return data as AnimeListEntry
  } catch (error) {
    console.error('Error adding anime to list:', error)
    throw error
  }
}

// Update anime in user's list
export async function updateAnimeInList(
  animeListId: number,
  userId: string,
  updates: {
    status?: string
    progress?: number
    userRating?: number
    notes?: string
    startDate?: string
    finishDate?: string
    isFavorite?: boolean
  }
): Promise<AnimeListEntry> {
  try {
    const { data, error } = await supabase
      .from('user_anime')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', animeListId)
      .eq('user_id', userId)
      .select(`
        *,
        anime_metadata:anime_metadata_id (*)
      `)
      .single()

    if (error) {
      throw error
    }

    return data as AnimeListEntry
  } catch (error) {
    console.error('Error updating anime in list:', error)
    throw error
  }
}

// Remove anime from user's list
export async function removeAnimeFromList(
  animeListId: number,
  userId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_anime')
      .delete()
      .eq('id', animeListId)
      .eq('user_id', userId)

    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Error removing anime from list:', error)
    throw error
  }
}

// Get anime list statistics
export async function getAnimeListStats(userId: string): Promise<AnimeListStats> {
  try {
    // Get status counts
    const { data: statusData, error: statusError } = await supabase
      .from('user_anime')
      .select('status')
      .eq('user_id', userId)

    if (statusError) {
      throw statusError
    }

    const statusCounts = statusData.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Get total anime count
    const totalAnime = statusData.length

    // Get completed anime count
    const completedAnime = statusCounts['completed'] || 0

    // Get average progress for watching anime
    const { data: watchingData, error: watchingError } = await supabase
      .from('user_anime')
      .select('progress')
      .eq('user_id', userId)
      .eq('status', 'watching')

    if (watchingError) {
      throw watchingError
    }

    const averageProgress = watchingData.length > 0
      ? Math.round(watchingData.reduce((acc, anime) => acc + anime.progress, 0) / watchingData.length)
      : 0

    // Get watch time (simplified calculation)
    const { data: watchTimeData, error: watchTimeError } = await supabase
      .from('user_anime')
      .select('progress, anime_metadata:anime_metadata_id(duration_minutes, episodes)')
      .eq('user_id', userId)
      .in('status', ['watching', 'completed'])

    if (watchTimeError) {
      throw watchTimeError
    }

    const watchTimeHours = watchTimeData.reduce((acc, item) => {
      const duration = item.anime_metadata?.duration_minutes || 24 // Default 24 minutes per episode
      const episodes = item.anime_metadata?.episodes || 12 // Default 12 episodes
      const totalMinutes = episodes * duration
      const watchedMinutes = (item.progress / 100) * totalMinutes
      return acc + (watchedMinutes / 60) // Convert to hours
    }, 0)

    return {
      totalAnime,
      completedAnime,
      averageProgress,
      statusCounts,
      watchTimeHours: Math.round(watchTimeHours),
    }
  } catch (error) {
    console.error('Error getting anime list stats:', error)
    throw error
  }
}

// Search anime metadata
export async function searchAnimeMetadata(query: string, limit: number = 20): Promise<AnimeMetadata[]> {
  try {
    const { data, error } = await supabase
      .from('anime_metadata')
      .select('*')
      .or(`title.ilike.%${query}%,title_english.ilike.%${query}%,title_japanese.ilike.%${query}%`)
      .limit(limit)

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Error searching anime metadata:', error)
    throw error
  }
}

// Get anime metadata by ID
export async function getAnimeMetadata(id: number): Promise<AnimeMetadata | null> {
  try {
    const { data, error } = await supabase
      .from('anime_metadata')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }

    return data
  } catch (error) {
    console.error('Error getting anime metadata:', error)
    throw error
  }
}

// Get anime metadata by MyAnimeList ID
export async function getAnimeMetadataByMalId(malId: number): Promise<AnimeMetadata | null> {
  try {
    const { data, error } = await supabase
      .from('anime_metadata')
      .select('*')
      .eq('mal_id', malId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }

    return data
  } catch (error) {
    console.error('Error getting anime metadata by MAL ID:', error)
    throw error
  }
}

// Insert anime metadata (for caching from AniList API)
export async function insertAnimeMetadata(animeData: Partial<AnimeMetadata>): Promise<AnimeMetadata> {
  try {
    const { data, error } = await supabase
      .from('anime_metadata')
      .insert(animeData)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Error inserting anime metadata:', error)
    throw error
  }
}

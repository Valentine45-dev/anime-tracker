// Simplified database service layer for current AniTrack project
import { supabase } from './supabase'
import { Database } from './supabase'

// Type definitions from current project
type AnimeMetadata = Database['public']['Tables']['anime_metadata']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type UserAnime = Database['public']['Tables']['user_anime']['Row']

export interface UserAnimeWithMetadata extends UserAnime {
  anime_metadata: AnimeMetadata
}

export interface AnimeListStats {
  totalAnime: number
  completedAnime: number
  averageProgress: number
  statusCounts: Record<string, number>
  watchTimeHours: number
}

// Profile Functions
export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }

    return data as Profile
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return null
    }

    return data as Profile
  }
}

// Anime Functions
export const animeService = {
  async getUserAnimeList(userId: string, status?: string) {
    let query = supabase
      .from('user_anime')
      .select(`
        *,
        anime_metadata (*)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query
    return { data: data as UserAnimeWithMetadata[] | null, error }
  },

  async addAnimeToList(userId: string, animeMetadataId: number, status: string = 'plan-to-watch') {
    const { data, error } = await supabase
      .from('user_anime')
      .insert({
        user_id: userId,
        anime_metadata_id: animeMetadataId,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    return { data, error }
  },

  async updateUserAnime(id: number, updates: Partial<UserAnime>) {
    const { data, error } = await supabase
      .from('user_anime')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  },

  async removeAnimeFromList(id: number) {
    const { error } = await supabase
      .from('user_anime')
      .delete()
      .eq('id', id)

    return { error }
  },

  async searchAnime(query: string, limit: number = 20) {
    try {
      // Search in database first
      const { data: dbData, error: dbError } = await supabase
        .from('anime_metadata')
        .select('*')
        .or(`title.ilike.%${query}%,title_english.ilike.%${query}%`)
        .limit(limit)

      return { data: dbData, error: dbError }
    } catch (error) {
      console.error('Error searching anime:', error)
      return { data: null, error }
    }
  },

  async getTrendingAnime(limit: number = 10) {
    try {
      // Get from database
      const { data: dbData, error: dbError } = await supabase
        .from('anime_metadata')
        .select('*')
        .order('score', { ascending: false })
        .limit(limit)

      return { data: dbData, error: dbError }
    } catch (error) {
      console.error('Error fetching trending anime:', error)
      return { data: null, error }
    }
  },

  async getUserAnimeStats(userId: string) {
    const { data: userAnime, error } = await supabase
      .from('user_anime')
      .select(`
        *,
        anime_metadata (*)
      `)
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching user anime stats:', error)
      return null
    }

    const stats = {
      watching: 0,
      completed: 0,
      planToWatch: 0,
      onHold: 0,
      dropped: 0,
      totalEpisodes: 0
    }

    userAnime?.forEach((anime: any) => {
      switch (anime.status) {
        case 'watching':
          stats.watching++
          break
        case 'completed':
          stats.completed++
          if (anime.anime_metadata?.episodes) {
            stats.totalEpisodes += anime.anime_metadata.episodes
          }
          break
        case 'plan-to-watch':
          stats.planToWatch++
          break
        case 'on-hold':
          stats.onHold++
          break
        case 'dropped':
          stats.dropped++
          break
      }
    })

    return stats
  },

  async getAnimeById(id: number) {
    const { data, error } = await supabase
      .from('anime_metadata')
      .select('*')
      .eq('id', id)
      .single()

    return { data, error }
  }
}

// Export types for convenience
export type { AnimeMetadata, Profile, UserAnime }

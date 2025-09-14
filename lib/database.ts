import { supabase } from './supabase'
import { Database } from './supabase'
import { jikanAPI, convertJikanToAnimeMetadata } from './jikan-api'

// Import types from database.types.ts to avoid duplicates
import type { 
  AnimeMetadata, 
  Profile, 
  UserAnime, 
  Community, 
  Post, 
  Notification, 
  UserPreferences, 
  UserActivity, 
  UserFollow, 
  UserReport, 
  ContentReport 
} from './database.types'

// Local Review type for review service functions
type Review = Database['public']['Tables']['reviews']['Row']

// supabase is already imported from './supabase'

// Type definitions for untyped Supabase operations
export type AnimeStatus = 'watching' | 'completed' | 'on-hold' | 'dropped' | 'plan-to-watch'

// Re-export types for convenience
export type { AnimeMetadata, Profile, UserAnime }

export interface UserAnimeWithMetadata {
  id: number
  user_id: string
  anime_metadata_id: number
  status: AnimeStatus
  user_rating: number | null
  progress: number
  start_date: string | null
  finish_date: string | null
  notes: string | null
  is_favorite: boolean
  created_at: string
  updated_at: string
  anime_metadata: AnimeMetadata & {
    duration?: number
    duration_minutes?: number
  }
}

// Community interface is now imported from database.types.ts

// Post interface is now imported from database.types.ts

export interface PostComment {
  id: number
  post_id: number
  user_id: string
  content: string
  parent_comment_id: number | null
  like_count: number
  created_at: string
  updated_at: string
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
  async getUserAnimeList(userId: string, status?: AnimeStatus) {
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

  async addAnimeToList(userId: string, animeMetadataId: number, status: AnimeStatus = 'plan-to-watch') {
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

      // Also search Jikan API for fresh results
      const jikanResponse = await jikanAPI.searchAnime(query, 1, limit)
      const combinedResults = [...(dbData || [])]

      for (const jikanAnime of jikanResponse.data) {
        // Check if this anime is already in our results
        const exists = combinedResults.find(anime => anime.mal_id === jikanAnime.mal_id)
        
        if (!exists) {
          // Check if it exists in DB
          const { data: existing } = await supabase
            .from('anime_metadata')
            .select('*')
            .eq('mal_id', jikanAnime.mal_id)
            .single()

          if (existing) {
            combinedResults.push(existing)
          } else {
            // Insert new anime and add to results
            const animeData = convertJikanToAnimeMetadata(jikanAnime)
            const { data: inserted } = await supabase
              .from('anime_metadata')
              .insert(animeData)
              .select()
              .single()

            if (inserted) {
              combinedResults.push(inserted)
            }
          }
        }
      }

      return { data: combinedResults.slice(0, limit), error: null }
    } catch (error) {
      console.error('Error searching anime:', error)
      return { data: null, error }
    }
  },

  async getTrendingAnime(limit: number = 10) {
    try {
      // First try to get from database
      const { data: dbData, error: dbError } = await supabase
        .from('anime_metadata')
        .select('*')
        .order('score', { ascending: false })
        .limit(limit)

      if (dbData && dbData.length > 0) {
        return { data: dbData, error: null }
      }

      // If no data in DB, fetch from Jikan API
      const jikanResponse = await jikanAPI.getTopAnime('tv', 1, limit)
      const animeList = []

      for (const jikanAnime of jikanResponse.data) {
        // Check if anime already exists in DB
        const { data: existing } = await supabase
          .from('anime_metadata')
          .select('id')
          .eq('mal_id', jikanAnime.mal_id)
          .single()

        if (!existing) {
          // Insert new anime into DB
          const animeData = convertJikanToAnimeMetadata(jikanAnime)
          const { data: inserted } = await supabase
            .from('anime_metadata')
            .insert(animeData)
            .select()
            .single()

          if (inserted) {
            animeList.push(inserted)
          }
        } else {
          // Get existing anime
          const { data: existingAnime } = await supabase
            .from('anime_metadata')
            .select('*')
            .eq('id', existing.id)
            .single()

          if (existingAnime) {
            animeList.push(existingAnime)
          }
        }
      }

      return { data: animeList, error: null }
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
  },

  async getSeasonalAnime(year?: number, season?: string) {
    try {
      const currentYear = year || new Date().getFullYear()
      const currentSeason = season || this.getCurrentSeason()
      
      const jikanResponse = await jikanAPI.getSeasonalAnime(currentYear, currentSeason)
      const animeList = []

      for (const jikanAnime of jikanResponse.data.slice(0, 20)) {
        const { data: existing } = await supabase
          .from('anime_metadata')
          .select('*')
          .eq('mal_id', jikanAnime.mal_id)
          .single()

        if (existing) {
          animeList.push(existing)
        } else {
          const animeData = convertJikanToAnimeMetadata(jikanAnime)
          const { data: inserted } = await supabase
            .from('anime_metadata')
            .insert(animeData)
            .select()
            .single()

          if (inserted) {
            animeList.push(inserted)
          }
        }
      }

      return { data: animeList, error: null }
    } catch (error) {
      console.error('Error fetching seasonal anime:', error)
      return { data: null, error }
    }
  },

  getCurrentSeason() {
    const month = new Date().getMonth() + 1
    if (month >= 3 && month <= 5) return 'spring'
    if (month >= 6 && month <= 8) return 'summer'
    if (month >= 9 && month <= 11) return 'fall'
    return 'winter'
  },

  async advancedSearchAnime(filters: any) {
    try {
      // Build search query based on filters
      let searchQuery = filters.query || ''
      
      // Use Jikan API search with basic query
      const { data: searchResults } = await jikanAPI.searchAnime(searchQuery)
      
      if (!searchResults) {
        return { data: [], error: null }
      }

      // Apply client-side filtering since Jikan API has limited filter support
      let filteredResults = searchResults

      // Filter by genres
      if (filters.genres && filters.genres.length > 0) {
        filteredResults = filteredResults.filter((anime: any) => 
          filters.genres.some((genre: string) => 
            anime.genres?.some((g: any) => g.name.toLowerCase().includes(genre.toLowerCase()))
          )
        )
      }

      // Filter by year
      if (filters.year) {
        filteredResults = filteredResults.filter((anime: any) => 
          anime.year === parseInt(filters.year)
        )
      }

      // Filter by season
      if (filters.season) {
        filteredResults = filteredResults.filter((anime: any) => 
          anime.season?.toLowerCase() === filters.season.toLowerCase()
        )
      }

      // Filter by status
      if (filters.status) {
        filteredResults = filteredResults.filter((anime: any) => 
          anime.status?.toLowerCase().includes(filters.status.toLowerCase())
        )
      }

      // Filter by type
      if (filters.type) {
        filteredResults = filteredResults.filter((anime: any) => 
          anime.type?.toLowerCase() === filters.type.toLowerCase()
        )
      }

      // Filter by rating range
      if (filters.minRating) {
        filteredResults = filteredResults.filter((anime: any) => 
          anime.score >= parseFloat(filters.minRating)
        )
      }
      if (filters.maxRating) {
        filteredResults = filteredResults.filter((anime: any) => 
          anime.score <= parseFloat(filters.maxRating)
        )
      }

      // Filter by episode count
      if (filters.minEpisodes) {
        filteredResults = filteredResults.filter((anime: any) => 
          anime.episodes >= parseInt(filters.minEpisodes)
        )
      }
      if (filters.maxEpisodes) {
        filteredResults = filteredResults.filter((anime: any) => 
          anime.episodes <= parseInt(filters.maxEpisodes)
        )
      }

      // Apply sorting
      if (filters.sortBy) {
        filteredResults.sort((a: any, b: any) => {
          switch (filters.sortBy) {
            case 'popularity':
              return (b.popularity || 0) - (a.popularity || 0)
            case 'rating':
              return (b.score || 0) - (a.score || 0)
            case 'release_date':
              return new Date(b.aired?.from || 0).getTime() - new Date(a.aired?.from || 0).getTime()
            case 'title':
              return a.title.localeCompare(b.title)
            case 'episodes':
              return (b.episodes || 0) - (a.episodes || 0)
            default:
              return 0
          }
        })
      }

      // Convert to our AnimeMetadata format
      const convertedResults = filteredResults.map((anime: any) => ({
        id: anime.mal_id,
        mal_id: anime.mal_id,
        anilist_id: null,
        title: anime.title,
        title_english: anime.title_english || null,
        title_japanese: anime.title_japanese || null,
        synopsis: anime.synopsis || null,
        episodes: anime.episodes || null,
        duration_minutes: anime.duration ? parseInt(anime.duration) : null,
        status: anime.status || null,
        aired_from: anime.aired?.from || null,
        aired_to: anime.aired?.to || null,
        season: anime.season || null,
        year: anime.year || null,
        rating: anime.rating || null,
        score: anime.score || null,
        genres: anime.genres?.map((g: any) => g.name) || [],
        studios: anime.studios?.map((s: any) => s.name) || [],
        image_url: anime.images?.jpg?.image_url || null,
        trailer_url: anime.trailer?.url || null,
        type: anime.type || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      return { data: convertedResults, error: null }
    } catch (error) {
      console.error('Error in advanced search:', error)
      return { data: [], error: error }
    }
  }
}

// Community Functions
export const communityService = {
  async getCommunities(limit: number = 20) {
    const { data, error } = await supabase
      .from('communities')
      .select(`
        *,
        profiles!communities_created_by_fkey(name, avatar_url)
      `)
      .eq('is_private', false)
      .order('member_count', { ascending: false })
      .limit(limit)

    return { data, error }
  },

  async getUserCommunities(userId: string) {
    const { data, error } = await supabase
      .from('community_members')
      .select(`
        *,
        communities(*)
      `)
      .eq('user_id', userId)
      .order('joined_at', { ascending: false })

    return { data, error }
  },

  async getCommunity(id: number) {
    const { data, error } = await supabase
      .from('communities')
      .select(`
        *,
        profiles!communities_created_by_fkey(name, avatar_url),
        community_members(
          *,
          profiles(name, avatar_url)
        )
      `)
      .eq('id', id)
      .single()

    return { data, error }
  },

  async createCommunity(userId: string, community: Omit<Community, 'id' | 'created_by' | 'created_at' | 'updated_at' | 'member_count' | 'post_count'>) {
    const { data, error } = await supabase
      .from('communities')
      .insert({
        ...community,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (!error && data) {
      // Add creator as admin member
      await supabase
        .from('community_members')
        .insert({
          community_id: data.id,
          user_id: userId,
          role: 'admin',
          joined_at: new Date().toISOString()
        })
    }

    return { data, error }
  },

  async joinCommunity(communityId: number, userId: string) {
    const { data, error } = await supabase
      .from('community_members')
      .insert({
        community_id: communityId,
        user_id: userId,
        role: 'member',
        joined_at: new Date().toISOString()
      })
      .select()
      .single()

    return { data, error }
  },

  async leaveCommunity(communityId: number, userId: string) {
    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', userId)

    return { error }
  },

  async isMember(communityId: number, userId: string) {
    const { data, error } = await supabase
      .from('community_members')
      .select('role')
      .eq('community_id', communityId)
      .eq('user_id', userId)
      .single()

    return { data, error }
  }
}

// Post Functions
export const postService = {
  async getCommunityPosts(communityId: number, limit: number = 20) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles(name, avatar_url),
        post_likes(user_id),
        post_comments(
          *,
          profiles(name, avatar_url)
        )
      `)
      .eq('community_id', communityId)
      .order('created_at', { ascending: false })
      .limit(limit)

    return { data, error }
  },

  async createPost(userId: string, post: Omit<Post, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'like_count' | 'comment_count' | 'is_pinned'>) {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        ...post,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    return { data, error }
  },

  async updatePost(id: number, updates: Partial<Post>) {
    const { data, error } = await supabase
      .from('posts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  },

  async deletePost(id: number) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)

    return { error }
  },

  async getRecentPosts(limit: number = 20) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        communities(name),
        profiles(name, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    return { data, error }
  },

  async likePost(postId: number, userId: string) {
    const { data, error } = await supabase
      .from('post_likes')
      .insert({
        post_id: postId,
        user_id: userId,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    return { data, error }
  },

  async unlikePost(postId: number, userId: string) {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)

    return { error }
  },

  async isPostLiked(postId: number, userId: string) {
    const { data, error } = await supabase
      .from('post_likes')
      .select()
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single()

    return { data: !!data, error }
  }
}

// Recommendation Functions
export const recommendationService = {
  async getPersonalizedRecommendations(userId: string, limit: number = 10) {
    // Get user's completed and watching anime to understand preferences
    const { data: userAnime } = await supabase
      .from('user_anime')
      .select(`
        *,
        anime_metadata(*)
      `)
      .eq('user_id', userId)
      .in('status', ['completed', 'watching'])
      .gte('rating', 7) // Only consider highly rated anime

    if (!userAnime || userAnime.length === 0) {
      // If no user data, return popular anime
      return await animeService.getTrendingAnime(limit)
    }

    // Extract genres from user's favorite anime
    const favoriteGenres = new Set<string>()
    userAnime.forEach((entry: any) => {
      if (entry.anime_metadata?.genres) {
        entry.anime_metadata.genres.forEach((genre: string) => {
          favoriteGenres.add(genre)
        })
      }
    })

    // For now, return trending anime as recommendations
    // TODO: Implement genre-based recommendations when genre mapping is available
    try {
      return await animeService.getTrendingAnime(limit)
    } catch (error) {
      console.error('Error getting recommendations:', error)
      return await animeService.getTrendingAnime(limit)
    }
  },

  async getSimilarAnime(animeId: number, limit: number = 5) {
    try {
      const { data } = await jikanAPI.getAnimeRecommendations(animeId)
      if (data) {
        return { data: data.slice(0, limit), error: null }
      }
      return { data: [], error: null }
    } catch (error) {
      console.error('Error getting similar anime:', error)
      return { data: [], error: error }
    }
  },

  async searchAnime(query: string, limit: number = 20) {
    try {
      const { data } = await jikanAPI.searchAnime(query, 1, limit)
      if (data) {
        const animeMetadata = data.map(convertJikanToAnimeMetadata)
        return { data: animeMetadata, error: null }
      }
      return { data: [], error: null }
    } catch (error) {
      console.error('Error searching anime:', error)
      return { data: [], error: error }
    }
  },

  async advancedSearchAnime(filters: any) {
    try {
      // For now, use basic search with the query and apply client-side filtering
      // In a real implementation, you'd want to use Jikan's advanced search parameters
      const query = filters.query || ''
      const { data } = await jikanAPI.searchAnime(query, 1, 50)
      
      if (data) {
        let filteredData = data.map(convertJikanToAnimeMetadata)
        
        // Apply client-side filters
        if (filters.genres && filters.genres.length > 0) {
          filteredData = filteredData.filter(anime => 
            filters.genres.some((genre: string) => 
              anime.genres?.some((g: string) => g.toLowerCase().includes(genre.toLowerCase()))
            )
          )
        }
        
        if (filters.year) {
          filteredData = filteredData.filter(anime => 
            anime.year === filters.year
          )
        }
        
        if (filters.status) {
          filteredData = filteredData.filter(anime => {
            const status = anime.status?.toLowerCase()
            return status?.includes(filters.status.toLowerCase())
          })
        }
        
        if (filters.type) {
          filteredData = filteredData.filter(anime => 
            anime.type?.toLowerCase() === filters.type.toLowerCase()
          )
        }
        
        if (filters.rating && (filters.rating[0] > 0 || filters.rating[1] < 10)) {
          filteredData = filteredData.filter(anime => {
            const score = anime.score || 0
            return score >= filters.rating[0] && score <= filters.rating[1]
          })
        }
        
        if (filters.episodes && (filters.episodes[0] > 1 || filters.episodes[1] < 50)) {
          filteredData = filteredData.filter(anime => {
            const episodes = anime.episodes || 0
            return episodes >= filters.episodes[0] && (filters.episodes[1] >= 50 || episodes <= filters.episodes[1])
          })
        }
        
        // Apply sorting
        if (filters.sortBy) {
          filteredData.sort((a, b) => {
            let aVal: any, bVal: any
            
            switch (filters.sortBy) {
              case 'rating':
                aVal = a.score || 0
                bVal = b.score || 0
                break
              case 'popularity':
                aVal = a.popularity || 999999
                bVal = b.popularity || 999999
                break
              case 'title':
                aVal = a.title.toLowerCase()
                bVal = b.title.toLowerCase()
                break
              case 'episodes':
                aVal = a.episodes || 0
                bVal = b.episodes || 0
                break
              case 'start_date':
                aVal = new Date(a.aired_from || '1900-01-01')
                bVal = new Date(b.aired_from || '1900-01-01')
                break
              default:
                return 0
            }
            
            if (filters.sortOrder === 'asc') {
              return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
            } else {
              return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
            }
          })
        }
        
        return { data: filteredData, error: null }
      }
      return { data: [], error: null }
    } catch (error) {
      console.error('Error in advanced search:', error)
      return { data: [], error: error }
    }
  },

  async getRecommendationsForGenre(genreId: number, limit: number = 10) {
    try {
      const { data } = await jikanAPI.getAnimeByGenre(genreId, limit)
      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error getting genre recommendations:', error)
      return { data: [], error: error }
    }
  }
}

// Notification interface is now imported from database.types.ts

// Review interface is now imported from database.types.ts

// Activity Types
export interface ActivityItem {
  id: string
  user_id: string
  type: string
  metadata: Record<string, any>
  created_at: string
  profiles?: {
    name: string | null
    avatar_url: string | null
  }
}

// Notification Functions
export const notificationService = {
  async getUserNotifications(userId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  async createNotification(notification: Omit<Notification, 'id'>) {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
    return { data, error }
  },

  async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
    return { error }
  },

  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
    return { error }
  },

  async deleteNotification(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
    return { error }
  },

  async getUnreadCount(userId: string) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)
    return { count: count || 0, error }
  }
}

// Review Functions
export const reviewService = {
  async getAnimeReviews(animeId: number, limit: number = 20) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles(name, avatar_url)
      `)
      .eq('anime_id', animeId)
      .order('created_at', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  async createReview(review: Omit<Review, 'id'>) {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
    return { data, error }
  },

  async updateReview(reviewId: string, updates: { rating?: number; review_text?: string }) {
    const { data, error } = await supabase
      .from('reviews')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', reviewId)
    return { data, error }
  },

  async deleteReview(reviewId: string) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
    return { error }
  },

  async getAnimeRatingStats(animeId: number) {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('anime_id', animeId)
    
    if (error || !data) {
      return { data: { average_rating: 0, total_reviews: 0 }, error }
    }

    const totalReviews = data.length
    const averageRating = totalReviews > 0 
      ? data.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0

    return { 
      data: { average_rating: averageRating, total_reviews: totalReviews }, 
      error: null 
    }
  },

  async likeReview(reviewId: string, userId: string) {
    const { data, error } = await supabase
      .from('review_likes')
      .insert({ review_id: reviewId, user_id: userId })
    return { data, error }
  },

  async unlikeReview(reviewId: string, userId: string) {
    const { error } = await supabase
      .from('review_likes')
      .delete()
      .eq('review_id', reviewId)
      .eq('user_id', userId)
    return { error }
  }
}

// Activity Functions
export const activityService = {
  async getUserActivities(userId: string, limit: number = 20) {
    const { data, error } = await supabase
      .from('user_activities')
      .select(`
        *,
        profiles(name, avatar_url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  async getGlobalActivities(limit: number = 20) {
    const { data, error } = await supabase
      .from('user_activities')
      .select(`
        *,
        profiles(name, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  async getFollowingActivities(userId: string, limit: number = 20) {
    // First get the list of users that the current user follows
    const { data: followingData, error: followingError } = await supabase
      .from('user_follows')
      .select('followed_user_id')
      .eq('follower_user_id', userId)

    if (followingError || !followingData || followingData.length === 0) {
      return { data: [], error: followingError }
    }

    // Extract the followed user IDs
    const followedUserIds = followingData.map(f => f.followed_user_id)

    // Get activities from followed users
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('user_anime')
      .select(`
        *,
        anime_metadata(*),
        profiles(username, avatar_url)
      `)
      .in('user_id', followedUserIds)
      .order('updated_at', { ascending: false })
      .limit(limit)

    return { data: activitiesData, error: activitiesError }
  },

  async createActivity(activity: Omit<ActivityItem, 'id' | 'profiles'>) {
    const { data, error } = await supabase
      .from('user_activities')
      .insert(activity)
    return { data, error }
  },

  async deleteActivity(activityId: string) {
    const { data, error } = await supabase
      .from('user_activities')
      .delete()
      .eq('id', activityId)
    return { data, error }
  }
}

// Admin Service
export const adminService = {
  async getSystemStats() {
    try {
      const [usersResult, clubsResult, reportsResult, animeResult] = await Promise.all([
        supabase.from('profiles').select('id, created_at').eq('role', 'user'),
        supabase.from('clubs').select('id, created_at'),
        supabase.from('user_reports').select('id, status'),
        supabase.from('anime_metadata').select('id')
      ])

      const totalUsers = usersResult.data?.length || 0
      const activeUsers = usersResult.data?.filter(u => 
        new Date(u.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length || 0
      
      const totalClubs = clubsResult.data?.length || 0
      const pendingReports = reportsResult.data?.filter(r => r.status === 'pending').length || 0
      const bannedUsers = usersResult.data?.filter((u: any) => u.status === 'banned').length || 0
      const totalAnime = animeResult.data?.length || 0

      return {
        data: {
          totalUsers,
          activeUsers,
          totalClubs,
          pendingReports,
          bannedUsers,
          totalAnime,
          recentActivity: Math.floor(Math.random() * 100) + 50
        },
        error: null
      }
    } catch (error) {
      return { data: null, error }
    }
  },

  async getUserReports() {
    const { data, error } = await supabase
      .from('user_reports')
      .select(`
        *,
        reported_user:profiles!user_reports_reported_user_id_fkey(username, email),
        reporter:profiles!user_reports_reported_by_id_fkey(username)
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    return { data, error }
  },

  async getContentReports() {
    const { data, error } = await supabase
      .from('content_reports')
      .select(`
        *,
        reporter:profiles!content_reports_reported_by_id_fkey(username)
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    return { data, error }
  },

  async getAllUsers(limit: number = 50) {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_anime(count),
        club_memberships(count)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    return { data, error }
  },

  async getAllClubs(limit: number = 50) {
    const { data, error } = await supabase
      .from('clubs')
      .select(`
        *,
        creator:profiles!clubs_creator_id_fkey(username),
        club_memberships(count),
        club_posts(count)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    return { data, error }
  },

  async banUser(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ status: 'banned' })
      .eq('id', userId)

    return { data, error }
  },

  async suspendUser(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ status: 'suspended' })
      .eq('id', userId)

    return { data, error }
  },

  async resolveUserReport(reportId: string) {
    const { data, error } = await supabase
      .from('user_reports')
      .update({ status: 'resolved' })
      .eq('id', reportId)

    return { data, error }
  },

  async approveContent(reportId: string) {
    const { data, error } = await supabase
      .from('content_reports')
      .update({ status: 'resolved' })
      .eq('id', reportId)

    return { data, error }
  },

  async removeContent(reportId: string) {
    // First get the content details
    const { data: report } = await supabase
      .from('content_reports')
      .select('content_id, content_type')
      .eq('id', reportId)
      .single()

    if (report) {
      // Remove the actual content based on type
      let deleteResult
      switch (report.content_type) {
        case 'post':
          deleteResult = await supabase
            .from('club_posts')
            .delete()
            .eq('id', report.content_id)
          break
        case 'comment':
          deleteResult = await supabase
            .from('post_comments')
            .delete()
            .eq('id', report.content_id)
          break
        default:
          return { data: null, error: 'Unknown content type' }
      }

      // Mark report as resolved
      await supabase
        .from('content_reports')
        .update({ status: 'resolved' })
        .eq('id', reportId)

      return deleteResult
    }

    return { data: null, error: 'Report not found' }
  },

  async resolveContentReport(reportId: string) {
    const { data, error } = await supabase
      .from('content_reports')
      .update({ status: 'resolved' })
      .eq('id', reportId)

    return { data, error }
  }
}

// Social Functions (Follow/Unfollow)
export const socialService = {
  async followUser(followerUserId: string, followedUserId: string) {
    const { data, error } = await supabase
      .from('user_follows')
      .insert({
        follower_user_id: followerUserId,
        followed_user_id: followedUserId,
        created_at: new Date().toISOString()
      })
    return { data, error }
  },

  async unfollowUser(followerUserId: string, followedUserId: string) {
    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_user_id', followerUserId)
      .eq('followed_user_id', followedUserId)
    return { error }
  },

  async getUserFollowers(userId: string, limit: number = 20) {
    const { data, error } = await supabase
      .from('user_follows')
      .select(`
        *,
        profiles!user_follows_follower_user_id_fkey(name, avatar_url)
      `)
      .eq('followed_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  async getUserFollowing(userId: string, limit: number = 20) {
    const { data, error } = await supabase
      .from('user_follows')
      .select(`
        *,
        profiles!user_follows_followed_user_id_fkey(name, avatar_url)
      `)
      .eq('follower_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  async isFollowing(followerUserId: string, followedUserId: string) {
    const { data, error } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_user_id', followerUserId)
      .eq('followed_user_id', followedUserId)
      .single()
    return { isFollowing: !!data, error }
  },

  async getFollowStats(userId: string) {
    const [followersResult, followingResult] = await Promise.all([
      supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('followed_user_id', userId),
      supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_user_id', userId)
    ])

    return {
      followers: followersResult.count || 0,
      following: followingResult.count || 0,
      error: followersResult.error || followingResult.error
    }
  }
}

// Comment Functions
export const commentService = {
  async getPostComments(postId: number) {
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        profiles(name, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    return { data, error }
  },

  async createComment(userId: string, comment: Omit<PostComment, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'like_count'>) {
    const { data, error } = await supabase
      .from('post_comments')
      .insert({
        ...comment,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    return { data, error }
  },

  async updateComment(id: number, content: string) {
    const { data, error } = await supabase
      .from('post_comments')
      .update({ 
        content, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  },

  async deleteComment(id: number) {
    const { error } = await supabase
      .from('post_comments')
      .delete()
      .eq('id', id)

    return { error }
  }
}


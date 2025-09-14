import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  },
  global: {
    headers: {
      'X-Client-Info': 'anitrack-app'
    }
  }
})

// Server-side client with service role key for admin operations
// This should only be used in API routes or server components
export const supabaseAdmin = typeof window === 'undefined' && process.env.SUPABASE_SERVICE_ROLE_KEY ? createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
) : null

// Helper function to get admin client (throws error if not available)
export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (typeof window !== 'undefined') {
    throw new Error('supabaseAdmin can only be used on the server-side')
  }
  if (!supabaseAdmin) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations')
  }
  return supabaseAdmin
}

// Database types for complete AniTracker schema
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          bio: string | null
          watch_time_hours: number
          favorite_genres: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          bio?: string | null
          watch_time_hours?: number
          favorite_genres?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          bio?: string | null
          watch_time_hours?: number
          favorite_genres?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      anime_metadata: {
        Row: {
          id: number
          mal_id: number | null
          anilist_id: number | null
          title: string
          title_english: string | null
          title_japanese: string | null
          synopsis: string | null
          episodes: number | null
          duration_minutes: number | null
          status: string | null
          aired_from: string | null
          aired_to: string | null
          season: string | null
          year: number | null
          rating: string | null
          score: number | null
          genres: string[] | null
          studios: string[] | null
          image_url: string | null
          trailer_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          mal_id?: number | null
          anilist_id?: number | null
          title: string
          title_english?: string | null
          title_japanese?: string | null
          synopsis?: string | null
          episodes?: number | null
          duration_minutes?: number | null
          status?: string | null
          aired_from?: string | null
          aired_to?: string | null
          season?: string | null
          year?: number | null
          rating?: string | null
          score?: number | null
          genres?: string[] | null
          studios?: string[] | null
          image_url?: string | null
          trailer_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          mal_id?: number | null
          anilist_id?: number | null
          title?: string
          title_english?: string | null
          title_japanese?: string | null
          synopsis?: string | null
          episodes?: number | null
          duration_minutes?: number | null
          status?: string | null
          aired_from?: string | null
          aired_to?: string | null
          season?: string | null
          year?: number | null
          rating?: string | null
          score?: number | null
          genres?: string[] | null
          studios?: string[] | null
          image_url?: string | null
          trailer_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_anime: {
        Row: {
          id: number
          user_id: string
          anime_metadata_id: number
          status: string
          progress: number
          user_rating: number | null
          notes: string | null
          start_date: string | null
          finish_date: string | null
          rewatched_count: number
          is_favorite: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          anime_metadata_id: number
          status?: string
          progress?: number
          user_rating?: number | null
          notes?: string | null
          start_date?: string | null
          finish_date?: string | null
          rewatched_count?: number
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          anime_metadata_id?: number
          status?: string
          progress?: number
          user_rating?: number | null
          notes?: string | null
          start_date?: string | null
          finish_date?: string | null
          rewatched_count?: number
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      communities: {
        Row: {
          id: number
          name: string
          description: string | null
          category: string | null
          image_url: string | null
          member_count: number
          post_count: number
          is_private: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          category?: string | null
          image_url?: string | null
          member_count?: number
          post_count?: number
          is_private?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          category?: string | null
          image_url?: string | null
          member_count?: number
          post_count?: number
          is_private?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      community_members: {
        Row: {
          id: number
          community_id: number
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: number
          community_id: number
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          id?: number
          community_id?: number
          user_id?: string
          role?: string
          joined_at?: string
        }
      }
      posts: {
        Row: {
          id: number
          community_id: number
          user_id: string
          title: string
          content: string | null
          post_type: string
          like_count: number
          comment_count: number
          is_pinned: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          community_id: number
          user_id: string
          title: string
          content?: string | null
          post_type?: string
          like_count?: number
          comment_count?: number
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          community_id?: number
          user_id?: string
          title?: string
          content?: string | null
          post_type?: string
          like_count?: number
          comment_count?: number
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      post_likes: {
        Row: {
          id: number
          post_id: number
          user_id: string
          created_at: string
        }
        Insert: {
          id?: number
          post_id: number
          user_id: string
          created_at?: string
        }
        Update: {
          id?: number
          post_id?: number
          user_id?: string
          created_at?: string
        }
      }
      post_comments: {
        Row: {
          id: number
          post_id: number
          user_id: string
          parent_comment_id: number | null
          content: string
          like_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          post_id: number
          user_id: string
          parent_comment_id?: number | null
          content: string
          like_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          post_id?: number
          user_id?: string
          parent_comment_id?: number | null
          content?: string
          like_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string | null
          data: any | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message?: string | null
          data?: any | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string | null
          data?: any | null
          is_read?: boolean
          created_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: number
          user_id: string
          theme: string
          language: string
          email_notifications: boolean
          push_notifications: boolean
          privacy_level: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          theme?: string
          language?: string
          email_notifications?: boolean
          push_notifications?: boolean
          privacy_level?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          theme?: string
          language?: string
          email_notifications?: boolean
          push_notifications?: boolean
          privacy_level?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_reports: {
        Row: {
          id: number
          reported_user_id: string
          reporter_user_id: string
          reason: string
          description: string | null
          status: string
          severity: string
          created_at: string
          resolved_at: string | null
          resolved_by: string | null
        }
        Insert: {
          id?: number
          reported_user_id: string
          reporter_user_id: string
          reason: string
          description?: string | null
          status?: string
          severity?: string
          created_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Update: {
          id?: number
          reported_user_id?: string
          reporter_user_id?: string
          reason?: string
          description?: string | null
          status?: string
          severity?: string
          created_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
        }
      }
      content_reports: {
        Row: {
          id: number
          content_type: string
          content_id: number
          reporter_user_id: string
          reason: string
          description: string | null
          status: string
          created_at: string
          resolved_at: string | null
          resolved_by: string | null
        }
        Insert: {
          id?: number
          content_type: string
          content_id: number
          reporter_user_id: string
          reason: string
          description?: string | null
          status?: string
          created_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Update: {
          id?: number
          content_type?: string
          content_id?: number
          reporter_user_id?: string
          reason?: string
          description?: string | null
          status?: string
          created_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
        }
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          anime_id: number
          rating: number
          review_text: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          anime_id: number
          rating: number
          review_text?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          anime_id?: number
          rating?: number
          review_text?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      review_likes: {
        Row: {
          id: string
          review_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          review_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          user_id?: string
          created_at?: string
        }
      }
      user_activities: {
        Row: {
          id: string
          user_id: string
          type: string
          metadata: any | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          metadata?: any | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          metadata?: any | null
          created_at?: string
        }
      }
      user_follows: {
        Row: {
          id: string
          follower_user_id: string
          followed_user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_user_id: string
          followed_user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_user_id?: string
          followed_user_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

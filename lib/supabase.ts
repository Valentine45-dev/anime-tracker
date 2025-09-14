import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role key for admin operations
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Database types (will be generated from Supabase)
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

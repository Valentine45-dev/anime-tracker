// Import the Database type from the current project's supabase.ts
import { Database } from './supabase'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Re-export the Database interface for convenience
export type { Database }

// Export commonly used types for convenience
export type Profile = Database['public']['Tables']['profiles']['Row']
export type AnimeMetadata = Database['public']['Tables']['anime_metadata']['Row']
export type UserAnime = Database['public']['Tables']['user_anime']['Row']
export type Community = Database['public']['Tables']['communities']['Row']
export type CommunityMember = Database['public']['Tables']['community_members']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type PostLike = Database['public']['Tables']['post_likes']['Row']
export type PostComment = Database['public']['Tables']['post_comments']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type UserPreferences = Database['public']['Tables']['user_preferences']['Row']
export type UserActivity = Database['public']['Tables']['user_activities']['Row']
export type UserFollow = Database['public']['Tables']['user_follows']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type ReviewLike = Database['public']['Tables']['review_likes']['Row']
export type UserReport = Database['public']['Tables']['user_reports']['Row']
export type ContentReport = Database['public']['Tables']['content_reports']['Row']

// Extended types with relations
export type UserAnimeWithMetadata = UserAnime & {
  anime_metadata: AnimeMetadata
}

export type PostWithAuthor = Post & {
  profiles: Profile
}

export type CommunityWithMembers = Community & {
  community_members: CommunityMember[]
  profiles: Profile
}

export type PostWithDetails = Post & {
  profiles: Profile
  communities: Community
  post_likes: { user_id: string }[]
  post_comments: (PostComment & { profiles: Profile })[]
}

// Anime status type
export type AnimeStatus = 'watching' | 'completed' | 'on-hold' | 'dropped' | 'plan-to-watch'

// Community role type
export type CommunityRole = 'admin' | 'moderator' | 'member'

// Post type
export type PostType = 'discussion' | 'recommendation' | 'review' | 'news'

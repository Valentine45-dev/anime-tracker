#!/usr/bin/env node

/**
 * Migration script to transfer data from SQLite/Prisma to Supabase
 * Run this after setting up your Supabase database with the provided schema
 */

const { PrismaClient } = require('@prisma/client')
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const prisma = new PrismaClient()
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function migrateUsers() {
  console.log('🔄 Migrating users...')
  
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        joinDate: true,
      }
    })

    for (const user of users) {
      // Check if user already exists in Supabase
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', user.email)
        .single()

      if (!existingUser) {
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: user.id, // Use the same ID from Prisma
            email: user.email,
            name: user.name,
            avatar_url: user.avatar,
            bio: user.bio,
            watch_time_hours: 0,
            favorite_genres: null,
            created_at: user.joinDate.toISOString(),
            updated_at: new Date().toISOString(),
          })

        if (error) {
          console.error(`Error migrating user ${user.email}:`, error)
        } else {
          console.log(`✅ Migrated user: ${user.email}`)
        }
      } else {
        console.log(`⏭️  User already exists: ${user.email}`)
      }
    }

    console.log(`✅ Migrated ${users.length} users`)
  } catch (error) {
    console.error('Error migrating users:', error)
  }
}

async function migrateAnimeMetadata() {
  console.log('🔄 Migrating anime metadata...')
  
  try {
    const anime = await prisma.anime.findMany()

    for (const animeItem of anime) {
      // Check if anime already exists
      const { data: existingAnime } = await supabase
        .from('anime_metadata')
        .select('id')
        .eq('id', animeItem.id)
        .single()

      if (!existingAnime) {
        // Parse JSON fields
        let genres = []
        let tags = []
        let studios = []

        try {
          genres = JSON.parse(animeItem.genres || '[]')
          tags = JSON.parse(animeItem.tags || '[]')
          studios = JSON.parse(animeItem.studios || '[]')
        } catch (e) {
          console.warn(`Warning: Could not parse JSON for anime ${animeItem.id}`)
        }

        const { error } = await supabase
          .from('anime_metadata')
          .insert({
            id: animeItem.id,
            anilist_id: animeItem.id, // Assuming the ID is from AniList
            title: animeItem.title,
            title_english: animeItem.titleEnglish,
            title_japanese: animeItem.titleEnglish, // Fallback
            synopsis: animeItem.description,
            episodes: animeItem.episodes,
            duration_minutes: animeItem.duration,
            status: animeItem.status,
            aired_from: animeItem.startDate?.toISOString().split('T')[0],
            aired_to: animeItem.endDate?.toISOString().split('T')[0],
            season: animeItem.season,
            year: animeItem.seasonYear,
            rating: null, // Not available in current schema
            score: animeItem.averageScore,
            genres: genres,
            studios: studios,
            image_url: animeItem.coverImage,
            trailer_url: null, // Not available in current schema
            created_at: animeItem.createdAt.toISOString(),
            updated_at: animeItem.updatedAt.toISOString(),
          })

        if (error) {
          console.error(`Error migrating anime ${animeItem.title}:`, error)
        } else {
          console.log(`✅ Migrated anime: ${animeItem.title}`)
        }
      } else {
        console.log(`⏭️  Anime already exists: ${animeItem.title}`)
      }
    }

    console.log(`✅ Migrated ${anime.length} anime`)
  } catch (error) {
    console.error('Error migrating anime metadata:', error)
  }
}

async function migrateAnimeLists() {
  console.log('🔄 Migrating anime lists...')
  
  try {
    const animeLists = await prisma.animeList.findMany({
      include: {
        user: true,
        anime: true,
      }
    })

    for (const animeList of animeLists) {
      // Check if anime list entry already exists
      const { data: existingEntry } = await supabase
        .from('user_anime')
        .select('id')
        .eq('user_id', animeList.userId)
        .eq('anime_metadata_id', animeList.animeId)
        .single()

      if (!existingEntry) {
        const { error } = await supabase
          .from('user_anime')
          .insert({
            user_id: animeList.userId,
            anime_metadata_id: animeList.animeId,
            status: animeList.status,
            progress: animeList.progress,
            user_rating: animeList.rating,
            notes: animeList.notes,
            start_date: animeList.startDate?.toISOString().split('T')[0],
            finish_date: animeList.completedDate?.toISOString().split('T')[0],
            rewatched_count: 0,
            is_favorite: false,
            created_at: animeList.createdAt.toISOString(),
            updated_at: animeList.updatedAt.toISOString(),
          })

        if (error) {
          console.error(`Error migrating anime list entry for user ${animeList.user.email}:`, error)
        } else {
          console.log(`✅ Migrated anime list entry: ${animeList.anime.title}`)
        }
      } else {
        console.log(`⏭️  Anime list entry already exists: ${animeList.anime.title}`)
      }
    }

    console.log(`✅ Migrated ${animeLists.length} anime list entries`)
  } catch (error) {
    console.error('Error migrating anime lists:', error)
  }
}

async function migrateReviews() {
  console.log('🔄 Migrating reviews...')
  
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: true,
        anime: true,
      }
    })

    for (const review of reviews) {
      // Check if review already exists
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', review.userId)
        .eq('anime_id', review.animeId)
        .single()

      if (!existingReview) {
        const { error } = await supabase
          .from('reviews')
          .insert({
            user_id: review.userId,
            anime_id: review.animeId,
            rating: review.rating,
            review_text: review.content,
            created_at: review.createdAt.toISOString(),
            updated_at: review.updatedAt.toISOString(),
          })

        if (error) {
          console.error(`Error migrating review for user ${review.user.email}:`, error)
        } else {
          console.log(`✅ Migrated review: ${review.anime.title}`)
        }
      } else {
        console.log(`⏭️  Review already exists: ${review.anime.title}`)
      }
    }

    console.log(`✅ Migrated ${reviews.length} reviews`)
  } catch (error) {
    console.error('Error migrating reviews:', error)
  }
}

async function main() {
  console.log('🚀 Starting migration from SQLite/Prisma to Supabase...')
  console.log('Make sure you have:')
  console.log('1. Set up your Supabase project')
  console.log('2. Run the provided SQL schema in your Supabase SQL Editor')
  console.log('3. Set the correct environment variables')
  console.log('')

  try {
    await migrateUsers()
    await migrateAnimeMetadata()
    await migrateAnimeLists()
    await migrateReviews()
    
    console.log('')
    console.log('🎉 Migration completed successfully!')
    console.log('')
    console.log('Next steps:')
    console.log('1. Update your components to use SupabaseAuthProvider')
    console.log('2. Update API routes to use Supabase client')
    console.log('3. Test all functionality')
    console.log('4. Remove Prisma dependencies when ready')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  main()
}

module.exports = {
  migrateUsers,
  migrateAnimeMetadata,
  migrateAnimeLists,
  migrateReviews,
}

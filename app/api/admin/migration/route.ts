import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// Data migration and maintenance operations
export async function POST(request: NextRequest) {
  try {
    const admin = getSupabaseAdmin()
    const { operation, data } = await request.json()

    if (!operation) {
      return NextResponse.json(
        { error: 'Operation is required' },
        { status: 400 }
      )
    }

    switch (operation) {
      case 'cleanup_orphaned_data':
        return await cleanupOrphanedData(admin)
      
      case 'update_user_stats':
        return await updateUserStats(admin)
      
      case 'migrate_anime_data':
        return await migrateAnimeData(admin, data)
      
      case 'backup_data':
        return await backupData(admin)
      
      default:
        return NextResponse.json(
          { error: 'Unknown operation' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Migration API error:', error)
    return NextResponse.json(
      { error: 'Unauthorized or server error' },
      { status: 500 }
    )
  }
}

// Cleanup orphaned data
async function cleanupOrphanedData(admin: any) {
  try {
    // Remove user_anime entries without corresponding anime_metadata
    const { data: orphanedAnime, error: animeError } = await admin
      .from('user_anime')
      .select('id')
      .not('anime_metadata_id', 'in', `(SELECT id FROM anime_metadata)`)

    if (animeError) {
      throw animeError
    }

    // Remove notifications for non-existent users
    const { data: orphanedNotifications, error: notificationError } = await admin
      .from('notifications')
      .select('id')
      .not('user_id', 'in', `(SELECT id FROM profiles)`)

    if (notificationError) {
      throw notificationError
    }

    const cleanupResults = {
      orphanedAnimeEntries: orphanedAnime?.length || 0,
      orphanedNotifications: orphanedNotifications?.length || 0
    }

    return NextResponse.json({
      message: 'Cleanup completed',
      results: cleanupResults
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    throw error
  }
}

// Update user statistics
async function updateUserStats(admin: any) {
  try {
    // Update watch time for all users
    const { data: users, error: usersError } = await admin
      .from('profiles')
      .select('id')

    if (usersError) {
      throw usersError
    }

    let updatedCount = 0
    for (const user of users || []) {
      // Calculate total watch time from user_anime
      const { data: userAnime, error: animeError } = await admin
        .from('user_anime')
        .select(`
          progress,
          anime_metadata(episodes, duration_minutes)
        `)
        .eq('user_id', user.id)

      if (animeError) {
        console.error(`Error fetching anime for user ${user.id}:`, animeError)
        continue
      }

      const totalWatchTime = userAnime?.reduce((total, entry) => {
        const episodes = entry.anime_metadata?.episodes || 0
        const duration = entry.anime_metadata?.duration_minutes || 24
        const progress = entry.progress || 0
        return total + (episodes * duration * progress / 100)
      }, 0) || 0

      // Update user's watch time
      const { error: updateError } = await admin
        .from('profiles')
        .update({ watch_time_hours: Math.round(totalWatchTime / 60) })
        .eq('id', user.id)

      if (updateError) {
        console.error(`Error updating user ${user.id}:`, updateError)
        continue
      }

      updatedCount++
    }

    return NextResponse.json({
      message: `Updated watch time for ${updatedCount} users`,
      updatedCount
    })
  } catch (error) {
    console.error('Update stats error:', error)
    throw error
  }
}

// Migrate anime data
async function migrateAnimeData(admin: any, data: any) {
  try {
    if (!data || !Array.isArray(data)) {
      throw new Error('Data must be an array of anime objects')
    }

    let migratedCount = 0
    for (const anime of data) {
      const { error } = await admin
        .from('anime_metadata')
        .upsert(anime, { onConflict: 'mal_id' })

      if (error) {
        console.error(`Error migrating anime ${anime.title}:`, error)
        continue
      }

      migratedCount++
    }

    return NextResponse.json({
      message: `Migrated ${migratedCount} anime entries`,
      migratedCount
    })
  } catch (error) {
    console.error('Migration error:', error)
    throw error
  }
}

// Backup data
async function backupData(admin: any) {
  try {
    const [profiles, animeMetadata, userAnime, communities] = await Promise.all([
      admin.from('profiles').select('*'),
      admin.from('anime_metadata').select('*'),
      admin.from('user_anime').select('*'),
      admin.from('communities').select('*')
    ])

    const backup = {
      timestamp: new Date().toISOString(),
      profiles: profiles.data || [],
      animeMetadata: animeMetadata.data || [],
      userAnime: userAnime.data || [],
      communities: communities.data || []
    }

    return NextResponse.json({
      message: 'Backup completed',
      backup
    })
  } catch (error) {
    console.error('Backup error:', error)
    throw error
  }
}

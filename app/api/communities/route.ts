import { NextRequest, NextResponse } from 'next/server'
import { getTrendingAnime, transformAniListAnime } from '@/lib/anilist'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '6')

    // Fetch trending anime for community banners
    const response = await getTrendingAnime(1, limit)
    const transformedAnime = response.Page.media.map(transformAniListAnime)

    // Create communities with real anime data
    const communities = transformedAnime.map((anime, index) => {
      const communityTypes = [
        { name: "Fans", category: "Series", description: `Discuss ${anime.title} and share your thoughts` },
        { name: "Lovers", category: "Genre", description: `For fans of ${anime.genres?.[0] || 'anime'} series` },
        { name: "Community", category: "General", description: `Join the ${anime.title} community` },
        { name: "Club", category: "Studio", description: `Fans of ${anime.studios?.[0] || 'anime'} productions` }
      ]

      const communityType = communityTypes[index % communityTypes.length]
      const memberCount = Math.floor(Math.random() * 20000) + 1000
      const postCount = Math.floor(memberCount * 0.15)

      return {
        id: anime.id,
        name: `${anime.title} ${communityType.name}`,
        description: communityType.description,
        members: memberCount,
        posts: postCount,
        image: anime.coverImage || '/placeholder.jpg',
        isJoined: Math.random() > 0.5,
        category: communityType.category,
        trending: Math.random() > 0.7,
        anime: {
          title: anime.title,
          genres: anime.genres,
          studios: anime.studios,
          averageScore: anime.averageScore
        }
      }
    })

    return NextResponse.json({
      communities,
      pageInfo: response.Page.pageInfo
    })
  } catch (error) {
    console.error('Get communities error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch communities' },
      { status: 500 }
    )
  }
}

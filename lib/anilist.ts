import { GraphQLClient } from 'graphql-request'

const ANILIST_ENDPOINT = 'https://graphql.anilist.co'

const client = new GraphQLClient(ANILIST_ENDPOINT)

// GraphQL Queries
const SEARCH_ANIME_QUERY = `
  query SearchAnime($search: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
        id
        title {
          romaji
          english
          native
        }
        description
        coverImage {
          large
          medium
        }
        bannerImage
        episodes
        status
        format
        season
        seasonYear
        genres
        tags {
          name
          description
        }
        averageScore
        popularity
        studios {
          nodes {
            name
          }
        }
        source
        duration
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        nextAiringEpisode {
          airingAt
          episode
        }
      }
    }
  }
`

const GET_ANIME_BY_ID_QUERY = `
  query GetAnimeById($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      title {
        romaji
        english
        native
      }
      description
      coverImage {
        large
        medium
      }
      bannerImage
      episodes
      status
      format
      season
      seasonYear
      genres
      tags {
        name
        description
      }
      averageScore
      popularity
      studios {
        nodes {
          name
        }
      }
      source
      duration
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      nextAiringEpisode {
        airingAt
        episode
      }
      characters {
        nodes {
          id
          name {
            full
          }
          image {
            large
          }
        }
      }
      staff {
        nodes {
          id
          name {
            full
          }
          role
        }
      }
      relations {
        edges {
          relationType
          node {
            id
            title {
              romaji
              english
            }
            type
            format
          }
        }
      }
      recommendations {
        nodes {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
          }
          averageScore
        }
      }
    }
  }
`

const GET_TRENDING_ANIME_QUERY = `
  query GetTrendingAnime($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(type: ANIME, sort: TRENDING_DESC, status: RELEASING) {
        id
        title {
          romaji
          english
          native
        }
        description
        coverImage {
          large
          medium
        }
        bannerImage
        episodes
        status
        format
        season
        seasonYear
        genres
        tags {
          name
          description
        }
        averageScore
        popularity
        studios {
          nodes {
            name
          }
        }
        source
        duration
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        nextAiringEpisode {
          airingAt
          episode
        }
      }
    }
  }
`

const GET_ANIME_BY_GENRE_QUERY = `
  query GetAnimeByGenre($genre: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(type: ANIME, genre: $genre, sort: POPULARITY_DESC) {
        id
        title {
          romaji
          english
          native
        }
        description
        coverImage {
          large
          medium
        }
        bannerImage
        episodes
        status
        format
        season
        seasonYear
        genres
        tags {
          name
          description
        }
        averageScore
        popularity
        studios {
          nodes {
            name
          }
        }
        source
        duration
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        nextAiringEpisode {
          airingAt
          episode
        }
      }
    }
  }
`

// Types
export interface AniListAnime {
  id: number
  title: {
    romaji: string
    english?: string
    native: string
  }
  description?: string
  coverImage?: {
    large?: string
    medium?: string
  }
  bannerImage?: string
  episodes?: number
  status?: string
  format?: string
  season?: string
  seasonYear?: number
  genres: string[]
  tags: Array<{
    name: string
    description?: string
  }>
  averageScore?: number
  popularity?: number
  studios: {
    nodes: Array<{
      name: string
    }>
  }
  source?: string
  duration?: number
  startDate?: {
    year?: number
    month?: number
    day?: number
  }
  endDate?: {
    year?: number
    month?: number
    day?: number
  }
  nextAiringEpisode?: {
    airingAt: number
    episode: number
  }
  characters?: {
    nodes: Array<{
      id: number
      name: {
        full: string
      }
      image?: {
        large?: string
      }
    }>
  }
  staff?: {
    nodes: Array<{
      id: number
      name: {
        full: string
      }
      role: string
    }>
  }
  relations?: {
    edges: Array<{
      relationType: string
      node: {
        id: number
        title: {
          romaji: string
          english?: string
        }
        type: string
        format?: string
      }
    }>
  }
  recommendations?: {
    nodes: Array<{
      id: number
      title: {
        romaji: string
        english?: string
      }
      coverImage?: {
        large?: string
      }
      averageScore?: number
    }>
  }
}

export interface AniListPageInfo {
  total: number
  currentPage: number
  lastPage: number
  hasNextPage: boolean
  perPage: number
}

export interface AniListResponse {
  Page: {
    pageInfo: AniListPageInfo
    media: AniListAnime[]
  }
}

export interface AniListSingleResponse {
  Media: AniListAnime
}

// API Functions
export async function searchAnime(
  search: string,
  page: number = 1,
  perPage: number = 20
): Promise<AniListResponse> {
  try {
    const variables = {
      search,
      page,
      perPage,
    }

    const data = await client.request<AniListResponse>(SEARCH_ANIME_QUERY, variables)
    return data
  } catch (error) {
    console.error('Error searching anime:', error)
    throw new Error('Failed to search anime')
  }
}

export async function getAnimeById(id: number): Promise<AniListAnime> {
  try {
    const variables = { id }
    const data = await client.request<AniListSingleResponse>(GET_ANIME_BY_ID_QUERY, variables)
    return data.Media
  } catch (error) {
    console.error('Error fetching anime by ID:', error)
    throw new Error('Failed to fetch anime details')
  }
}

export async function getTrendingAnime(
  page: number = 1,
  perPage: number = 20
): Promise<AniListResponse> {
  try {
    const variables = {
      page,
      perPage,
    }

    const data = await client.request<AniListResponse>(GET_TRENDING_ANIME_QUERY, variables)
    return data
  } catch (error) {
    console.error('Error fetching trending anime:', error)
    throw new Error('Failed to fetch trending anime')
  }
}

export async function getAnimeByGenre(
  genre: string,
  page: number = 1,
  perPage: number = 20
): Promise<AniListResponse> {
  try {
    const variables = {
      genre,
      page,
      perPage,
    }

    const data = await client.request<AniListResponse>(GET_ANIME_BY_GENRE_QUERY, variables)
    return data
  } catch (error) {
    console.error('Error fetching anime by genre:', error)
    throw new Error('Failed to fetch anime by genre')
  }
}

// Utility function to transform AniList data to our internal format
export function transformAniListAnime(anime: AniListAnime) {
  return {
    id: anime.id,
    title: anime.title.english || anime.title.romaji,
    titleEnglish: anime.title.english,
    titleRomaji: anime.title.romaji,
    titleNative: anime.title.native,
    description: anime.description?.replace(/<[^>]*>/g, '') || '', // Remove HTML tags
    coverImage: anime.coverImage?.large || anime.coverImage?.medium,
    bannerImage: anime.bannerImage,
    episodes: anime.episodes,
    status: anime.status,
    format: anime.format,
    season: anime.season,
    seasonYear: anime.seasonYear,
    genres: anime.genres,
    tags: anime.tags.map(tag => tag.name),
    averageScore: anime.averageScore,
    popularity: anime.popularity,
    studios: anime.studios.nodes.map(studio => studio.name),
    source: anime.source,
    duration: anime.duration,
    startDate: anime.startDate ? new Date(
      anime.startDate.year || 0,
      (anime.startDate.month || 1) - 1,
      anime.startDate.day || 1
    ) : null,
    endDate: anime.endDate ? new Date(
      anime.endDate.year || 0,
      (anime.endDate.month || 1) - 1,
      anime.endDate.day || 1
    ) : null,
    nextAiringEpisode: anime.nextAiringEpisode?.episode,
    nextAiringTime: anime.nextAiringEpisode ? new Date(anime.nextAiringEpisode.airingAt * 1000) : null,
  }
}

import { prisma } from './prisma'

export interface AnimeListEntry {
  id: string
  userId: string
  animeId: number
  status: 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch'
  progress: number
  rating?: number
  notes?: string
  startDate?: Date
  completedDate?: Date
  createdAt: Date
  updatedAt: Date
  anime: {
    id: number
    title: string
    titleEnglish?: string
    coverImage?: string
    episodes?: number
    status?: string
    format?: string
    season?: string
    seasonYear?: number
    genres: string[]
    averageScore?: number
    popularity?: number
    studios: string[]
  }
}

export async function getUserAnimeList(
  userId: string,
  status?: string
): Promise<AnimeListEntry[]> {
  const whereClause: any = {
    userId,
  }

  if (status) {
    whereClause.status = status
  }

  const animeLists = await prisma.animeList.findMany({
    where: whereClause,
    include: {
      anime: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  return animeLists as AnimeListEntry[]
}

export async function addAnimeToList(
  userId: string,
  animeId: number,
  status: string,
  progress: number = 0,
  rating?: number,
  notes?: string,
  startDate?: Date,
  completedDate?: Date
): Promise<AnimeListEntry> {
  // Check if anime already exists in user's list
  const existingEntry = await prisma.animeList.findUnique({
    where: {
      userId_animeId: {
        userId,
        animeId,
      },
    },
  })

  if (existingEntry) {
    throw new Error('Anime already exists in your list')
  }

  // Create new anime list entry
  const animeListEntry = await prisma.animeList.create({
    data: {
      userId,
      animeId,
      status: status as any,
      progress,
      rating,
      notes,
      startDate,
      completedDate,
    },
    include: {
      anime: true,
    },
  })

  return animeListEntry as AnimeListEntry
}

export async function updateAnimeInList(
  animeListId: string,
  userId: string,
  updates: {
    status?: string
    progress?: number
    rating?: number
    notes?: string
    startDate?: Date
    completedDate?: Date
  }
): Promise<AnimeListEntry> {
  // Check if the anime list entry belongs to the user
  const existingEntry = await prisma.animeList.findFirst({
    where: {
      id: animeListId,
      userId,
    },
  })

  if (!existingEntry) {
    throw new Error('Anime list entry not found')
  }

  // Update the anime list entry
  const updatedEntry = await prisma.animeList.update({
    where: { id: animeListId },
    data: {
      status: updates.status || existingEntry.status,
      progress: updates.progress !== undefined ? updates.progress : existingEntry.progress,
      rating: updates.rating !== undefined ? updates.rating : existingEntry.rating,
      notes: updates.notes !== undefined ? updates.notes : existingEntry.notes,
      startDate: updates.startDate || existingEntry.startDate,
      completedDate: updates.completedDate || existingEntry.completedDate,
    },
    include: {
      anime: true,
    },
  })

  return updatedEntry as AnimeListEntry
}

export async function removeAnimeFromList(
  animeListId: string,
  userId: string
): Promise<void> {
  // Check if the anime list entry belongs to the user
  const existingEntry = await prisma.animeList.findFirst({
    where: {
      id: animeListId,
      userId,
    },
  })

  if (!existingEntry) {
    throw new Error('Anime list entry not found')
  }

  // Delete the anime list entry
  await prisma.animeList.delete({
    where: { id: animeListId },
  })
}

export async function getAnimeListStats(userId: string) {
  const stats = await prisma.animeList.groupBy({
    by: ['status'],
    where: {
      userId,
    },
    _count: {
      id: true,
    },
  })

  const totalAnime = await prisma.animeList.count({
    where: { userId },
  })

  const completedAnime = await prisma.animeList.count({
    where: {
      userId,
      status: 'completed',
    },
  })

  const watchingAnime = await prisma.animeList.findMany({
    where: {
      userId,
      status: 'watching',
    },
    select: {
      progress: true,
    },
  })

  const averageProgress = watchingAnime.length > 0
    ? Math.round(watchingAnime.reduce((acc, anime) => acc + anime.progress, 0) / watchingAnime.length)
    : 0

  return {
    totalAnime,
    completedAnime,
    averageProgress,
    statusCounts: stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.id
      return acc
    }, {} as Record<string, number>),
  }
}

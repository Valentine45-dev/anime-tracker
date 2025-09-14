import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const whereClause: any = {
      userId: decoded.userId,
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

    return NextResponse.json({ animeLists })
  } catch (error) {
    console.error('Get anime list error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const { animeId, status, progress, rating, notes, startDate, completedDate } = await request.json()

    if (!animeId || !status) {
      return NextResponse.json(
        { error: 'Anime ID and status are required' },
        { status: 400 }
      )
    }

    // Check if anime already exists in user's list
    const existingEntry = await prisma.animeList.findUnique({
      where: {
        userId_animeId: {
          userId: decoded.userId,
          animeId: parseInt(animeId),
        },
      },
    })

    if (existingEntry) {
      return NextResponse.json(
        { error: 'Anime already exists in your list' },
        { status: 409 }
      )
    }

    // Create new anime list entry
    const animeListEntry = await prisma.animeList.create({
      data: {
        userId: decoded.userId,
        animeId: parseInt(animeId),
        status,
        progress: progress || 0,
        rating: rating || null,
        notes: notes || null,
        startDate: startDate ? new Date(startDate) : null,
        completedDate: completedDate ? new Date(completedDate) : null,
      },
      include: {
        anime: true,
      },
    })

    return NextResponse.json({ animeListEntry })
  } catch (error) {
    console.error('Add anime to list error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

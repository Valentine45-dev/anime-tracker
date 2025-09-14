import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const animeListId = params.id
    const { status, progress, rating, notes, startDate, completedDate } = await request.json()

    // Check if the anime list entry belongs to the user
    const existingEntry = await prisma.animeList.findFirst({
      where: {
        id: animeListId,
        userId: decoded.userId,
      },
    })

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Anime list entry not found' },
        { status: 404 }
      )
    }

    // Update the anime list entry
    const updatedEntry = await prisma.animeList.update({
      where: { id: animeListId },
      data: {
        status: status || existingEntry.status,
        progress: progress !== undefined ? progress : existingEntry.progress,
        rating: rating !== undefined ? rating : existingEntry.rating,
        notes: notes !== undefined ? notes : existingEntry.notes,
        startDate: startDate ? new Date(startDate) : existingEntry.startDate,
        completedDate: completedDate ? new Date(completedDate) : existingEntry.completedDate,
      },
      include: {
        anime: true,
      },
    })

    return NextResponse.json({ animeListEntry: updatedEntry })
  } catch (error) {
    console.error('Update anime list error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const animeListId = params.id

    // Check if the anime list entry belongs to the user
    const existingEntry = await prisma.animeList.findFirst({
      where: {
        id: animeListId,
        userId: decoded.userId,
      },
    })

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Anime list entry not found' },
        { status: 404 }
      )
    }

    // Delete the anime list entry
    await prisma.animeList.delete({
      where: { id: animeListId },
    })

    return NextResponse.json({ message: 'Anime removed from list' })
  } catch (error) {
    console.error('Delete anime from list error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

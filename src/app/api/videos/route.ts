import { NextResponse } from 'next/server'
import { VideoListResponse, Video } from '@/types'
import data from '@/data/videos.json'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Get query parameters
    const searchQuery = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pagesize') || '10')

    // Filter and paginate data
    let filteredVideos = data.items.filter((video) =>
      video.snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.snippet.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) as Video[]

    // Pagination calculations
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedVideos = filteredVideos.slice(startIndex, endIndex)

    const response: VideoListResponse = {
      currentPage: page,
      totalPages: Math.ceil(filteredVideos.length / pageSize),
      totalResults: filteredVideos.length,
      resultsPerPage: pageSize,
      items: paginatedVideos
    }

    return NextResponse.json(response)

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
'use client'

import { useState, useEffect } from 'react'
import { Video, VideoListResponse } from '@/types'
import { useDebounce } from '@/hooks/useDebounce'
import Pagination from './Pagination'
import { useVideo } from '@/context/VideoContext'

export default function Sidebar() {
  const [videos, setVideos] = useState<Video[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const debouncedSearch = useDebounce(search)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true)
        const res = await fetch(
          `/api/videos?search=${debouncedSearch}&page=${currentPage}`
        )
        const data: VideoListResponse = await res.json()
        setVideos(data.items)
        setTotalPages(data.totalPages)
      } catch (error) {
        console.error('Error fetching videos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [debouncedSearch, currentPage])

  return (
    <aside className="font-sans w-full md:w-80 bg-[#1F1F1F] text-gray-200 border-r border-gray-700 overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-4">
        <h1 className="text-xl font-semibold tracking-wide mb-4">
          Video Library
        </h1>
        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search videos..."
            className="w-full px-4 py-2 rounded-md bg-[#323232] text-gray-200
                       placeholder-gray-400 border border-[#3A3A3A]
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Video List */}
      <div className="px-2 space-y-2 pb-20">
        {loading ? (
          <div className="text-gray-500 text-center py-4">Loading...</div>
        ) : videos.length > 0 ? (
          videos.map((video) => (
            <VideoCard key={video.id.videoId} video={video} />
          ))
        ) : (
          <div className="text-gray-500 text-center py-4">No videos found</div>
        )}
      </div>

      {/* Pagination (Sticky at bottom) */}
      <div className="sticky bottom-0 w-full bg-[#1F1F1F] border-t border-gray-700 px-4 py-3">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </aside>
  )
}

// ------------- VideoCard -------------
interface VideoCardProps {
  video: Video
}

function VideoCard({ video }: VideoCardProps) {
  const { selectedVideo, setSelectedVideo } = useVideo()
  const isSelected = selectedVideo?.id.videoId === video.id.videoId

  return (
    <div
      onClick={() => setSelectedVideo(video)}
      className={`
        flex items-center p-3 rounded-md cursor-pointer transition-colors
        ${isSelected
          ? 'bg-[#2F2F2F] ring-1 ring-blue-500'
          : 'hover:bg-[#2A2A2A]'
        }
      `}
    >
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-[120px] aspect-video relative rounded overflow-hidden bg-black">
        <img
          src={video.snippet.thumbnails.medium.url}
          alt={video.snippet.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      {/* Video Info */}
      <div className="ml-3 flex-1 overflow-hidden">
        <h3
          className={`
            text-sm font-medium mb-1 line-clamp-2 
            ${isSelected ? 'text-blue-400' : 'text-gray-100'}
          `}
        >
          {video.snippet.title}
        </h3>
        <p className="text-xs text-gray-400 line-clamp-2">
          {video.snippet.description}
        </p>
      </div>
    </div>
  )
}
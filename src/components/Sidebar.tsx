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
        const res = await fetch(`/api/videos?search=${debouncedSearch}&page=${currentPage}`)
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
    <aside className="w-full md:w-80 lg:w-80 bg-white border-t md:border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <h1 className="text-xl font-bold text-gray-800 mb-4">Video Library</h1>
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search videos..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-4">
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
      </div>
      <div className="sticky bottom-0 w-full">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </aside>
  )
}


interface VideoCardProps {
  video: Video
}

function VideoCard({ video }: VideoCardProps) {
  const { selectedVideo, setSelectedVideo } = useVideo()
  const isSelected = selectedVideo?.id.videoId === video.id.videoId

  return (
    <div
      onClick={() => setSelectedVideo(video)}
      className={`p-3 rounded-lg cursor-pointer transition-colors
        ${isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}`}
    >
      <div className='flex space-x-4'>
        <div className="w-[120px] flex-shrink-0">
          <div className="aspect-video relative rounded-lg overflow-hidden">
            <img
              src={video.snippet.thumbnails.medium.url}
              alt={video.snippet.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium mb-1 line-clamp-2 text-sm
            ${isSelected ? 'text-blue-600' : 'text-gray-800'}`}>
            {video.snippet.title}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2">
            {video.snippet.description}
          </p>
        </div>
      </div>
    </div>
  )
}
'use client'
import { useState, useEffect } from 'react'
import { Video, VideoListResponse } from '@/types'
import { useDebounce } from '@/hooks/useDebounce'

export default function Sidebar() {
  const [videos, setVideos] = useState<Video[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const debouncedSearch = useDebounce(search)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/videos?search=${debouncedSearch}`)
        const data: VideoListResponse = await res.json()
        setVideos(data.items)
      } catch (error) {
        console.error('Error fetching videos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [debouncedSearch])

  return (
    <aside className="w-full md:w-64 lg:w-80 bg-white border-t md:border-r border-gray-200 overflow-y-auto">
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
    </aside>
  )
}


interface VideoCardProps {
  video: Video
}

function VideoCard({ video }: VideoCardProps) {
  return (
    <div className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
      <div className="aspect-video w-full mb-2 overflow-hidden rounded-lg">
        <img
          srcSet={`
            ${video.snippet.thumbnails.default.url} 120w,
            ${video.snippet.thumbnails.medium.url} 320w,
            ${video.snippet.thumbnails.high.url} 480w
          `}
          sizes="(max-width: 768px) 120px,
                 (max-width: 1024px) 320px,
                 480px"
          src={video.snippet.thumbnails.medium.url}
          alt={video.snippet.title}
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="font-medium text-gray-800 mb-1 line-clamp-2">
        {video.snippet.title}
      </h3>
      <p className="text-sm text-gray-500 line-clamp-2">
        {video.snippet.description}
      </p>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { Video, VideoListResponse } from '@/types'
import { useDebounce } from '@/hooks/useDebounce'
import Pagination from './Pagination'
import VideoCard from './VideoCard'
import React from 'react'

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
    <aside className="font-sans w-full md:w-96 bg-[#1F1F1F] text-gray-200 border-r border-gray-700 h-screen flex flex-col">
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
      <div className="px-2 space-y-2 py-2 md:overflow-y-auto flex-grow custom-scrollbar">
        {loading ? (
          <div key="loading-state" className="text-gray-500 text-center py-4">
            Loading...
          </div>
        ) : videos?.length > 0 ? (
          videos.map((video) => (
            <VideoCard
              key={video.id.videoId}
              video={video}
            />
          ))
        ) : (
          <div key="no-videos-state" className="text-gray-500 text-center py-4">
            No videos found
          </div>
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


'use client'
import { createContext, useContext, useState } from 'react'
import { Video } from '@/types'

type VideoContextType = {
    selectedVideo: Video | null
    setSelectedVideo: (video: Video | null) => void
}

const VideoContext = createContext<VideoContextType | undefined>(undefined)

export function VideoProvider({ children }: { children: React.ReactNode }) {
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)

    return (
        <VideoContext.Provider value={{ selectedVideo, setSelectedVideo }}>
            {children}
        </VideoContext.Provider>
    )
}

export function useVideo() {
    const context = useContext(VideoContext)
    if (context === undefined) {
        throw new Error('useVideo must be used within a VideoProvider')
    }
    return context
}
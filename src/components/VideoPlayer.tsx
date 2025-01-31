'use client'
import { useVideo } from '@/context/VideoContext'
import { on } from 'events'
import { useCallback, useEffect, useRef, useState } from 'react'

interface TrimValues {
  start: number
  end?: number
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export default function VideoPlayer() {
  const { selectedVideo } = useVideo()
  const playerRef = useRef<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [trim, setTrim] = useState<TrimValues>({ start: 0 })
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Reset states when video changes
  useEffect(() => {
    if (selectedVideo) {
      setIsLoading(true)
      setCurrentTime(0)
      setDuration(0)
      setIsPlaying(false)

      // Load saved trim or set default
      const savedTrim = localStorage.getItem(`trim-${selectedVideo.id.videoId}`)
      if (savedTrim) {
        setTrim(JSON.parse(savedTrim))
      } else {
        setTrim({ start: 0 })
      }
    }
  }, [selectedVideo])

  useEffect(() => {
    if (!isInitialized) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
      window.onYouTubeIframeAPIReady = () => setIsInitialized(true)

      return () => {
        window.onYouTubeIframeAPIReady = () => { }
      }
    }
  }, [isInitialized])

  useEffect(() => {
    if (selectedVideo) {
      const savedTrim = localStorage.getItem(`trim-${selectedVideo.id.videoId}`)
      if (savedTrim) {
        setTrim(JSON.parse(savedTrim))
      } else {
        setTrim({ start: 0 })
      }
    }
  }, [selectedVideo])

  useEffect(() => {
    if (isInitialized && selectedVideo) {
      if (playerRef.current) {
        playerRef.current.destroy()
      }
      initializePlayer()
    }
  }, [isInitialized, selectedVideo])

  const initializePlayer = () => {
    if (!selectedVideo) return

    playerRef.current = new window.YT.Player('youtube-player', {
      videoId: selectedVideo.id.videoId,
      playerVars: {
        controls: 0,        // Hide controls
        disablekb: 1,      // Disable keyboard controls
        fs: 0,             // Disable fullscreen
        modestbranding: 1, // Hide YouTube logo
        rel: 0,            // Disable related videos
        showinfo: 0,       // Hide video info
        iv_load_policy: 3  // Disable annotations
      },
      events: {
        onReady: (event: any) => {
          try {
            const newDuration = event.target.getDuration()
            setDuration(newDuration)

            // Load saved trim values
            const savedTrim = localStorage.getItem(`trim-${selectedVideo.id.videoId}`)
            if (savedTrim) {
              const parsedTrim = JSON.parse(savedTrim)
              setTrim(parsedTrim)
              // Start from saved trim point
              event.target.seekTo(parsedTrim.start)
            } else {
              // Set default trim
              setTrim({ start: 0, end: newDuration })
            }

            // Start playback
            event.target.playVideo()
            setIsLoading(false)
          } catch (error) {
            console.error('Error initializing player:', error)
            setIsLoading(false)
          }
        },
        onStateChange: (event: any) => {
          setIsPlaying(event.data === window.YT.PlayerState.PLAYING)
        }
      }
    })
  }

  const handlePlayPause = () => {
    if (!playerRef.current) return

    try {
      if (isPlaying) {
        playerRef.current.pauseVideo()
      } else {
        // Ensure we start from trim start point
        playerRef.current.seekTo(trim.start)
        playerRef.current.playVideo()
      }
    } catch (error) {
      console.error('Error controlling video:', error)
    }
  }

  const startTimeTracking = () => {
    const interval = setInterval(() => {
      if (playerRef.current) {
        try {
          const currentTime = playerRef.current.getCurrentTime()
          setCurrentTime(currentTime)

          if (trim.end !== undefined && currentTime >= trim.end) {
            playerRef.current.pauseVideo()
            setIsPlaying(false)
            clearInterval(interval)
          }
        } catch (error) {
          console.error('Error tracking time:', error)
          clearInterval(interval)
        }
      }
    }, 100)

    return () => clearInterval(interval)
  }

  useEffect(() => {
    if (isPlaying && playerRef.current) {
      const cleanup = startTimeTracking()
      return () => cleanup()
    }
  }, [isPlaying, trim.end])

  const handleTrimChange = (newTrim: TrimValues) => {
    setTrim(newTrim)
    if (selectedVideo) {
      localStorage.setItem(`trim-${selectedVideo.id.videoId}`, JSON.stringify(newTrim))
    }
  }

  return (
    <div className="md:flex-1 bg-gray-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto flex flex-col">
        <div className="w-full aspect-video bg-gray-200 rounded-t-xl overflow-hidden relative">
          {selectedVideo ? (
            <div id="youtube-player" className="absolute inset-0 w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              Select a video to play
            </div>
          )}
        </div>

        {selectedVideo && (
          <div className="bg-gray-100 rounded-b-xl px-4 pb-4 pt-1">


            <div className="space-y-2">
              <div className="relative h-2 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: `${(currentTime / duration) * 100}%`
                  }}
                />
              </div>
              <button
                onClick={handlePlayPause}
                className="bg-blue-500 text-white rounded-full px-6 py-2 hover:bg-blue-600"
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <RangeSlider
                min={0}
                max={duration}
                start={trim.start}
                end={trim.end}
                onChange={handleTrimChange}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface RangeSliderProps {
  min: number
  max: number
  start: number
  end?: number
  onChange: (values: { start: number; end?: number }) => void
}

export function RangeSlider({ min, max, start, end, onChange }: RangeSliderProps) {
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

  const startPercent = ((start - min) / (max - min)) * 100
  const endPercent = end ? ((end - min) / (max - min)) * 100 : 100

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging || !sliderRef.current) return

    const rect = sliderRef.current.getBoundingClientRect()
    const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1)
    const value = min + (max - min) * percent

    if (isDragging === 'start') {
      if (!end || value < end) {
        onChange({ start: value, end })
      }
    } else {
      if (value > start) {
        onChange({ start, end: value })
      }
    }
  }, [isDragging, min, max, start, end, onChange])

  const handlePointerDown = (handle: 'start' | 'end') => {
    setIsDragging(handle)
    document.body.style.userSelect = 'none'
  }

  const handlePointerUp = () => {
    setIsDragging(null)
    document.body.style.userSelect = ''
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [isDragging, handlePointerMove])

  return (
    <div ref={sliderRef} className="relative h-2 w-full">
      <div className="absolute w-full h-full bg-gray-200 rounded-full" />
      <div
        className="absolute h-full bg-blue-500 rounded-full"
        style={{
          left: `${startPercent}%`,
          right: `${100 - endPercent}%`
        }}
      />
      <div
        onPointerDown={() => handlePointerDown('start')}
        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white 
                   border-2 border-blue-500 cursor-pointer hover:scale-110 
                   transition-transform touch-none"
        style={{ left: `calc(${startPercent}% - 8px)` }}
      />
      <div
        onPointerDown={() => handlePointerDown('end')}
        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white 
                   border-2 border-blue-500 cursor-pointer hover:scale-110 
                   transition-transform touch-none"
        style={{ left: `calc(${endPercent}% - 8px)` }}
      />
    </div>
  )
}
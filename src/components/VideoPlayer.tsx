'use client'
import { useVideo } from '@/context/VideoContext'
import { useEffect, useRef, useState } from 'react'
import {
  PlayIcon,
  PauseIcon,
  ScissorsIcon,
  ClockIcon,
  ChevronUpIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon
} from '@heroicons/react/24/solid'
import RangeSlider from './RangeSlider'
import ProgressBar from './ProgressBar'
interface TrimValues {
  start: number
  end?: number
}

// Declare global window properties for YouTube API
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
  const [isTrimExpanded, setIsTrimExpanded] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const handlePlayerReady = () => {
    setIsPlayerReady(true);
  };

  // Check if trim is at default values
  const isTrimDefault = trim.start === 0 && (trim.end === undefined || trim.end === duration)

  // Add mute toggle function
  const toggleMute = () => {
    if (!playerRef.current) return
    try {
      if (isMuted) {
        playerRef.current.unMute()
      } else {
        playerRef.current.mute()
      }
      setIsMuted(!isMuted)
    } catch (error) {
      console.error('Error toggling mute:', error)
    }
  }

  // Expand trim section if trim is not default
  useEffect(() => {
    if (!isTrimDefault) {
      setIsTrimExpanded(true)
    }
  }, [isTrimDefault])

  // Handle video selection change
  useEffect(() => {
    if (selectedVideo) {
      setIsLoading(true)
      setCurrentTime(0)
      setDuration(0)
      setIsPlaying(false)

      const savedTrim = localStorage.getItem(`trim-${selectedVideo.id.videoId}`)
      if (savedTrim) {
        setTrim(JSON.parse(savedTrim))
      } else {
        setTrim({ start: 0 })
      }
    }
  }, [selectedVideo])

  // Initialize YouTube API
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

  // Handle video selection change
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

  // Initialize player when API is ready and video is selected
  useEffect(() => {
    if (isInitialized && selectedVideo) {
      if (playerRef.current) {
        playerRef.current.destroy()
      }
      initializePlayer()
    }
  }, [isInitialized, selectedVideo])

  // Initialize YouTube player
  const initializePlayer = () => {
    if (!selectedVideo) return

    playerRef.current = new window.YT.Player('youtube-player', {
      videoId: selectedVideo.id.videoId,
      playerVars: {
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        mute: isMuted ? 1 : 0
      },
      events: {
        onReady: (event: any) => {
          try {
            const newDuration = event.target.getDuration()
            setDuration(newDuration)

            const savedTrim = localStorage.getItem(`trim-${selectedVideo.id.videoId}`)
            if (savedTrim) {
              const parsedTrim = JSON.parse(savedTrim)
              setTrim(parsedTrim)
              event.target.seekTo(parsedTrim.start)
            } else {
              setTrim({ start: 0, end: newDuration })
            }

            event.target.playVideo()
            if (isMuted) {
              event.target.mute()
            } else {
              event.target.unMute()
            }
            setIsLoading(false)
            handlePlayerReady()

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

  // Handle play/pause button click
  const handlePlayPause = () => {
    if (!playerRef.current) return

    try {
      if (isPlaying) {
        playerRef.current.pauseVideo()
      } else {
        // Ensure we start from current time within trim boundaries
        const startTime = Math.max(trim.start, Math.min(currentTime, trim.end || duration))
        playerRef.current.seekTo(startTime)
        playerRef.current.playVideo()
      }
    } catch (error) {
      console.error('Error controlling video:', error)
    }
  }

  // Handle time change from progress bar
  const handleTimeChange = (newTime: number) => {
    if (!playerRef.current) return
    try {
      // Clamp time within trim boundaries
      const clampedTime = Math.max(trim.start, Math.min(newTime, trim.end || duration))
      setCurrentTime(clampedTime)
      playerRef.current?.seekTo(clampedTime)

      // Keep playing if we were already playing
      if (isPlaying) {
        playerRef.current.playVideo()
      }
    } catch (error) {
      console.error('Error seeking video:', error)
    }
  }

  // Track current time and clamp within trim boundaries
  useEffect(() => {
    // Early return if player not ready
    if (!isPlayerReady || !playerRef.current) return;

    // Default values for trim boundaries
    const startTime = trim?.start ?? 0;
    const endTime = trim?.end ?? duration ?? Infinity;

    // Clamp current time between boundaries
    const clampedTime = Math.max(
      startTime,
      Math.min(currentTime ?? 0, endTime)
    );

    if (clampedTime !== currentTime) {
      setCurrentTime(clampedTime);
      try {
        if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
          console.debug('Seeking to:', clampedTime);
          playerRef.current.seekTo(clampedTime);
        }
      } catch (error) {
        console.warn('Failed to seek:', error);
      }
    }
  }, [trim?.start, trim?.end, currentTime, isPlayerReady, duration]);

  // Start tracking current time when video is playing
  const startTimeTracking = () => {
    const interval = setInterval(() => {
      if (playerRef.current) {
        try {
          const playerTime = playerRef.current?.getCurrentTime()

          // Only update if not currently dragging
          setCurrentTime(Math.max(trim.start, Math.min(playerTime, trim.end || duration)))

          if (trim.end !== undefined && playerTime >= trim.end) {
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

  // Start time tracking when video is playing
  useEffect(() => {
    if (isPlaying && playerRef.current) {
      const cleanup = startTimeTracking()
      return () => cleanup()
    }
  }, [isPlaying, trim.end])

  // Handle trim change and save to local storage
  const handleTrimChange = (newTrim: TrimValues) => {
    setTrim(newTrim)
    if (selectedVideo) {
      localStorage.setItem(`trim-${selectedVideo.id.videoId}`, JSON.stringify(newTrim))
    }
  }

  // Format time in HH:MM:SS
  const formatTime = (seconds: number): string => {
    if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
      return '00:00:00';
    }

    // Clamp to reasonable maximum (24 hours)
    seconds = Math.min(Math.floor(seconds), 86400);

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const pad = (num: number) => num.toString().padStart(2, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
  }

  const toggleFullscreen = () => {
    if (playerRef.current && typeof playerRef.current.getIframe === 'function') {
      const iframe = playerRef.current.getIframe();
      if (iframe) {
        // Request fullscreen on the iframe element
        if (!document.fullscreenElement) {
          iframe.requestFullscreen?.() ||
            iframe.webkitRequestFullscreen?.() ||
            iframe.mozRequestFullScreen?.() ||
            iframe.msRequestFullscreen?.();
        }
      }
    }
  };


  // Render component
  return (
    <div className="md:flex-1 bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-6 shadow-2xl">
      <div className="max-w-4xl mx-auto flex flex-col space-y-4">
        <div className="w-full aspect-video bg-gray-800 rounded-xl overflow-hidden relative border-4 border-gray-700 hover:border-gray-600 transition-all">
          {selectedVideo ? (
            <>
              <div id="youtube-player" className="absolute inset-0 w-full h-full" />

              {isLoading && (
                <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-600 border-t-blue-500" />
                </div>
              )}

              <button
                onClick={handlePlayPause}
                className="absolute inset-0 w-full h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              >
                <div className="p-6 bg-gray-900/70 rounded-full backdrop-blur-sm transform hover:scale-110 transition-transform">
                  {isPlaying ? (
                    <PauseIcon className="h-16 w-16 text-white" />
                  ) : (
                    <PlayIcon className="h-16 w-16 text-white pl-2" />
                  )}
                </div>
              </button>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <div className="text-center space-y-4">
                <ScissorsIcon className="h-16 w-16 mx-auto opacity-50" />
                <p className="text-xl font-light">Select a video to start trimming</p>
              </div>
            </div>
          )}
        </div>

        {selectedVideo && (
          <div className="bg-gray-800 rounded-xl p-6 space-y-6 shadow-lg">
            <div className="space-y-4">
              <div className="flex justify-between text-gray-400 text-sm font-medium">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>

              <ProgressBar
                currentTime={currentTime}
                duration={duration}
                onChange={handleTimeChange}
              />

              <div className="space-y-6">
                <div
                  className={`flex items-center space-x-2 ${isTrimDefault ? 'cursor-pointer hover:text-blue-300' : ''
                    } text-blue-400 transition-colors`}
                  onClick={() => isTrimDefault && setIsTrimExpanded(!isTrimExpanded)}
                >
                  <ScissorsIcon className="h-5 w-5" />
                  <span className="font-medium">Trim Range</span>
                  {isTrimDefault && (
                    <ChevronUpIcon
                      className={`h-4 w-4 transition-transform ${isTrimExpanded ? 'rotate-180' : ''
                        }`}
                    />
                  )}
                </div>

                {isTrimExpanded && (
                  <>
                    <RangeSlider
                      min={0}
                      max={duration}
                      start={trim.start}
                      end={trim.end}
                      onChange={handleTrimChange}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2 bg-gray-700 p-3 rounded-lg">
                        <ClockIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-300">{formatTime(trim.start)}</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-gray-700 p-3 rounded-lg">
                        <ClockIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-300">{formatTime(trim.end || duration)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={handlePlayPause}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transform hover:scale-105 transition-all"
              >
                {isPlaying ? (
                  <>
                    <PauseIcon className="h-5 w-5 text-white" />
                    <span className="text-white font-medium">Pause</span>
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-5 w-5 text-white" />
                    <span className="text-white font-medium">Play</span>
                  </>
                )}
              </button>

              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleMute}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <SpeakerXMarkIcon className="h-6 w-6 text-gray-400" />
                  ) : (
                    <SpeakerWaveIcon className="h-6 w-6 text-gray-400" />
                  )}
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="p-2 hover:bg-gray-700 rounded-full"
                  aria-label="Toggle fullscreen"
                >
                  <ArrowsPointingOutIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


import { useState, useRef, useCallback, useEffect } from "react"

interface ProgressBarProps {
  currentTime: number
  duration: number
  onChange: (time: number) => void
}

export default function ProgressBar({ currentTime, duration, onChange }: ProgressBarProps) {
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1)
    const newTime = percent * duration
    onChange(newTime)
  }, [duration, onChange])

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
    document.body.style.userSelect = ''
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [isDragging, handlePointerMove, handlePointerUp])

  return (
    <div
      ref={containerRef}
      className="relative group cursor-pointer"
      onPointerDown={(e) => {
        setIsDragging(true)
        document.body.style.userSelect = 'none'
        const rect = containerRef.current?.getBoundingClientRect()
        if (rect) {
          const percent = (e.clientX - rect.left) / rect.width
          onChange(percent * duration)
        }
      }}
    >
      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full relative"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md transform translate-x-1/2 opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  )
}
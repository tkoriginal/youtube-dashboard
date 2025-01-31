import { useState, useRef, useCallback, useEffect } from "react"

interface RangeSliderProps {
    min: number
    max: number
    start: number
    end?: number
    onChange: (values: { start: number; end?: number }) => void
}

export default function RangeSlider({ min, max, start, end, onChange }: RangeSliderProps) {
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
                onChange({ start: Math.floor(value), end })
            }
        } else {
            if (value > start) {
                onChange({ start, end: Math.floor(value) })
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
        <div ref={sliderRef} className="relative h-3 w-full group">
            <div className="absolute w-full h-full bg-gray-700 rounded-full" />
            <div
                className="absolute h-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full"
                style={{
                    left: `${startPercent}%`,
                    right: `${100 - endPercent}%`
                }}
            />
            <div
                onPointerDown={() => handlePointerDown('start')}
                className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white 
                     border-4 border-blue-500 cursor-pointer hover:scale-125 
                     transition-transform shadow-lg flex items-center justify-center"
                style={{ left: `calc(${startPercent}% - 12px)` }}
            >
                <div className="w-1 h-3 bg-blue-500 rounded-full" />
            </div>
            <div
                onPointerDown={() => handlePointerDown('end')}
                className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white 
                     border-4 border-purple-500 cursor-pointer hover:scale-125 
                     transition-transform shadow-lg flex items-center justify-center"
                style={{ left: `calc(${endPercent}% - 12px)` }}
            >
                <div className="w-1 h-3 bg-purple-500 rounded-full" />
            </div>
        </div>
    )
}
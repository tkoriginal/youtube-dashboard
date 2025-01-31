import { useVideo } from "@/context/VideoContext"
import { Video } from "@/types"

interface VideoCardProps {
    video: Video
}

export default function VideoCard({ video }: VideoCardProps) {
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